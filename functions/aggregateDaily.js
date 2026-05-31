/**
 * aggregateDaily — Pub/Sub cron, runs once every 24 hours.
 * --------------------------------------------------------------
 * For each user with sensor_data yesterday:
 *   - Aggregate HR (avg/min/max), SpO2 (avg/min), PM2.5 (avg/max),
 *     temp/hum/uv (avg/max), step count proxy (TBD), sleep window estimate.
 *   - Write to daily_summary/{uid}/{YYYY-MM-DD}
 *   - Retention: keep 365 days (see docs/data-retention-policy.md)
 *
 * Cron: every 24 hours, 02:00 Asia/Jakarta.
 */
'use strict';

function isoYesterdayJakarta() {
  // Jakarta = UTC+7. We want "yesterday" in local civil time.
  const nowUtcMs = Date.now();
  const jktMs = nowUtcMs + 7 * 3600 * 1000;
  const y = new Date(jktMs - 24 * 3600 * 1000);
  const yyyy = y.getUTCFullYear();
  const mm = String(y.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(y.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function statsFrom(docs) {
  const acc = {};
  const fields = ['hr', 'spo2', 'pm25', 'pm10', 'temp', 'hum', 'uv'];
  for (const f of fields) acc[f] = [];
  for (const d of docs) {
    const v = d.data();
    for (const f of fields) if (typeof v[f] === 'number') acc[f].push(v[f]);
  }
  const out = { samples: docs.length };
  for (const f of fields) {
    const xs = acc[f];
    if (!xs.length) { out[f] = null; continue; }
    const sum = xs.reduce((a, b) => a + b, 0);
    out[f] = {
      avg: sum / xs.length,
      min: Math.min(...xs),
      max: Math.max(...xs),
      n: xs.length,
    };
  }
  return out;
}

module.exports = (regional, admin) => regional
  .pubsub.schedule('every 24 hours')
  .timeZone('Asia/Jakarta')
  .onRun(async () => {
    const db = admin.firestore();
    const date = isoYesterdayJakarta();

    // List users by walking sensor_data parent docs (one doc per uid).
    const usersSnap = await db.collection('sensor_data').listDocuments();
    let processed = 0, skipped = 0;

    for (const userDoc of usersSnap) {
      const uid = userDoc.id;
      const daySnap = await db
        .collection('sensor_data').doc(uid)
        .collection(date)
        .get();
      if (daySnap.empty) { skipped++; continue; }

      const summary = statsFrom(daySnap.docs);
      summary.uid = uid;
      summary.date = date;
      summary.computedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection('daily_summary').doc(uid)
        .collection('days').doc(date)
        .set(summary, { merge: true });
      processed++;
    }
    console.log(`[aggregateDaily] date=${date} processed=${processed} skipped=${skipped}`);
    return { date, processed, skipped };
  });
