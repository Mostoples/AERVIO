/* AERVINEX disease catalog — 35 conditions for browse/list UI.
   Format: { id, name, icon, category, aura, baseline (ML estimate %), tagline }
   id matches risk-detail.html ?id=... and assessment.html ?id=...
*/
window.DISEASE_LIST = [
  // ── Pernapasan ─────────────────────────────────────
  { id: 'teprs',             name: 'Environment Health Risk (TEPRS)', icon: '🌍', category: 'Composite',     aura: 'aura-cyan',   baseline: 34, tagline: 'Skor risiko lingkungan komposit (PM, UV, heat, fisiologi)' },
  { id: 'asma',              name: 'Asma',                              icon: '🫁', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 14, tagline: 'Penyempitan saluran napas reversibel · dipicu polusi/alergen' },
  { id: 'ispa',              name: 'ISPA',                              icon: '🤧', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 18, tagline: 'Infeksi Saluran Pernapasan Akut · dipicu PM2.5+droplet' },
  { id: 'copd',              name: 'COPD',                              icon: '🚬', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 8,  tagline: 'Obstruksi kronik · paparan polusi/asap jangka panjang' },
  { id: 'hipoksia',          name: 'Hipoksia Ringan',                   icon: '🫁', category: 'Pernapasan',   aura: 'aura-blue',   baseline: 10, tagline: 'Penurunan oksigenasi jaringan' },
  { id: 'pneumonia',         name: 'Pneumonia',                         icon: '🦠', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 6,  tagline: 'Infeksi paru · SpO₂ deficit + demam + RR naik' },
  { id: 'bronchitis',        name: 'Bronchitis Akut',                   icon: '😷', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 14, tagline: 'Inflamasi bronkus · 90% viral · self-limiting 1-3 minggu' },
  { id: 'asma-exacerbation', name: 'Prediksi Asma Eksaserbasi',         icon: '⚡', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 16, tagline: 'Forecast 6-24 jam · LSTM model' },
  { id: 'copd-exacerbation', name: 'Prediksi COPD Eksaserbasi',         icon: '⚡', category: 'Pernapasan',   aura: 'aura-coral',  baseline: 8,  tagline: 'Forecast 24-48 jam · trend RR + SpO₂' },
  { id: 'sleep-apnea',       name: 'Sleep Apnea Screening',             icon: '😴', category: 'Pernapasan',   aura: 'aura-blue',   baseline: 14, tagline: 'OSA · ODI screening saat tidur (PPG)' },

  // ── Kardiovaskular ──────────────────────────────────
  { id: 'afib',              name: 'Aritmia / AFib',                    icon: '❤️', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 6,  tagline: 'Atrial fibrillation · skrining via HRV CNN' },
  { id: 'bradikardia',       name: 'Bradikardia',                       icon: '🐢', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 5,  tagline: 'HR < 60 bpm istirahat (athletic vs pathologic)' },
  { id: 'takikardia',        name: 'Takikardia Istirahat',              icon: '🐇', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 8,  tagline: 'RHR > 100 bpm · indikasi kompensasi/patologi' },
  { id: 'ektopik-beat',      name: 'PVC / PAC (Ektopik Beat)',          icon: '💗', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 10, tagline: 'Premature contraction · trigger caffeine/stres' },
  { id: 'hipertensi',        name: 'Hipertensi (Estimasi PWV/PTT)',     icon: '🩸', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 18, tagline: 'PPG-based BP screening · butuh konfirmasi cuff' },
  { id: 'vasovagal',         name: 'Vasovagal Syncope Risk',            icon: '🫨', category: 'Kardiovaskular', aura: 'aura-pink',  baseline: 4,  tagline: 'Reflex pingsan · HR drop + SpO₂ dip pattern' },
  { id: 'cv-fitness',        name: 'CV Fitness Decline',                icon: '📉', category: 'Kardiovaskular', aura: 'aura-cyan',  baseline: 12, tagline: 'VO₂max + HR recovery rate · predictor mortality' },
  { id: 'cardiac-event',     name: 'Cardiac Event Risk',                icon: '🚨', category: 'Kardiovaskular', aura: 'aura-coral', baseline: 3,  tagline: 'Composite acute cardiac event indicator' },

  // ── Heat & Hidrasi ──────────────────────────────────
  { id: 'heatstroke',        name: 'Heatstroke',                         icon: '🥵', category: 'Heat',         aura: 'aura-coral',  baseline: 22, tagline: 'Suhu inti >40°C · failure thermoregulation' },
  { id: 'kelelahan-panas',   name: 'Kelelahan Panas',                    icon: '🌡️', category: 'Heat',         aura: 'aura-amber',  baseline: 12, tagline: 'Heat exhaustion · stage sebelum heatstroke' },
  { id: 'dehidrasi',         name: 'Dehidrasi',                          icon: '💧', category: 'Heat',         aura: 'aura-cyan',   baseline: 18, tagline: 'Kehilangan cairan tubuh · turunkan performa fisik' },
  { id: 'heat-cramps',       name: 'Heat Cramps',                        icon: '🦵', category: 'Heat',         aura: 'aura-coral',  baseline: 8,  tagline: 'Kram otot saat panas · sodium depletion' },
  { id: 'hyponatremia',      name: 'Hyponatremia (EAH)',                 icon: '🧂', category: 'Heat',         aura: 'aura-blue',   baseline: 4,  tagline: 'Overhydration sodium drop · marathon risk' },

  // ── Kulit & UV ──────────────────────────────────────
  { id: 'sunburn',           name: 'Sunburn / Kerusakan Kulit',          icon: '☀️', category: 'Kulit & UV',   aura: 'aura-amber',  baseline: 28, tagline: 'Paparan UV berlebih · sunburn + photoaging' },
  { id: 'photokeratitis',    name: 'Photokeratitis',                     icon: '👁️', category: 'Kulit & UV',   aura: 'aura-amber',  baseline: 6,  tagline: 'UV burn pada mata · onset 4-12 jam' },
  { id: 'vitamin-d',         name: 'Vitamin D Status',                   icon: '🌞', category: 'Kulit & UV',   aura: 'aura-amber',  baseline: 35, tagline: 'Tracking sintesis dari paparan UV-B kulit' },
  { id: 'skin-cancer',       name: 'Skin Cancer Risk',                   icon: '🔬', category: 'Kulit & UV',   aura: 'aura-coral',  baseline: 4,  tagline: 'UV cumulative lifetime · long-term risk' },

  // ── Suhu Tubuh ──────────────────────────────────────
  { id: 'demam',             name: 'Demam (Fever)',                      icon: '🤒', category: 'Suhu Tubuh',   aura: 'aura-coral',  baseline: 5,  tagline: 'Suhu tubuh > 37.5°C · mekanisme imun' },
  { id: 'hipotermia',        name: 'Hipotermia',                         icon: '🥶', category: 'Suhu Tubuh',   aura: 'aura-blue',   baseline: 3,  tagline: 'Body core < 35°C · jarang di tropis' },

  // ── Stress & Mental ─────────────────────────────────
  { id: 'stress-kronik',     name: 'Stres Kronik',                       icon: '😰', category: 'Stress & Mental', aura: 'aura-violet', baseline: 18, tagline: 'HRV persistent decline + LF/HF imbalance' },
  { id: 'burnout',           name: 'Burnout Risk',                       icon: '🪫', category: 'Stress & Mental', aura: 'aura-violet', baseline: 14, tagline: 'Emotional + physical exhaustion · Maslach MBI' },
  { id: 'anxiety-panic',     name: 'Panic Attack',                       icon: '😱', category: 'Stress & Mental', aura: 'aura-pink',   baseline: 6,  tagline: 'Acute sympathetic surge · self-limiting 10-30 mnt' },
  { id: 'sleep-deprivation', name: 'Sleep Deprivation',                  icon: '😪', category: 'Stress & Mental', aura: 'aura-blue',   baseline: 16, tagline: 'Cumulative sleep debt · <7h/malam' },

  // ── Aktivitas & Performa ────────────────────────────
  { id: 'overtraining',      name: 'Overtraining Syndrome',              icon: '🏋️', category: 'Aktivitas',    aura: 'aura-violet', baseline: 8,  tagline: 'NFOR/OTS · HRV decline + performance drop' },
  { id: 'sedentary',         name: 'Sedentary Lifestyle Risk',           icon: '🛋️', category: 'Aktivitas',    aura: 'aura-amber',  baseline: 22, tagline: 'Inactivity-related · 4th leading cause mortality' },

  // ── Triggers / Predictors ───────────────────────────
  { id: 'migraine-trigger',  name: 'Migraine Trigger',                   icon: '🤕', category: 'Triggers',     aura: 'aura-violet', baseline: 14, tagline: 'Multi-modal: heat, UV, dehydration, sleep, stress' },
];

window.DISEASE_CATEGORIES = [
  { id: 'Composite',        icon: '🌍', count: 1 },
  { id: 'Pernapasan',       icon: '🫁', count: 9 },
  { id: 'Kardiovaskular',   icon: '❤️', count: 8 },
  { id: 'Heat',             icon: '🥵', count: 5 },
  { id: 'Kulit & UV',       icon: '☀️', count: 4 },
  { id: 'Suhu Tubuh',       icon: '🌡️', count: 2 },
  { id: 'Stress & Mental',  icon: '🧠', count: 4 },
  { id: 'Aktivitas',        icon: '🏃', count: 2 },
  { id: 'Triggers',         icon: '⚡', count: 1 },
];
