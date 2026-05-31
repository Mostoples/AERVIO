/**
 * computeRisk — HTTPS callable.
 * --------------------------------------------------------------
 * Server-side echo of public/js/ml-client.js calibrated proxy for the
 * subset of risks that don't need raw waveforms: takes a recent sensor
 * window plus user context, returns calibrated risk_pct + label per risk.
 *
 * Inputs (data):
 *   {
 *     window: [{ ts, hr, spo2, pm25, pm10, temp, hum, uv }, ...],  // last N frames
 *     risks:  ['asma','copd','hipoksia',...]                       // ids to score
 *     ctx:    { age, sex, history: { asthma?, copd? } }            // optional
 *   }
 *
 * Output: { ok, scores: { [riskId]: { risk_pct, label, confidence } } }
 *
 * Notes:
 *  - This is a thin port of the in-browser proxy so callable from anywhere
 *    (e.g. scheduled jobs, paired Garmin device webhook).
 *  - Calibration map is duplicated here to avoid bundling the 1500-line client.
 *  - For "afib" / waveform-driven risks, we return null and let the client
 *    run the ONNX model locally (public/models/afib.onnx). Server-side ONNX
 *    is deferred (would need onnxruntime-node + model artifact).
 */
'use strict';

// Subset of calibration map from ml/local-test/calibration-map.json.
const CAL = {
  'asma':            { t: 0.26, a: 0.3, b: -1.4 },
  'ispa':            { t: 0.28, a: 0.3, b: -1.2 },
  'copd':            { t: 0.42, a: 0.3, b: -0.6 },
  'hipoksia':        { t: 0.28, a: 0.3, b: -1.4 },
  'heatstroke':      { t: 0.38, a: 0.3, b: -0.6 },
  'kelelahan-panas': { t: 0.40, a: 0.3, b: -0.8 },
  'dehidrasi':       { t: 0.38, a: 0.3, b: -0.8 },
  'sunburn':         { t: 0.28, a: 0.3, b: -1.0 },
  'pneumonia':       { t: 0.36, a: 0.3, b: -1.0 },
  'bronchitis':      { t: 0.24, a: 0.3, b: -1.4 },
  'bradikardia':     { t: 0.26, a: 0.3, b: -1.4 },
  'takikardia':      { t: 0.16, a: 0.3, b: -1.8 },
  'demam':           { t: 0.18, a: 0.3, b: -1.4 },
  'hipotermia':      { t: 0.58, a: 0.3, b: 0.2 },
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const sig = (x) => 1 / (1 + Math.exp(-x));

function calibrate(riskId, rawPct) {
  const cal = CAL[riskId];
  if (!cal) return { risk_pct: rawPct };
  const p = clamp(rawPct, 0.001, 0.999) / 100;
  const logit = Math.log(p / (1 - p));
  const cp = sig(cal.a * logit + cal.b) * 100;
  return { risk_pct: cp, threshold_pct: cal.t * 100 };
}

// Aggregate sensor window: returns averages + maxes used by the proxies.
function summarize(win) {
  if (!Array.isArray(win) || !win.length) return {};
  const avg = (k) => {
    const xs = win.map((f) => f[k]).filter((v) => typeof v === 'number');
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  };
  const max = (k) => {
    const xs = win.map((f) => f[k]).filter((v) => typeof v === 'number');
    return xs.length ? Math.max(...xs) : null;
  };
  return {
    hr_avg: avg('hr'), hr_max: max('hr'),
    spo2_avg: avg('spo2'), spo2_min: avg('spo2'),
    pm25_avg: avg('pm25'), pm25_max: max('pm25'),
    pm10_avg: avg('pm10'),
    temp_avg: avg('temp'), temp_max: max('temp'),
    hum_avg: avg('hum'),
    uv_max: max('uv'),
  };
}

// Risk scorers — kept identical in spirit to public/js/ml-client.js.
function scoreAsma(s) {
  const pm = clamp(((s.pm25_avg ?? 15) - 15) / 100, 0, 1);
  const spo = clamp((97 - (s.spo2_avg ?? 97)) / 6, 0, 1);
  const raw = pm * 0.55 + spo * 0.45;
  return sig((raw - 0.3) * 3.5) * 100;
}
function scoreCOPD(s)        { return scoreAsma(s) * 0.85; }
function scoreISPA(s)        { return scoreAsma(s) * 0.95; }
function scoreHipoksia(s)    { return clamp((96 - (s.spo2_avg ?? 97)) / 8, 0, 1) * 100; }
function scoreHeatstroke(s)  {
  const t = clamp(((s.temp_max ?? 30) - 33) / 8, 0, 1);
  const h = clamp(((s.hum_avg ?? 50) - 60) / 30, 0, 1);
  return sig((t * 0.65 + h * 0.35 - 0.3) * 4) * 100;
}
function scoreDehidrasi(s) {
  const hr = clamp(((s.hr_avg ?? 75) - 80) / 30, 0, 1);
  const t  = clamp(((s.temp_max ?? 30) - 30) / 8, 0, 1);
  return sig((hr * 0.45 + t * 0.55 - 0.3) * 3.5) * 100;
}
function scoreSunburn(s)     { return clamp(((s.uv_max ?? 3) - 5) / 6, 0, 1) * 100; }
function scoreBradikardia(s) { return clamp((50 - (s.hr_avg ?? 75)) / 15, 0, 1) * 100; }
function scoreTakikardia(s)  { return clamp(((s.hr_avg ?? 75) - 100) / 40, 0, 1) * 100; }
function scoreDemam(s)       { return clamp(((s.temp_avg ?? 36.8) - 37.5) / 2, 0, 1) * 100; }
function scoreHipotermia(s)  { return clamp((35.0 - (s.temp_avg ?? 36.8)) / 3, 0, 1) * 100; }

const SCORERS = {
  asma: scoreAsma, ispa: scoreISPA, copd: scoreCOPD,
  hipoksia: scoreHipoksia, heatstroke: scoreHeatstroke,
  'kelelahan-panas': scoreHeatstroke, dehidrasi: scoreDehidrasi,
  sunburn: scoreSunburn,
  pneumonia: scoreISPA, bronchitis: scoreAsma,
  bradikardia: scoreBradikardia, takikardia: scoreTakikardia,
  demam: scoreDemam, hipotermia: scoreHipotermia,
};

module.exports = (regional, admin) => regional.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new (require('firebase-functions')).https.HttpsError(
      'unauthenticated', 'Sign-in required.'
    );
  }
  const window = Array.isArray(data?.window) ? data.window : [];
  const risks = Array.isArray(data?.risks) ? data.risks : Object.keys(SCORERS);
  const s = summarize(window);

  const scores = {};
  for (const id of risks) {
    const fn = SCORERS[id];
    if (!fn) { scores[id] = null; continue; }
    const raw = fn(s);
    const cal = calibrate(id, raw);
    scores[id] = {
      risk_pct: Math.round(cal.risk_pct * 10) / 10,
      threshold_pct: cal.threshold_pct,
      confidence: 0.8,
    };
  }
  // Audit log (best-effort).
  try {
    await admin.firestore().collection('xai_audit').add({
      uid: context.auth.uid,
      fn: 'computeRisk',
      ts: admin.firestore.FieldValue.serverTimestamp(),
      n_frames: window.length,
      risks,
    });
  } catch (_) { /* ignore */ }
  return { ok: true, scores, summary: s };
});
