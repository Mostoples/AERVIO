/* Calibration Optimizer — finds optimal per-model threshold + steepness
   to maximize F1 while keeping AUC. Outputs JSON calibration map.

   Strategy:
   1. Run proxy on N=5000 samples per model (deterministic, seed=42).
   2. For each model, sweep threshold in [0.05, 0.95] step 0.01.
   3. Find threshold maximizing F1. Also fit Platt-style scaling
      (a*x + b in logit space) by grid search over a∈[0.3,3], b∈[-2,2].
   4. Output: { riskId: { threshold, platt_a, platt_b, before, after } }
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const PUB = path.join(__dirname, '..', '..', 'public');

const sandbox = {
  window: {}, console, Math, JSON, Date, Object, Array, String, Number, Boolean,
  Error, TypeError, RangeError, Symbol, Map, Set, Promise, setTimeout, clearTimeout,
};
sandbox.window.MLClient = {};
sandbox.MLClient = sandbox.window.MLClient;
sandbox.Utils = { clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)) };
sandbox.window.Utils = sandbox.Utils;
sandbox.global = sandbox;
vm.createContext(sandbox);

function loadInto(file) {
  const src = fs.readFileSync(path.join(PUB, 'js', file), 'utf8');
  vm.runInContext(src, sandbox, { filename: file });
}
loadInto('ml-client.js');
loadInto('ml-test-runner.js');
const Test = sandbox.window.AervinexMLTest;
const ML = sandbox.window.MLClient;
const CLINICAL = Test.CLINICAL;

const N = 5000;
const SEED = 42;

// Function name lookup (kebab-case → camelCase) — must match MAP in ml-client.js
const FN_MAP = {
  'asma':'predictAsma','ispa':'predictISPA','copd':'predictCOPD',
  'hipoksia':'predictHipoksia','heatstroke':'predictHeatstroke',
  'kelelahan-panas':'predictKelelahanPanas','dehidrasi':'predictDehidrasi',
  'afib':'predictAFib','sunburn':'predictSunburn',
  'pneumonia':'predictPneumonia','bronchitis':'predictBronchitis',
  'asma-exacerbation':'predictAsmaExacerbation','copd-exacerbation':'predictCOPDExacerbation',
  'sleep-apnea':'predictSleepApnea','bradikardia':'predictBradikardia',
  'takikardia':'predictTakikardia','ektopik-beat':'predictEktopikBeat',
  'hipertensi':'predictHipertensi','vasovagal':'predictVasovagal',
  'cv-fitness':'predictCVFitness','heat-cramps':'predictHeatCramps',
  'hyponatremia':'predictHyponatremia','photokeratitis':'predictPhotokeratitis',
  'vitamin-d':'predictVitaminD','skin-cancer':'predictSkinCancer',
  'demam':'predictDemam','hipotermia':'predictHipotermia',
  'stress-kronik':'predictStressKronik','burnout':'predictBurnout',
  'anxiety-panic':'predictAnxietyPanic','sleep-deprivation':'predictSleepDeprivation',
  'overtraining':'predictOvertraining','sedentary':'predictSedentary',
  'migraine-trigger':'predictMigraineTrigger','cardiac-event':'predictCardiacEvent',
};

// Generate samples + predictions + truth for one model
// CRITICAL: call the RAW predict function (bypass calibrateResult) so grid
// search finds the optimal Platt for the raw proxy output, not double-calibrated.
function collectData(riskId) {
  const cfg = CLINICAL[riskId];
  if (!cfg) return null;
  const fnName = FN_MAP[riskId];
  if (!fnName || typeof ML[fnName] !== 'function') return null;
  const rng = Test.mulberry32(SEED);
  const data = [];
  for (let i = 0; i < N; i++) {
    const features = cfg.sample(rng);
    const truth = cfg.groundTruth(features);
    const factors = cfg.toFactors(features);
    const result = ML[fnName](factors);  // RAW, not via predictForRisk
    if (!result) continue;
    data.push({ p: result.risk_pct / 100, t: truth });
  }
  return data;
}

function metricsAt(data, threshold) {
  let tp=0, fp=0, tn=0, fn=0;
  for (const d of data) {
    const pred = d.p >= threshold ? 1 : 0;
    if (pred===1 && d.t===1) tp++;
    else if (pred===1 && d.t===0) fp++;
    else if (pred===0 && d.t===0) tn++;
    else fn++;
  }
  const n = tp+fp+tn+fn;
  const acc = (tp+tn)/n;
  const prec = tp+fp>0 ? tp/(tp+fp) : 0;
  const rec  = tp+fn>0 ? tp/(tp+fn) : 0;
  const f1 = prec+rec>0 ? 2*prec*rec/(prec+rec) : 0;
  return { acc, prec, rec, f1, tp, fp, tn, fn };
}

function applyPlatt(p, a, b) {
  const eps = 1e-9;
  const logit = Math.log(p/(1-p+eps) + eps);
  const scaled = a * logit + b;
  return 1 / (1 + Math.exp(-scaled));
}

function calibrateOne(riskId) {
  const data = collectData(riskId);
  if (!data || data.length === 0) return null;

  // 1. baseline metrics at threshold 0.5
  const before = metricsAt(data, 0.5);

  // 2. find optimal threshold (no Platt)
  let bestThr = 0.5, bestF1 = 0;
  for (let t = 0.05; t <= 0.95; t += 0.01) {
    const m = metricsAt(data, t);
    if (m.f1 > bestF1) { bestF1 = m.f1; bestThr = t; }
  }
  const afterThrOnly = metricsAt(data, bestThr);

  // 3. find optimal Platt scaling (a, b) + threshold simultaneously
  let bestA = 1, bestB = 0, bestF1P = 0, bestThrP = 0.5;
  for (let a = 0.3; a <= 3.05; a += 0.2) {
    for (let b = -2; b <= 2.05; b += 0.2) {
      const transformed = data.map(d => ({ p: applyPlatt(d.p, a, b), t: d.t }));
      // sweep threshold for this (a,b)
      for (let t = 0.10; t <= 0.90; t += 0.02) {
        const m = metricsAt(transformed, t);
        if (m.f1 > bestF1P) {
          bestF1P = m.f1; bestThrP = t; bestA = a; bestB = b;
        }
      }
    }
  }
  const transformed = data.map(d => ({ p: applyPlatt(d.p, bestA, bestB), t: d.t }));
  const afterPlatt = metricsAt(transformed, bestThrP);

  return {
    riskId,
    before,
    after_threshold_only: { ...afterThrOnly, threshold: bestThr },
    after_platt: { ...afterPlatt, threshold: bestThrP, a: bestA, b: bestB },
  };
}

console.log('\n===== CALIBRATION OPTIMIZER (5000 samples/model) =====\n');
console.log('Model                       Bef-Acc  Bef-F1  → Aft-Acc Aft-F1  Thr    a     b');
console.log('─────────────────────────────────────────────────────────────────────────────');

const calibration = {};
const summary = [];
const allIds = Object.keys(CLINICAL);

allIds.forEach(id => {
  const r = calibrateOne(id);
  if (!r) return;
  calibration[id] = {
    threshold: r.after_platt.threshold,
    platt_a: r.after_platt.a,
    platt_b: r.after_platt.b,
    expected_acc: r.after_platt.acc,
    expected_f1: r.after_platt.f1,
  };
  summary.push({
    id,
    before_acc: r.before.acc, before_f1: r.before.f1,
    after_acc: r.after_platt.acc, after_f1: r.after_platt.f1,
    thr: r.after_platt.threshold, a: r.after_platt.a, b: r.after_platt.b,
  });
  const fid = id.padEnd(26);
  const ba = (r.before.acc*100).toFixed(1).padStart(5);
  const bf = (r.before.f1*100).toFixed(1).padStart(5);
  const aa = (r.after_platt.acc*100).toFixed(1).padStart(5);
  const af = (r.after_platt.f1*100).toFixed(1).padStart(5);
  const t = r.after_platt.threshold.toFixed(2).padStart(5);
  const aa2 = r.after_platt.a.toFixed(1).padStart(4);
  const bb = r.after_platt.b.toFixed(1).padStart(5);
  console.log(`${fid}  ${ba}   ${bf}  →  ${aa}   ${af}   ${t}  ${aa2}  ${bb}`);
});

const avgAccBefore = summary.reduce((s, x) => s + x.before_acc, 0) / summary.length;
const avgAccAfter  = summary.reduce((s, x) => s + x.after_acc,  0) / summary.length;
const avgF1Before  = summary.reduce((s, x) => s + x.before_f1,  0) / summary.length;
const avgF1After   = summary.reduce((s, x) => s + x.after_f1,   0) / summary.length;
console.log('─────────────────────────────────────────────────────────────────────────────');
console.log(`AVERAGE                      ${(avgAccBefore*100).toFixed(1).padStart(5)}   ${(avgF1Before*100).toFixed(1).padStart(5)}  →  ${(avgAccAfter*100).toFixed(1).padStart(5)}   ${(avgF1After*100).toFixed(1).padStart(5)}`);

const outPath = path.join(__dirname, 'calibration-map.json');
fs.writeFileSync(outPath, JSON.stringify(calibration, null, 2));
console.log(`\nSaved calibration map: ${outPath}`);
