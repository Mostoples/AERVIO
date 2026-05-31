/**
 * aggregateRealtime — Firestore trigger on sensor_data write.
 * --------------------------------------------------------------
 * Maintains a 60-second rolling stat window per user at:
 *   users/{uid}/realtime/current  (HR avg/std, PM2.5 avg/max, sleep flag).
 *
 * Implementation:
 *  - On every new sensor_data doc, push (ts, hr, pm25, ...) into a small
 *    "ring buffer" inside users/{uid}/realtime/current.frames (max 120).
 *  - Re-compute stats over the frames whose ts is within last 60s.
 *  - Sleep estimate = heuristic: hr < user_resting + 6 AND hum > 40 AND
 *    accel near zero (placeholder).
 *
 * Trigger path: sensor_data/{uid}/{date}/{frameId}
 */
'use strict';

const WINDOW_MS = 60 * 1000;
const MAX_FRAMES = 120;

function avg(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
function std(xs) {
  if (xs.length < 2) return null;
  const m = avg(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

module.exports = (regional, admin) => regional
  .firestore
  .document('sensor_data/{uid}/{date}/{frameId}')
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    const frame = snap.data() || {};
    const now = Date.now();

    const rtRef = admin.firestore()
      .collection('users').doc(uid)
      .collection('realtime').doc('current');

    // Transactional read-modify-write to keep ring buffer consistent.
    await admin.firestore().runTransaction(async (tx) => {
      const cur = await tx.get(rtRef);
      const existing = (cur.exists && cur.data().frames) || [];
      const next = [...existing, {
        ts: typeof frame.ts === 'number' ? frame.ts : now,
        hr: frame.hr ?? null,
        pm25: frame.pm25 ?? null,
        spo2: frame.spo2 ?? null,
      }].slice(-MAX_FRAMES);

      const cutoff = now - WINDOW_MS;
      const recent = next.filter((f) => f.ts >= cutoff);
      const hrs = recent.map((f) => f.hr).filter((v) => typeof v === 'number');
      const pms = recent.map((f) => f.pm25).filter((v) => typeof v === 'number');
      const sps = recent.map((f) => f.spo2).filter((v) => typeof v === 'number');

      const hr_avg = avg(hrs);
      // Crude sleep proxy — refine when accel/IMU is wired.
      const sleeping = hr_avg != null && hr_avg < 60;

      tx.set(rtRef, {
        uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        window_ms: WINDOW_MS,
        frames: next,
        stats: {
          hr_avg, hr_std: std(hrs),
          pm25_avg: avg(pms), pm25_max: pms.length ? Math.max(...pms) : null,
          spo2_avg: avg(sps), spo2_min: sps.length ? Math.min(...sps) : null,
          n_frames: recent.length,
          sleeping,
        },
      }, { merge: true });
    });
    return null;
  });
