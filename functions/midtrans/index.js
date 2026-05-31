/**
 * AERVINEX — Midtrans Integration (Cloud Functions)
 * ----------------------------------------------------------------
 * Region   : asia-southeast2 (Jakarta) — co-located w/ Firestore.
 * Builder  : (functionsRegional, admin) => { createSubscription, cancelSubscription, startTrial }
 *
 * Endpoints (HTTPS):
 *   - createSubscription  : POST { plan: 'pro'|'family', variant?: 'A'|'B' }
 *                           → { snapToken, redirectUrl, orderId }
 *   - cancelSubscription  : POST {} → { ok }
 *
 * Helper (internal):
 *   - startTrial(uid)     : set subscriptions/{uid}.trial_until = now + 7d
 *
 * ENV (set via `firebase functions:config:set midtrans.server_key=... midtrans.client_key=...`):
 *   - midtrans.server_key  (server-side, kept secret)
 *   - midtrans.client_key  (public-safe — used by snap.js)
 *   - midtrans.is_production (default false)
 *
 * Midtrans Snap docs : https://docs.midtrans.com/reference/snap-api
 *
 * Plans price (must mirror frontend AB test default — see pricing-ab.js):
 *   pro    : Rp 49.000 / bulan
 *   family : Rp 149.000 / bulan
 */
'use strict';

const PLAN_PRICES = {
  pro: { base: 49000, name: 'AERVINEX Pro — Monthly' },
  family: { base: 149000, name: 'AERVINEX Family — Monthly (6 akun)' },
};

const VARIANT_MULTIPLIER = {
  A: 1.0,    // control
  B: 1.20,   // +20% (Rp 59k for Pro, Rp 179k for Family — see pricing-ab.js)
};

function newOrderId(uid, plan) {
  return `aervx-${plan}-${uid.slice(0, 6)}-${Date.now().toString(36)}`;
}

function computeGrossAmount(plan, variant) {
  const base = PLAN_PRICES[plan]?.base;
  if (!base) throw new Error('Invalid plan: ' + plan);
  const mult = VARIANT_MULTIPLIER[variant] || 1.0;
  return Math.round(base * mult);
}

function getMidtransConfig() {
  const cfg = (typeof require !== 'undefined') ? (require('firebase-functions').config()?.midtrans || {}) : {};
  return {
    serverKey: cfg.server_key || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-PLACEHOLDER',
    clientKey: cfg.client_key || process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-PLACEHOLDER',
    isProduction: (cfg.is_production === 'true' || cfg.is_production === true) || false,
  };
}

/**
 * Lazy-load midtrans-client to keep cold-start fast.
 * Add to functions/package.json deps: "midtrans-client": "^1.3.1"
 */
function getSnap() {
  let MidtransClient;
  try {
    MidtransClient = require('midtrans-client');
  } catch (e) {
    throw new Error('midtrans-client not installed. Run: npm i midtrans-client');
  }
  const { serverKey, clientKey, isProduction } = getMidtransConfig();
  return new MidtransClient.Snap({ isProduction, serverKey, clientKey });
}

/**
 * Verify Firebase ID token from Authorization: Bearer <token>
 */
async function verifyAuth(req, admin) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new Error('Missing Authorization header');
  const decoded = await admin.auth().verifyIdToken(m[1]);
  return decoded;
}

/**
 * Start a 7-day trial for user (idempotent).
 * subscriptions/{uid} = { plan: 'pro', status: 'trial', trial_until, ... }
 */
async function startTrial(uid, plan, admin) {
  const db = admin.firestore();
  const ref = db.collection('subscriptions').doc(uid);
  const now = admin.firestore.FieldValue.serverTimestamp();
  const trial_until = new Date(Date.now() + 7 * 86400000);
  await ref.set({
    uid,
    plan: plan || 'pro',
    status: 'trial',
    trial_until,
    started_at: now,
    auto_renew: true,
    payment_provider: 'midtrans',
    updated_at: now,
  }, { merge: true });
  return { trial_until };
}

// ── HTTP: createSubscription ─────────────────────────────────────────────
function buildCreateSubscription(regional, admin) {
  return regional.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
      const decoded = await verifyAuth(req, admin);
      const uid = decoded.uid;
      const { plan = 'pro', variant = 'A' } = req.body || {};
      if (!PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' });

      // Free trial for first-time Pro users
      const subRef = admin.firestore().collection('subscriptions').doc(uid);
      const subSnap = await subRef.get();
      const hasTrialedBefore = subSnap.exists && subSnap.data().has_trialed;

      if (plan === 'pro' && !hasTrialedBefore) {
        await startTrial(uid, 'pro', admin);
        await subRef.set({ has_trialed: true }, { merge: true });
        return res.status(200).json({
          ok: true,
          trial: true,
          message: '7-day free trial activated',
          snapToken: null,
          redirectUrl: '/dashboard.html?trial=1',
        });
      }

      const grossAmount = computeGrossAmount(plan, variant);
      const orderId = newOrderId(uid, plan);

      const snap = getSnap();
      const parameter = {
        transaction_details: { order_id: orderId, gross_amount: grossAmount },
        item_details: [{
          id: plan,
          price: grossAmount,
          quantity: 1,
          name: PLAN_PRICES[plan].name,
          category: 'subscription',
        }],
        customer_details: {
          first_name: decoded.name || 'AERVINEX User',
          email: decoded.email || 'noreply@aervinex.web.app',
        },
        credit_card: { secure: true },
        callbacks: { finish: 'https://aervinex.web.app/subscription.html' },
        custom_field1: uid,
        custom_field2: plan,
        custom_field3: variant,
      };

      const txn = await snap.createTransaction(parameter);

      // Persist pending order
      await admin.firestore().collection('payment_orders').doc(orderId).set({
        uid, plan, variant,
        order_id: orderId,
        gross_amount: grossAmount,
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        ok: true,
        orderId,
        snapToken: txn.token,
        redirectUrl: txn.redirect_url,
        grossAmount,
      });
    } catch (e) {
      console.error('[createSubscription] error', e);
      return res.status(500).json({ error: e.message || 'internal error' });
    }
  });
}

// ── HTTP: cancelSubscription ─────────────────────────────────────────────
function buildCancelSubscription(regional, admin) {
  return regional.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
      const decoded = await verifyAuth(req, admin);
      const uid = decoded.uid;
      const ref = admin.firestore().collection('subscriptions').doc(uid);
      await ref.set({
        auto_renew: false,
        cancel_requested_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'canceled',
      }, { merge: true });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('[cancelSubscription] error', e);
      return res.status(500).json({ error: e.message });
    }
  });
}

// Exposed builder
module.exports = function buildMidtransModule(regional, admin) {
  return {
    createSubscription: buildCreateSubscription(regional, admin),
    cancelSubscription: buildCancelSubscription(regional, admin),
    startTrial,        // internal helper
    PLAN_PRICES,
    computeGrossAmount,
  };
};
