/**
 * AERVINEX — Midtrans Payment Webhook Handler
 * ----------------------------------------------------------------
 * Endpoint  : POST /midtransWebhook
 * Region    : asia-southeast2
 *
 * Midtrans notification payload reference:
 *   https://docs.midtrans.com/reference/notification-handling
 *
 * Signature validation:
 *   sha512(order_id + status_code + gross_amount + server_key) === signature_key
 *
 * Transaction status mapping:
 *   capture / settlement   → 'active'    (paid, grant access)
 *   pending                → 'pending'
 *   deny / cancel / expire → 'failed' or 'expired'
 *   refund / chargeback    → 'refunded'
 *
 * Side effects:
 *   - Update payment_orders/{orderId}.status
 *   - Update subscriptions/{uid} with plan + expiry (30 days from settlement)
 *   - Emit FCM push (success/failed) via existing sendAlert flow (best effort)
 */
'use strict';

const crypto = require('crypto');

function computeSignature(order_id, status_code, gross_amount, server_key) {
  return crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${server_key}`)
    .digest('hex');
}

function mapStatus(transaction_status, fraud_status) {
  if (transaction_status === 'capture') {
    if (fraud_status === 'challenge') return 'pending';
    if (fraud_status === 'accept') return 'active';
    return 'active';
  }
  if (transaction_status === 'settlement') return 'active';
  if (transaction_status === 'pending')    return 'pending';
  if (transaction_status === 'deny')       return 'failed';
  if (transaction_status === 'cancel')     return 'canceled';
  if (transaction_status === 'expire')     return 'expired';
  if (transaction_status === 'refund' || transaction_status === 'chargeback') return 'refunded';
  return 'unknown';
}

module.exports = function buildWebhook(regional, admin) {
  return regional.https.onRequest(async (req, res) => {
    // Midtrans uses POST application/json
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'POST only' });
    }
    try {
      const notif = req.body || {};
      const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        fraud_status,
        payment_type,
        custom_field1: uid,
        custom_field2: plan,
        custom_field3: variant,
      } = notif;

      // ── Signature validation ──
      const cfg = require('firebase-functions').config()?.midtrans || {};
      const serverKey = cfg.server_key || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-PLACEHOLDER';
      const expected = computeSignature(order_id, status_code, gross_amount, serverKey);
      if (signature_key && expected !== signature_key) {
        console.warn('[midtransWebhook] signature mismatch', { order_id });
        // In production: reject. In sandbox/dev allow with warning.
        if (cfg.is_production === true || cfg.is_production === 'true') {
          return res.status(403).json({ error: 'Invalid signature' });
        }
      }

      const status = mapStatus(transaction_status, fraud_status);
      const db = admin.firestore();
      const now = admin.firestore.FieldValue.serverTimestamp();

      // ── Update payment_orders ──
      await db.collection('payment_orders').doc(order_id).set({
        order_id,
        status,
        midtrans_transaction_status: transaction_status,
        midtrans_fraud_status: fraud_status,
        payment_type,
        gross_amount: parseFloat(gross_amount) || 0,
        updated_at: now,
        last_notification: notif,
      }, { merge: true });

      // ── Update subscriptions/{uid} ──
      if (uid) {
        const subRef = db.collection('subscriptions').doc(uid);
        const patch = {
          uid, plan: plan || 'pro', variant: variant || 'A',
          status,
          last_order_id: order_id,
          last_payment_type: payment_type,
          updated_at: now,
          payment_provider: 'midtrans',
        };
        if (status === 'active') {
          patch.expiry = new Date(Date.now() + 30 * 86400000);
          patch.last_paid_at = now;
          patch.auto_renew = true;
        }
        await subRef.set(patch, { merge: true });

        // ── Best-effort push notification ──
        try {
          await db.collection('alerts').add({
            uid,
            type: status === 'active' ? 'payment_success' : 'payment_' + status,
            severity: status === 'active' ? 'info' : 'warning',
            title: status === 'active' ? 'Pembayaran AERVINEX berhasil' : `Pembayaran ${status}`,
            body: status === 'active'
              ? `Plan ${plan?.toUpperCase()} aktif sampai ${new Date(Date.now() + 30 * 86400000).toLocaleDateString('id-ID')}.`
              : `Status pembayaran: ${status}. Order ${order_id}.`,
            created_at: now,
            channels: ['fcm', 'inapp'],
          });
        } catch (e) {
          console.warn('[midtransWebhook] alert dispatch failed', e.message);
        }
      }

      return res.status(200).json({ ok: true, status });
    } catch (e) {
      console.error('[midtransWebhook] error', e);
      return res.status(500).json({ error: e.message });
    }
  });
};
