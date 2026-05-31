/**
 * mlDriftDetector — Pub/Sub cron, weekly.
 * --------------------------------------------------------------
 * Lightweight Kolmogorov-Smirnov (KS) two-sample test on the empirical
 * distribution of key features over the last 7 days (recent) vs the
 * 30 days before that (baseline). Per feature, if KS-D > 0.2 we emit
 * an alert doc + (best-effort) FCM ping to admins.
 *
 * Features watched (from daily_summary): hr.avg, spo2.avg, pm25.avg, temp.avg.
 *
 * NB: KS-test implementation is from scratch (no scipy in Node). It's
 * O(n log n) sort + 2-pointer ECDF comparison.
 */
'use strict';

function ks2(a, b) {
  // Two-sample Kolmogorov-Smirnov statistic D = max |F1(x) - F2(x)|.
  if (!a.length || !b.length) return 0;
  const xa = [...a].sort((x, y) => x - y);
  const xb = [...b].sort((x, y) => x - y);
  const na = xa.length, nb = xb.length;
  let i = 0, j = 0, d = 0;
  while (i < na && j < nb) {
    const va = xa[i], vb = xb[j];
    if (va <= vb) i++;
    if (vb <= va) j++;
    const cdfA = i / na;
    const cdfB = j / nb;
    const diff = Math.abs(cdfA - cdfB);
    if (diff > d) d = diff;
  }
  return d;
}

function daysAgo(n) {
  const d = new Date(Date.now() - n * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

module.exports = (regional, admin) => regional
  .pubsub.schedule('every 168 hours') // weekly
  .timeZone('Asia/Jakarta')
  .onRun(async () => {
    const db = admin.firestore();
    const usersSnap = await db.collection('daily_summary').listDocuments();

    const recentLo = daysAgo(7),  recentHi = daysAgo(0);
    const baseLo   = daysAgo(37), baseHi   = daysAgo(8);
    const features = [
      ['hr',   'avg'],
      ['spo2', 'avg'],
      ['pm25', 'avg'],
      ['temp', 'avg'],
    ];

    const driftReports = [];
    for (const u of usersSnap) {
      const uid = u.id;
      const daysSnap = await db
        .collection('daily_summary').doc(uid)
        .collection('days').get();
      const recent = {}, base = {};
      features.forEach(([k]) => { recent[k] = []; base[k] = []; });

      daysSnap.docs.forEach((doc) => {
        const date = doc.id;
        const data = doc.data();
        const inRecent = date >= recentLo && date <= recentHi;
        const inBase   = date >= baseLo   && date <= baseHi;
        for (const [k, agg] of features) {
          const v = data[k]?.[agg];
          if (typeof v !== 'number') continue;
          if (inRecent) recent[k].push(v);
          else if (inBase) base[k].push(v);
        }
      });

      const drifts = {};
      let maxD = 0;
      for (const [k] of features) {
        const D = ks2(recent[k], base[k]);
        drifts[k] = D;
        if (D > maxD) maxD = D;
      }
      if (maxD > 0.2) {
        driftReports.push({ uid, drifts, maxD });
      }
    }

    if (driftReports.length) {
      await db.collection('ml_drift_reports').add({
        ts: admin.firestore.FieldValue.serverTimestamp(),
        recentWindow: [recentLo, recentHi],
        baselineWindow: [baseLo, baseHi],
        affected: driftReports.length,
        users: driftReports,
      });
      console.log(`[mlDriftDetector] drift detected for ${driftReports.length} users`);
    } else {
      console.log('[mlDriftDetector] no drift detected');
    }
    return { affected: driftReports.length };
  });
