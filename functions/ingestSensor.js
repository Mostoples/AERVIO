/**
 * ingestSensor — HTTPS callable.
 * --------------------------------------------------------------
 * Accepts a sensor frame from authenticated user / paired device:
 *   { device_id, ts, ppg, hr, spo2, pm25, pm10, temp, hum, uv, battery }
 *
 * Validation:
 *   - Auth required (callable: context.auth.uid).
 *   - Per-field range checks (rejects with INVALID_ARGUMENT).
 *   - Timestamp clamped to ±10min from server time (anti-replay).
 *
 * Write path: sensor_data/{uid}/{YYYY-MM-DD}/{autoId}
 *   (subcollection per date — keeps daily aggregation cheap, lets retention
 *   policy drop whole sub-doc chunks at 90 days.)
 *
 * Returns: { ok, id, ts }
 */
'use strict';

// Per-field validator. Returns null if OK, else error string.
function validate(p) {
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  if (!p || typeof p !== 'object') return 'payload must be object';
  if (typeof p.device_id !== 'string' || !p.device_id) return 'device_id required';

  const ranges = {
    hr:      [20, 240],   // bpm
    spo2:    [50, 100],   // %
    pm25:    [0, 1000],   // µg/m³
    pm10:    [0, 2000],
    temp:    [-20, 60],   // °C ambient or skin
    hum:     [0, 100],    // %
    uv:      [0, 20],     // UV index
    battery: [0, 100],    // %
  };
  for (const [k, [lo, hi]] of Object.entries(ranges)) {
    if (p[k] == null) continue; // optional
    if (!num(p[k]) || p[k] < lo || p[k] > hi) return `${k} out of range [${lo}, ${hi}]`;
  }
  if (p.ppg != null && !Array.isArray(p.ppg)) return 'ppg must be array';
  return null;
}

function dateKey(ms) {
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = (regional, admin) => regional.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new (require('firebase-functions')).https.HttpsError(
      'unauthenticated', 'Sign-in required to ingest sensor data.'
    );
  }
  const err = validate(data);
  if (err) {
    throw new (require('firebase-functions')).https.HttpsError('invalid-argument', err);
  }

  const uid = context.auth.uid;
  const now = Date.now();
  let ts = typeof data.ts === 'number' ? data.ts : now;
  // Anti-replay: clamp to ±10min from server.
  if (Math.abs(ts - now) > 10 * 60 * 1000) ts = now;

  const doc = {
    uid,
    device_id: data.device_id,
    ts,
    serverTs: admin.firestore.FieldValue.serverTimestamp(),
    hr:      data.hr      ?? null,
    spo2:    data.spo2    ?? null,
    pm25:    data.pm25    ?? null,
    pm10:    data.pm10    ?? null,
    temp:    data.temp    ?? null,
    hum:     data.hum     ?? null,
    uv:      data.uv      ?? null,
    battery: data.battery ?? null,
    // PPG raw samples can be large; cap to 1024 floats.
    ppg: Array.isArray(data.ppg) ? data.ppg.slice(0, 1024) : null,
  };

  const dk = dateKey(ts);
  const ref = admin.firestore()
    .collection('sensor_data').doc(uid)
    .collection(dk).doc();

  await ref.set(doc);
  return { ok: true, id: ref.id, ts, date: dk };
});
