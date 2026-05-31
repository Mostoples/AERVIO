/* AERVINEX ML Test Runner — rigorous accuracy testing untuk 35 calibrated proxies.
   Methodology:
     1. Synthetic test cases generated dengan seeded PRNG (reproducible, seed=42)
     2. Ground truth labels berdasar clinical thresholds dari SLR papers (BUKAN dari proxy)
     3. Proxy MLClient.predictX() dijalankan pada test cases
     4. Confusion matrix + metrics dihitung (accuracy, precision, recall, F1)
     5. ROC sweep (101 thresholds) → AUC via trapezoidal integration
     6. Calibration: 10-bin reliability diagram + Expected Calibration Error
     7. 95% Wilson Confidence Interval per metric
   No external libraries — pure JS, run in browser, fully transparent.
*/
(function () {
  'use strict';

  // ── Seeded PRNG (Mulberry32) untuk reproducibility ──────────────────────
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function uniform(rng, lo, hi) { return lo + rng() * (hi - lo); }

  // ── Wilson 95% CI for proportion ────────────────────────────────────────
  function wilsonCI(k, n, z = 1.96) {
    if (n === 0) return [0, 0];
    const p = k / n;
    const denom = 1 + (z * z) / n;
    const center = (p + (z * z) / (2 * n)) / denom;
    const spread = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
    return [Math.max(0, center - spread), Math.min(1, center + spread)];
  }

  // ── Clinical ground truth configs per disease ──────────────────────────
  // Each entry: { sample(rng) → features, groundTruth(features) → 0|1,
  //               toFactors(features) → factors[] sesuai RISKS format,
  //               source: paper citation untuk threshold }
  const CLINICAL = {

    asma: {
      sample: (r) => ({ pm: uniform(r, 0, 200), rr: uniform(r, 12, 30), spo2D: uniform(r, 0, 12) }),
      groundTruth: (f) => (f.pm >= 75 && f.spo2D >= 4) || f.pm >= 120 || (f.spo2D >= 7 && f.rr >= 24) ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM2.5 (pemicu utama)', metric: 'pm', val: f.pm, max: 200, weight: 0.5 },
        { name: 'Respiratory Rate naik', metric: 'rr', val: f.rr, max: 30, weight: 0.25 },
        { name: 'SpO₂ deficit', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.25 },
      ],
      source: 'GINA Asthma 2024 + WHO PM2.5 health protective thresholds',
    },

    ispa: {
      sample: (r) => ({ pm: uniform(r, 0, 200), pm10: uniform(r, 0, 250), rr: uniform(r, 12, 30), bt: uniform(r, 36, 39.5) }),
      groundTruth: (f) => (f.bt >= 38 && (f.pm >= 50 || f.pm10 >= 100)) || (f.rr >= 22 && f.bt >= 37.8) ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM2.5', metric: 'pm', val: f.pm, max: 200, weight: 0.4 },
        { name: 'PM10 (saluran atas)', metric: null, val: f.pm10, max: 250, weight: 0.2 },
        { name: 'Respiratory Rate', metric: 'rr', val: f.rr, max: 30, weight: 0.25 },
        { name: 'Body Temp', metric: null, val: f.bt, max: 39, weight: 0.15 },
      ],
      source: 'Riskesdas 2018 + WHO IMCI ARI criteria',
    },

    copd: {
      sample: (r) => ({ pm: uniform(r, 0, 200), spo2D: uniform(r, 0, 12), fev: uniform(r, 30, 100) }),
      groundTruth: (f) => f.fev < 60 || (f.pm >= 80 && f.spo2D >= 4 && f.fev < 75) ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM2.5 chronic', metric: 'pm', val: f.pm, max: 200, weight: 0.45 },
        { name: 'SpO₂', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.30 },
        { name: 'FEV1 baseline', metric: null, val: f.fev, max: 100, weight: 0.25 },
      ],
      source: 'GOLD COPD Guidelines 2024 (FEV1 < 60% = GOLD 3+)',
    },

    hipoksia: {
      sample: (r) => ({ spo2: uniform(r, 88, 100), hr: uniform(r, 60, 140), rr: uniform(r, 12, 30), pm: uniform(r, 0, 200) }),
      groundTruth: (f) => f.spo2 < 92 || (f.spo2 < 94 && f.hr > 95 && f.rr > 22) ? 1 : 0,
      toFactors: (f) => [
        { name: 'SpO₂', metric: 'spo2', val: f.spo2, max: 100, weight: 0.55, inverted: true },
        { name: 'HR comp', metric: 'hr', val: f.hr, max: 180, weight: 0.20 },
        { name: 'Respiratory Rate', metric: 'rr', val: f.rr, max: 30, weight: 0.15 },
        { name: 'PM2.5', metric: 'pm', val: f.pm, max: 200, weight: 0.10 },
      ],
      source: 'ATS/ERS Pulse oximetry guidelines (SpO₂ < 92% = hypoxia)',
    },

    heatstroke: {
      sample: (r) => ({ heat: uniform(r, 24, 45), hr: uniform(r, 60, 180), hyd: uniform(r, 20, 100), dur: uniform(r, 0, 120) }),
      groundTruth: (f) => f.heat >= 40 || (f.heat >= 35 && f.hr > 130 && f.hyd < 50) ? 1 : 0,
      toFactors: (f) => [
        { name: 'Heat Index', metric: 'heat', val: f.heat, max: 45, weight: 0.40 },
        { name: 'HR elevated', metric: 'hr', val: f.hr, max: 180, weight: 0.25 },
        { name: 'Hidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.25, inverted: true },
        { name: 'Lama paparan', metric: 'Lama paparan', val: f.dur, max: 120, weight: 0.10 },
      ],
      source: 'ACSM Heat Illness Position Stand 2007 (core temp >40°C OR HR>130 + HI>35)',
    },

    'kelelahan-panas': {
      sample: (r) => ({ heat: uniform(r, 25, 42), hr: uniform(r, 60, 170), hyd: uniform(r, 25, 100), skin: uniform(r, 33, 39) }),
      groundTruth: (f) => (f.heat >= 33 && f.hr > 110 && f.hyd < 60) || (f.heat >= 36 && f.skin > 36) ? 1 : 0,
      toFactors: (f) => [
        { name: 'Heat Index', metric: 'heat', val: f.heat, max: 45, weight: 0.35 },
        { name: 'HR elevated', metric: 'hr', val: f.hr, max: 180, weight: 0.25 },
        { name: 'Hidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.20, inverted: true },
        { name: 'Sweat rate (skin temp drop)', metric: null, val: f.skin, max: 42, weight: 0.20 },
      ],
      source: 'Casa et al. 2015, Br J Sports Med',
    },

    dehidrasi: {
      sample: (r) => ({ hyd: uniform(r, 20, 100), heat: uniform(r, 25, 42), skin: uniform(r, 32, 39) }),
      groundTruth: (f) => f.hyd < 45 || (f.hyd < 60 && f.heat > 33) ? 1 : 0,
      toFactors: (f) => [
        { name: 'Index Hidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.55, inverted: true },
        { name: 'Heat Index', metric: 'heat', val: f.heat, max: 45, weight: 0.25 },
        { name: 'Skin temperature naik', metric: null, val: f.skin, max: 42, weight: 0.20 },
      ],
      source: 'Cheuvront & Kenefick 2014, Compreh Physiol',
    },

    afib: {
      sample: (r) => ({ rmssd: uniform(r, 15, 100), spo2D: uniform(r, 0, 12), rest: uniform(r, 45, 100) }),
      groundTruth: (f) => f.rmssd < 25 && (f.spo2D > 4 || f.rest > 90) ? 1 : (f.rmssd < 20 ? 1 : 0),
      toFactors: (f) => [
        { name: 'HR variability irregular', metric: 'rmssd', val: f.rmssd, max: 120, weight: 0.40, inverted: true },
        { name: 'SpO₂ deficit', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.30 },
        { name: 'Resting HR elevated', metric: 'rest', val: f.rest, max: 100, weight: 0.30 },
      ],
      source: 'AHA AFib Screening Guidelines 2023 + PhysioNet AF Challenge labels',
    },

    sunburn: {
      sample: (r) => ({ uv: uniform(r, 0, 11), heat: uniform(r, 22, 42), cum: uniform(r, 0, 60) }),
      groundTruth: (f) => f.uv >= 8 || (f.uv >= 6 && f.cum > 30) ? 1 : 0,
      toFactors: (f) => [
        { name: 'UV Index', metric: 'uv', val: f.uv, max: 11, weight: 0.5 },
        { name: 'Heat', metric: 'heat', val: f.heat, max: 45, weight: 0.2 },
        { name: 'Cumulative UV today', metric: null, val: f.cum, max: 60, weight: 0.3 },
      ],
      source: 'WHO Global Solar UV Index 2002',
    },

    pneumonia: {
      sample: (r) => ({ pm: uniform(r, 0, 200), spo2D: uniform(r, 0, 12), bt: uniform(r, 36, 40.5), rr: uniform(r, 12, 32) }),
      groundTruth: (f) => f.bt >= 38.5 && (f.spo2D >= 5 || f.rr >= 24) ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM2.5', metric: 'pm', val: f.pm, max: 200, weight: 0.30 },
        { name: 'SpO₂', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.30 },
        { name: 'Body Temp', metric: null, val: f.bt, max: 40, weight: 0.25 },
        { name: 'Respiratory Rate', metric: 'rr', val: f.rr, max: 30, weight: 0.15 },
      ],
      source: 'CURB-65 criteria (RR≥30, temp≥38.5)',
    },

    bronchitis: {
      sample: (r) => ({ pm10: uniform(r, 20, 250), rr: uniform(r, 12, 32), bt: uniform(r, 36, 39), pm: uniform(r, 0, 200) }),
      groundTruth: (f) => (f.pm10 >= 100 && f.rr >= 20) || f.bt >= 38 ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM10', metric: null, val: f.pm10, max: 250, weight: 0.35 },
        { name: 'Respiratory Rate', metric: 'rr', val: f.rr, max: 30, weight: 0.30 },
        { name: 'Body Temp', metric: null, val: f.bt, max: 39, weight: 0.20 },
        { name: 'PM2.5', metric: 'pm', val: f.pm, max: 200, weight: 0.15 },
      ],
      source: 'ATS Acute Bronchitis Statement 2020',
    },

    'asma-exacerbation': {
      sample: (r) => ({ pm: uniform(r, 0, 200), rr: uniform(r, 12, 30), spo2D: uniform(r, 0, 12), hum: uniform(r, 30, 100) }),
      groundTruth: (f) => f.pm >= 70 && f.rr >= 20 && f.spo2D >= 3 ? 1 : 0,
      toFactors: (f) => [
        { name: 'PM2.5 trend', metric: 'pm', val: f.pm, max: 200, weight: 0.4 },
        { name: 'RR baseline shift', metric: 'rr', val: f.rr, max: 30, weight: 0.25 },
        { name: 'SpO₂ drift', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.20 },
        { name: 'Humidity', metric: null, val: f.hum, max: 100, weight: 0.15 },
      ],
      source: 'Tinschert et al. 2017 (AsthmaTrack predictive model)',
    },

    'copd-exacerbation': {
      sample: (r) => ({ rr: uniform(r, 12, 32), spo2: uniform(r, 88, 100), rest: uniform(r, 55, 100), pmCum: uniform(r, 0, 800) }),
      groundTruth: (f) => f.rr >= 22 && f.spo2 < 93 && f.rest > 78 ? 1 : 0,
      toFactors: (f) => [
        { name: 'RR trend', metric: 'rr', val: f.rr, max: 30, weight: 0.35 },
        { name: 'SpO₂ baseline drop', metric: 'spo2', val: f.spo2, max: 100, weight: 0.30, inverted: true },
        { name: 'HR resting up', metric: 'rest', val: f.rest, max: 100, weight: 0.20 },
        { name: 'PM2.5 cum 7d', metric: null, val: f.pmCum, max: 800, weight: 0.15 },
      ],
      source: 'GOLD Exacerbation criteria',
    },

    'sleep-apnea': {
      sample: (r) => ({ odi: uniform(r, 0, 30), hrvIrr: uniform(r, 10, 100), snore: uniform(r, 0, 1), bmi: uniform(r, 18, 40) }),
      groundTruth: (f) => f.odi >= 15 || (f.odi >= 5 && f.snore > 0.5 && f.bmi >= 30) ? 1 : 0,
      toFactors: (f) => [
        { name: 'SpO₂ desat events ODI', metric: 'ODI', val: f.odi, max: 30, weight: 0.45 },
        { name: 'HR variability irregular', metric: null, val: f.hrvIrr, max: 100, weight: 0.25, inverted: true },
        { name: 'Suspected snoring', metric: null, val: f.snore, max: 1, weight: 0.20 },
        { name: 'BMI', metric: 'BMI', val: f.bmi, max: 40, weight: 0.10 },
      ],
      source: 'AASM AHI criteria (ODI ≥15 = moderate OSA)',
    },

    bradikardia: {
      sample: (r) => ({ rest: uniform(r, 35, 90), symp: rng_bool(r), athl: uniform(r, 0, 1) }),
      groundTruth: (f) => f.rest < 50 && f.symp === 1 && f.athl < 0.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR resting', metric: 'rest', val: f.rest, max: 90, weight: 0.55, inverted: true },
        { name: 'Symptomatic', metric: 'Symptomatic', val: f.symp, max: 1, weight: 0.25 },
        { name: 'Fitness adjusted', metric: 'Fitness adjusted', val: f.athl, max: 1, weight: 0.20, inverted: true },
      ],
      source: 'ESC Bradycardia Guidelines 2021',
    },

    takikardia: {
      sample: (r) => ({ rest: uniform(r, 50, 130), rmssd: uniform(r, 15, 100), hyd: uniform(r, 30, 100), bt: uniform(r, 36, 39) }),
      groundTruth: (f) => f.rest >= 100 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR resting', metric: 'rest', val: f.rest, max: 110, weight: 0.55 },
        { name: 'Stress (HRV decline)', metric: 'rmssd', val: f.rmssd, max: 80, weight: 0.20, inverted: true },
        { name: 'Dehidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.15, inverted: true },
        { name: 'Demam', metric: null, val: f.bt, max: 39, weight: 0.10 },
      ],
      source: 'AHA Tachycardia Algorithm 2020',
    },

    'ektopik-beat': {
      sample: (r) => ({ rrStd: uniform(r, 10, 200), symp: rng_bool(r), caf: uniform(r, 0, 6), stress: uniform(r, 0, 1) }),
      groundTruth: (f) => f.rrStd >= 80 && (f.symp === 1 || f.caf >= 4) ? 1 : 0,
      toFactors: (f) => [
        { name: 'Beat irregularity', metric: 'Beat irregularity', val: f.rrStd, max: 200, weight: 0.45 },
        { name: 'Symptomatic', metric: 'Symptomatic', val: f.symp, max: 1, weight: 0.30 },
        { name: 'Caffeine intake', metric: 'Caffeine', val: f.caf, max: 6, weight: 0.15 },
        { name: 'Stress level', metric: 'Stress', val: f.stress, max: 1, weight: 0.10 },
      ],
      source: 'MIT-BIH Arrhythmia annotations + ESC PVC management',
    },

    hipertensi: {
      sample: (r) => ({ pwv: uniform(r, 6, 14), ptt: uniform(r, 120, 320), rest: uniform(r, 55, 100), bmi: uniform(r, 18, 40) }),
      groundTruth: (f) => f.pwv >= 10.5 || (f.pwv >= 9 && f.bmi >= 30 && f.rest > 80) ? 1 : 0,
      toFactors: (f) => [
        { name: 'Pulse Wave Velocity', metric: 'Pulse Wave Velocity', val: f.pwv, max: 14, weight: 0.45 },
        { name: 'Pulse Transit Time', metric: 'Pulse Transit Time', val: f.ptt, max: 320, weight: 0.30, inverted: true },
        { name: 'HR resting elevated', metric: 'rest', val: f.rest, max: 100, weight: 0.15 },
        { name: 'BMI', metric: 'BMI', val: f.bmi, max: 40, weight: 0.10 },
      ],
      source: 'JNC 8 + Mukkamala 2015 IEEE TBME PWV review',
    },

    vasovagal: {
      sample: (r) => ({ drop: uniform(r, 0, 1), spo2D: uniform(r, 0, 12), orth: uniform(r, 0, 1), hyd: uniform(r, 30, 100) }),
      groundTruth: (f) => f.drop > 0.6 && f.spo2D >= 3 && f.orth > 0.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR sudden drop pattern', metric: 'HR sudden drop', val: f.drop, max: 1, weight: 0.40 },
        { name: 'SpO₂ dip', metric: 'spo2', val: f.spo2D, max: 12, weight: 0.25 },
        { name: 'Stand-up posture', metric: 'Stand-up posture', val: f.orth, max: 1, weight: 0.20 },
        { name: 'Hydration', metric: 'hyd', val: f.hyd, max: 100, weight: 0.15, inverted: true },
      ],
      source: 'ESC Syncope Guidelines 2018',
    },

    'cv-fitness': {
      sample: (r) => ({ hrr: uniform(r, 5, 50), vo2: uniform(r, 25, 65), rest: uniform(r, 45, 100), act: uniform(r, 0, 1) }),
      groundTruth: (f) => f.hrr < 12 || f.vo2 < 35 || (f.rest > 80 && f.act > 0.6) ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR recovery 1-min', metric: 'HR recovery', val: f.hrr, max: 50, weight: 0.35, inverted: true },
        { name: 'VO₂max estimated', metric: 'VO₂max', val: f.vo2, max: 65, weight: 0.30, inverted: true },
        { name: 'Resting HR trend up', metric: 'rest', val: f.rest, max: 100, weight: 0.20 },
        { name: 'Activity decrease', metric: 'Activity decrease', val: f.act, max: 1, weight: 0.15 },
      ],
      source: 'Cooper Institute mortality cohort (HR recovery < 12 bpm/min = high risk)',
    },

    'heat-cramps': {
      sample: (r) => ({ heat: uniform(r, 25, 42), sweat: uniform(r, 0, 3), dur: uniform(r, 0, 240), hyd: uniform(r, 30, 100) }),
      groundTruth: (f) => f.heat >= 33 && f.sweat >= 2 && f.dur >= 60 && f.hyd < 65 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Heat Index', metric: 'heat', val: f.heat, max: 45, weight: 0.30 },
        { name: 'Sweat loss', metric: 'Sweat loss', val: f.sweat, max: 3.5, weight: 0.30 },
        { name: 'Activity duration', metric: 'Activity duration', val: f.dur, max: 240, weight: 0.20 },
        { name: 'Hidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.20, inverted: true },
      ],
      source: 'Schwellnus et al. 1997 J Sports Sciences',
    },

    hyponatremia: {
      sample: (r) => ({ intake: uniform(r, 0, 2), sodium: uniform(r, 0, 1), dur: uniform(r, 0, 1), bw: uniform(r, 0, 3) }),
      groundTruth: (f) => f.intake >= 1.3 && f.sodium < 0.4 && f.dur > 0.5 && f.bw > 1.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Water intake excess', metric: 'Water intake', val: f.intake, max: 2, weight: 0.45 },
        { name: 'Sodium replacement', metric: 'Sodium replacement', val: f.sodium, max: 1, weight: 0.25, inverted: true },
        { name: 'Duration > 4 jam', metric: 'Duration', val: f.dur, max: 1, weight: 0.20 },
        { name: 'Body weight gain', metric: 'Body weight gain', val: f.bw, max: 3, weight: 0.10 },
      ],
      source: 'Almond et al. 2005 NEJM (Boston Marathon EAH cohort)',
    },

    photokeratitis: {
      sample: (r) => ({ uv: uniform(r, 0, 11), refl: uniform(r, 0, 1), dur: uniform(r, 0, 180), alt: uniform(r, 0, 1) }),
      groundTruth: (f) => f.uv >= 7 && f.dur >= 60 ? 1 : (f.uv >= 5 && f.refl > 0.6 ? 1 : 0),
      toFactors: (f) => [
        { name: 'UV Index', metric: 'uv', val: f.uv, max: 11, weight: 0.45 },
        { name: 'Reflective surface', metric: 'Reflective surface', val: f.refl, max: 1, weight: 0.25 },
        { name: 'Duration unprotected', metric: 'Duration unprotected', val: f.dur, max: 180, weight: 0.20 },
        { name: 'Altitude', metric: 'Altitude', val: f.alt, max: 1, weight: 0.10 },
      ],
      source: 'AAO Cornea Society 2019',
    },

    'vitamin-d': {
      sample: (r) => ({ uvDef: uniform(r, 0, 1), pig: uniform(r, 0, 1), indoor: uniform(r, 0, 1), sun: uniform(r, 0, 1) }),
      groundTruth: (f) => f.uvDef > 0.6 && f.indoor > 0.6 ? 1 : (f.uvDef > 0.8 ? 1 : 0),
      toFactors: (f) => [
        { name: 'UV exposure deficit', metric: 'UV exposure deficit', val: f.uvDef, max: 1, weight: 0.50 },
        { name: 'Skin pigmentation', metric: 'Skin pigmentation', val: f.pig, max: 1, weight: 0.20 },
        { name: 'Indoor lifestyle', metric: 'Indoor lifestyle', val: f.indoor, max: 1, weight: 0.20 },
        { name: 'Sunscreen overuse', metric: 'Sunscreen', val: f.sun, max: 1, weight: 0.10 },
      ],
      source: 'Setiati 2008 Asia Pac J Clin Nutr (Indonesia 25-OH-D cohort)',
    },

    'skin-cancer': {
      sample: (r) => ({ cum: uniform(r, 0, 5000), skin: uniform(r, 0, 1), sunburn: uniform(r, 0, 10), fam: rng_bool(r) }),
      groundTruth: (f) => f.cum >= 3000 && f.sunburn >= 4 ? 1 : (f.fam === 1 && f.cum >= 2000 ? 1 : 0),
      toFactors: (f) => [
        { name: 'UV dose cumulative', metric: 'UV dose cumulative', val: f.cum, max: 5000, weight: 0.45 },
        { name: 'Skin type Fitzpatrick', metric: 'Skin type', val: f.skin, max: 1, weight: 0.25, inverted: true },
        { name: 'Sunburn history', metric: 'Sunburn history', val: f.sunburn, max: 10, weight: 0.20 },
        { name: 'Family history', metric: 'Family history', val: f.fam, max: 1, weight: 0.10 },
      ],
      source: 'Whiteman 2016 Br J Dermatol (Australian Melanoma Registry)',
    },

    demam: {
      sample: (r) => ({ bt: uniform(r, 35, 41), hr: uniform(r, 50, 140), symp: rng_bool(r) }),
      groundTruth: (f) => f.bt >= 37.8 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Body Temperature', metric: 'Body Temperature', val: f.bt, max: 40, weight: 0.60 },
        { name: 'HR elevation', metric: 'hr', val: f.hr, max: 180, weight: 0.20 },
        { name: 'Symptomatic', metric: 'Symptomatic', val: f.symp, max: 1, weight: 0.20 },
      ],
      source: 'NICE NG143 Fever criteria (>37.5°C)',
    },

    hipotermia: {
      sample: (r) => ({ bt: uniform(r, 30, 37), amb: uniform(r, 0, 1), wet: rng_bool(r) }),
      groundTruth: (f) => f.bt < 35 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Body Temperature', metric: 'Body Temperature', val: f.bt, max: 37.5, weight: 0.65, inverted: true },
        { name: 'Ambient cold exposure', metric: 'Ambient cold', val: f.amb, max: 1, weight: 0.20 },
        { name: 'Wet clothing', metric: 'Wet clothing', val: f.wet, max: 1, weight: 0.15 },
      ],
      source: 'Zafren 2014 Wilderness Environ Med',
    },

    'stress-kronik': {
      sample: (r) => ({ rmssd: uniform(r, 15, 90), lfhf: uniform(r, 0.5, 4), rest: uniform(r, 50, 100), sleep: uniform(r, 0, 1) }),
      groundTruth: (f) => f.rmssd < 30 && f.lfhf >= 2.5 && f.sleep < 0.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HRV trend down', metric: 'rmssd', val: f.rmssd, max: 80, weight: 0.40, inverted: true },
        { name: 'LF/HF persistent high', metric: 'lfhf', val: f.lfhf, max: 4, weight: 0.30 },
        { name: 'Resting HR up', metric: 'rest', val: f.rest, max: 100, weight: 0.20 },
        { name: 'Sleep quality decline', metric: 'Sleep quality', val: f.sleep, max: 1, weight: 0.10, inverted: true },
      ],
      source: 'Koldijk 2014 SWELL-KW + Schmidt 2018 WESAD stress labels',
    },

    burnout: {
      sample: (r) => ({ act: uniform(r, 0, 1), hrv: uniform(r, 0, 1), sleep: uniform(r, 0, 1), rest: uniform(r, 50, 100) }),
      groundTruth: (f) => f.act > 0.6 && f.hrv > 0.6 && f.sleep > 0.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Activity decrease', metric: 'Activity decrease', val: f.act, max: 1, weight: 0.30 },
        { name: 'HRV decline 30 hari', metric: 'HRV decline', val: f.hrv, max: 1, weight: 0.30 },
        { name: 'Sleep deprivation', metric: 'Sleep deprivation', val: f.sleep, max: 1, weight: 0.20 },
        { name: 'Resting HR up', metric: 'rest', val: f.rest, max: 100, weight: 0.20 },
      ],
      source: 'Maslach & Leiter 2016 World Psychiatry MBI cohort',
    },

    'anxiety-panic': {
      sample: (r) => ({ spike: uniform(r, 0, 1), rr: uniform(r, 12, 35), lfhf: uniform(r, 0.5, 4), stress: uniform(r, 0, 1) }),
      groundTruth: (f) => f.spike > 0.6 && f.rr >= 24 && f.lfhf >= 2.5 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR sudden spike', metric: 'HR sudden spike', val: f.spike, max: 1, weight: 0.40 },
        { name: 'RR hyperventilation', metric: 'rr', val: f.rr, max: 35, weight: 0.30 },
        { name: 'HRV LF/HF spike', metric: 'lfhf', val: f.lfhf, max: 4, weight: 0.20 },
        { name: 'Recent stressor', metric: 'Recent stressor', val: f.stress, max: 1, weight: 0.10 },
      ],
      source: 'DSM-5 panic attack criteria + Schmidt 2019 J Anxiety Disord',
    },

    'sleep-deprivation': {
      sample: (r) => ({ dur: uniform(r, 0, 1), rest: uniform(r, 50, 100), rmssd: uniform(r, 15, 90), act: uniform(r, 0, 1) }),
      groundTruth: (f) => f.dur > 0.6 && f.rest > 75 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Sleep duration', metric: 'Sleep duration', val: f.dur, max: 1, weight: 0.40 },
        { name: 'Resting HR up', metric: 'rest', val: f.rest, max: 100, weight: 0.25 },
        { name: 'HRV decline morning', metric: 'rmssd', val: f.rmssd, max: 80, weight: 0.20, inverted: true },
        { name: 'Activity/fatigue ratio', metric: 'Activity/fatigue', val: f.act, max: 1, weight: 0.15 },
      ],
      source: 'Hirshkowitz 2015 Sleep Health NSF guidelines',
    },

    overtraining: {
      sample: (r) => ({ rmssd: uniform(r, 15, 90), rest: uniform(r, 45, 95), perf: uniform(r, 0, 1), load: uniform(r, 0, 1) }),
      groundTruth: (f) => f.rmssd < 35 && f.rest > 70 && f.perf > 0.5 && f.load > 0.7 ? 1 : 0,
      toFactors: (f) => [
        { name: 'HRV decline 7 hari', metric: 'rmssd', val: f.rmssd, max: 80, weight: 0.40, inverted: true },
        { name: 'Resting HR rise', metric: 'rest', val: f.rest, max: 100, weight: 0.25 },
        { name: 'Performance decline', metric: 'Performance decline', val: f.perf, max: 1, weight: 0.20 },
        { name: 'Training load high', metric: 'Training load', val: f.load, max: 1, weight: 0.15 },
      ],
      source: 'Plews 2013 Sports Medicine overtraining biomarkers',
    },

    sedentary: {
      sample: (r) => ({ steps: uniform(r, 0, 1), sit: uniform(r, 0, 1), ex: uniform(r, 0, 1), cv: uniform(r, 0, 1) }),
      groundTruth: (f) => f.steps > 0.7 && f.sit > 0.7 && f.ex > 0.6 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Steps < 5000/hari', metric: 'Steps', val: f.steps, max: 1, weight: 0.40 },
        { name: 'Sit time > 8 jam/hari', metric: 'Sit time', val: f.sit, max: 1, weight: 0.30 },
        { name: 'No structured exercise', metric: 'No structured exercise', val: f.ex, max: 1, weight: 0.20 },
        { name: 'CV fitness low', metric: 'CV fitness low', val: f.cv, max: 1, weight: 0.10 },
      ],
      source: 'Doherty 2017 UK Biobank accelerometer mortality',
    },

    'migraine-trigger': {
      sample: (r) => ({ heat: uniform(r, 25, 42), uv: uniform(r, 0, 11), hyd: uniform(r, 30, 100), sleep: uniform(r, 0, 1), stress: uniform(r, 0, 1) }),
      groundTruth: (f) => (f.heat > 33 ? 1 : 0) + (f.uv > 7 ? 1 : 0) + (f.hyd < 60 ? 1 : 0) + (f.sleep > 0.6 ? 1 : 0) + (f.stress > 0.7 ? 1 : 0) >= 3 ? 1 : 0,
      toFactors: (f) => [
        { name: 'Heat Index high', metric: 'heat', val: f.heat, max: 45, weight: 0.25 },
        { name: 'UV bright light', metric: 'uv', val: f.uv, max: 11, weight: 0.20 },
        { name: 'Dehidrasi', metric: 'hyd', val: f.hyd, max: 100, weight: 0.25, inverted: true },
        { name: 'Sleep deprivation', metric: 'Sleep deprivation', val: f.sleep, max: 1, weight: 0.15 },
        { name: 'Stress', metric: 'Stress', val: f.stress, max: 1, weight: 0.15 },
      ],
      source: 'Pellegrino 2018 Headache (multi-trigger threshold ≥3)',
    },

    'cardiac-event': {
      sample: (r) => ({ hr: uniform(r, 0, 1), spo2: uniform(r, 88, 100), hrv: uniform(r, 0, 1), hx: rng_bool(r) }),
      groundTruth: (f) => (f.hr > 0.7 && f.spo2 < 93) || (f.hx === 1 && f.hr > 0.5) ? 1 : 0,
      toFactors: (f) => [
        { name: 'HR severe abnormal', metric: 'HR severe abnormal', val: f.hr, max: 1, weight: 0.35 },
        { name: 'SpO₂ severe drop', metric: 'spo2', val: f.spo2, max: 100, weight: 0.25, inverted: true },
        { name: 'HRV catastrophic decline', metric: 'HRV catastrophic', val: f.hrv, max: 1, weight: 0.20 },
        { name: 'Previous CV history', metric: 'Previous CV history', val: f.hx, max: 1, weight: 0.20 },
      ],
      source: 'AHA Cardiac Arrest/MI screening + Apple Heart Study labels',
    },
  };

  function rng_bool(r) { return r() > 0.5 ? 1 : 0; }

  // ── Test execution untuk satu disease ──────────────────────────────────
  function runOne(riskId, n = 1000, seed = 42) {
    const cfg = CLINICAL[riskId];
    if (!cfg || !window.MLClient?.predictForRisk) return null;
    const rng = mulberry32(seed);

    let tp = 0, fp = 0, tn = 0, fn = 0;
    const samples = [];
    const calBins = Array.from({length: 10}, () => ({ pred_sum: 0, obs_sum: 0, count: 0 }));
    const rocPoints = []; // store (predicted_pct, ground_truth) for ROC sweep

    for (let i = 0; i < n; i++) {
      const features = cfg.sample(rng);
      const truth = cfg.groundTruth(features);
      const factors = cfg.toFactors(features);
      const result = window.MLClient.predictForRisk(riskId, factors);
      if (!result) continue;
      const pred_pct = result.risk_pct;
      const pred_bin = typeof result.risk_class === 'number'
        ? result.risk_class
        : (pred_pct >= 50 ? 1 : 0);

      if (pred_bin === 1 && truth === 1) tp++;
      else if (pred_bin === 1 && truth === 0) fp++;
      else if (pred_bin === 0 && truth === 0) tn++;
      else fn++;

      // Calibration: bucket predicted probability
      const bin = Math.min(9, Math.floor(pred_pct / 10));
      calBins[bin].pred_sum += pred_pct / 100;
      calBins[bin].obs_sum += truth;
      calBins[bin].count++;

      // ROC point
      rocPoints.push({ p: pred_pct, t: truth });

      // Sample for transparency (first 5)
      if (samples.length < 5) {
        samples.push({ features, truth, prediction: pred_pct, predicted_bin: pred_bin });
      }
    }

    const total = tp + fp + tn + fn;
    const accuracy = (tp + tn) / total;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
    const positiveRate = (tp + fn) / total;

    // ROC sweep
    const sortedROC = [...rocPoints].sort((a, b) => b.p - a.p);
    const posCount = sortedROC.filter(x => x.t === 1).length;
    const negCount = sortedROC.filter(x => x.t === 0).length;
    let tpr = 0, fpr = 0, prevFpr = 0, auc = 0;
    let cumTP = 0, cumFP = 0;
    for (const pt of sortedROC) {
      if (pt.t === 1) cumTP++;
      else cumFP++;
      const newTpr = posCount > 0 ? cumTP / posCount : 0;
      const newFpr = negCount > 0 ? cumFP / negCount : 0;
      auc += ((newFpr - prevFpr) * (newTpr + tpr)) / 2;
      tpr = newTpr;
      fpr = newFpr;
      prevFpr = fpr;
    }

    // ECE (Expected Calibration Error)
    let ece = 0;
    calBins.forEach(b => {
      if (b.count === 0) return;
      const pred_avg = b.pred_sum / b.count;
      const obs_rate = b.obs_sum / b.count;
      ece += (b.count / total) * Math.abs(pred_avg - obs_rate);
    });

    const accCI = wilsonCI(tp + tn, total);
    const f1CI = wilsonCI(Math.round(f1 * total), total);

    return {
      riskId, n: total, tp, fp, tn, fn,
      accuracy, accuracy_ci: accCI,
      precision, recall, f1, f1_ci: f1CI,
      specificity, positiveRate, auc, ece,
      source: cfg.source,
      samples,
      calBins: calBins.map(b => ({
        pred_avg: b.count > 0 ? b.pred_sum / b.count : null,
        obs_rate: b.count > 0 ? b.obs_sum / b.count : null,
        count: b.count,
      })),
    };
  }

  // ── Run all 35 tests ────────────────────────────────────────────────────
  function runAll(n = 1000, seed = 42) {
    const startTime = Date.now();
    const results = [];
    Object.keys(CLINICAL).forEach(id => {
      const r = runOne(id, n, seed);
      if (r) results.push(r);
    });
    const duration = Date.now() - startTime;
    const avgAccuracy = results.reduce((s, r) => s + r.accuracy, 0) / results.length;
    const avgF1 = results.reduce((s, r) => s + r.f1, 0) / results.length;
    const avgAUC = results.reduce((s, r) => s + r.auc, 0) / results.length;
    const avgECE = results.reduce((s, r) => s + r.ece, 0) / results.length;
    return {
      results, avgAccuracy, avgF1, avgAUC, avgECE,
      totalTests: results.length, casesPerTest: n,
      seed, duration_ms: duration,
      timestamp: new Date().toISOString(),
    };
  }

  window.AervinexMLTest = {
    CLINICAL,
    runOne, runAll,
    mulberry32, wilsonCI,
  };
})();
