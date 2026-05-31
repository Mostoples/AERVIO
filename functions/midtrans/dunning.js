/**
 * AERVINEX — Dunning Management (Cloud Scheduler / Pub/Sub Cron)
 * ----------------------------------------------------------------
 * Schedule  : every 24h at 09:00 Asia/Jakarta
 * Region    : asia-southeast2
 *
 * Goal:
 *   Recover failed/expired payments with a 3-step dunning campaign.
 *   1 day after expiry  → soft reminder (FCM push)
 *   3 days after expiry → email reminder + downgrade warning
 *   7 days after expiry → final notice, auto-downgrade to FREE
 *
 * Data model:
 *   subscriptions/{uid}.status in ('expired','failed','past_due')
 *   subscriptions/{uid}.expiry < now
 *   subscriptions/{uid}.dunning_sent = { d1: ts, d3: ts, d7: ts }
 *
 * Email delivery: SendGrid (placeholder env: sendgrid.api_key).
 * Push delivery: FCM via admin.messaging() — reuses existing fcm tokens.
 */
'use strict';

const DAY = 86400000;

const TEMPLATES = {
  d1: {
    subject: '⚠ Langganan AERVINEX Anda kedaluwarsa kemarin',
    body: 'Halo {{name}},\n\nLangganan Pro Anda kedaluwarsa kemarin. Perpanjang sekarang agar tidak kehilangan akses ke 35 risk score, EPO Running Engine, dan history 1 tahun.\n\nKlik di sini: https://aervinex.web.app/subscription.html\n\nSalam,\nTim AERVINEX',
    pushTitle: 'Langganan kedaluwarsa kemarin',
    pushBody: 'Perpanjang Pro untuk lanjut akses fitur lengkap.',
  },
  d3: {
    subject: 'Langganan AERVINEX akan auto-downgrade dalam 4 hari',
    body: 'Halo {{name}},\n\nLangganan Anda telah expired 3 hari. Dalam 4 hari ke depan, akun otomatis turun ke Free dan history >30 hari akan terkunci.\n\nPertahankan akses Pro: https://aervinex.web.app/subscription.html\n\nButuh bantuan? Reply email ini.',
    pushTitle: 'Pro akan auto-downgrade 4 hari lagi',
    pushBody: 'Perpanjang sebelum kehilangan akses ke fitur premium.',
  },
  d7: {
    subject: 'Akun AERVINEX Anda telah turun ke Free',
    body: 'Halo {{name}},\n\nLangganan Pro telah expired >7 hari, akun otomatis turun ke Free. Data tersimpan aman, tapi fitur premium tidak lagi tersedia.\n\nLangganan ulang kapan saja: https://aervinex.web.app/subscription.html',
    pushTitle: 'Akun turun ke Free',
    pushBody: 'Aktifkan kembali Pro untuk akses fitur premium.',
  },
};

function pickStage(expiredAtMs, dunningSent = {}) {
  const ageMs = Date.now() - expiredAtMs;
  if (ageMs >= 7 * DAY && !dunningSent.d7) return 'd7';
  if (ageMs >= 3 * DAY && !dunningSent.d3) return 'd3';
  if (ageMs >= 1 * DAY && !dunningSent.d1) return 'd1';
  return null;
}

async function sendPush(admin, uid, title, body) {
  try {
    // Lookup tokens at users/{uid}/fcm_tokens/{tokenId}
    const tokSnap = await admin.firestore()
      .collection('users').doc(uid).collection('fcm_tokens').get();
    const tokens = tokSnap.docs.map(d => d.id).filter(Boolean);
    if (!tokens.length) return false;
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { kind: 'dunning' },
    });
    return true;
  } catch (e) {
    console.warn('[dunning] push failed', e.message);
    return false;
  }
}

async function sendEmail(_admin, _email, _subject, _body) {
  // Stub: integrate SendGrid here.
  // const sg = require('@sendgrid/mail');
  // sg.setApiKey(functions.config().sendgrid.api_key);
  // return sg.send({ to: email, from: 'noreply@aervinex.web.app', subject, text: body });
  console.log('[dunning] (stub) email would be sent to', _email, _subject);
  return false;
}

async function downgradeToFree(admin, uid) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().collection('subscriptions').doc(uid).set({
    plan: 'free',
    status: 'inactive',
    auto_renew: false,
    downgraded_at: now,
    updated_at: now,
  }, { merge: true });
}

async function processSubscription(admin, doc) {
  const d = doc.data();
  const uid = doc.id;
  const expiryTs = d.expiry ? (d.expiry.toMillis ? d.expiry.toMillis() : new Date(d.expiry).getTime()) : null;
  if (!expiryTs || expiryTs > Date.now()) return null;            // not expired
  if (!['expired', 'failed', 'past_due', 'canceled'].includes(d.status) && expiryTs > Date.now()) return null;

  const stage = pickStage(expiryTs, d.dunning_sent || {});
  if (!stage) return null;
  const tpl = TEMPLATES[stage];

  // Fetch user profile for name + email
  let name = 'Pengguna', email = null;
  try {
    const u = await admin.firestore().collection('users').doc(uid).get();
    if (u.exists) { name = u.data().name || name; email = u.data().email || null; }
  } catch {}

  const subject = tpl.subject.replace('{{name}}', name);
  const body = tpl.body.replace('{{name}}', name);

  const pushed = await sendPush(admin, uid, tpl.pushTitle, tpl.pushBody);
  const mailed = email ? await sendEmail(admin, email, subject, body) : false;

  const patch = {
    dunning_sent: { ...(d.dunning_sent || {}), [stage]: new Date() },
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (stage === 'd7') {
    await downgradeToFree(admin, uid);
  }
  await doc.ref.set(patch, { merge: true });

  return { uid, stage, pushed, mailed };
}

module.exports = function buildDunning(regional, admin) {
  // Pub/Sub scheduled function — Asia/Jakarta 09:00 daily
  return regional.pubsub.schedule('every day 09:00').timeZone('Asia/Jakarta').onRun(async () => {
    const db = admin.firestore();
    // Query candidate expired subscriptions
    const snap = await db.collection('subscriptions')
      .where('status', 'in', ['expired', 'failed', 'past_due', 'canceled'])
      .limit(500).get();

    const results = [];
    for (const doc of snap.docs) {
      try {
        const r = await processSubscription(admin, doc);
        if (r) results.push(r);
      } catch (e) {
        console.warn('[dunning] error on', doc.id, e.message);
      }
    }
    console.log(`[dunning] processed ${results.length} expired subs`,
                results.reduce((acc, r) => (acc[r.stage] = (acc[r.stage] || 0) + 1, acc), {}));
    return null;
  });
};
