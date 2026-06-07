# AERVINEX i18n Strings — Cluster B (Risk + Health + Assessment)

Extraction of all Indonesian user-facing strings + English translation proposals for the 7 risk/health/assessment pages and 3 JS data files that feed them.

---

### From: public/risk-list.html (12 strings)
```js
'Semua Risk Factor — AERVINEX': 'All Risk Factors — AERVINEX',
'Katalog 35 risiko kesehatan AERVINEX: pernapasan, kardiovaskular, panas, UV, mental — klik untuk detail dan self-assessment.': 'Catalog of 35 AERVINEX health risks: respiratory, cardiovascular, heat, UV, mental — tap for details and self-assessment.',
'35 risiko kesehatan dengan deteksi ML — eksplorasi katalog AERVINEX.': '35 health risks with ML detection — explore the AERVINEX catalog.',
'Lewati ke konten utama': 'Skip to main content',
'Semua Risk Factor': 'All Risk Factors',
'35 kondisi · klik untuk detail / assessment': '35 conditions · tap for details / assessment',
'Cari nama kondisi atau gejala...': 'Search condition name or symptom...',
'Navigasi utama': 'Main navigation',
'Semua': 'All',
'kondisi': 'conditions',
'dari': 'of',
'Tidak ada kondisi yang cocok dengan filter ini': 'No conditions match this filter',
```

---

### From: public/risk-detail.html (220+ strings — most complex page)

#### Header / shell
```js
'Detail risiko: skor real-time, breakdown faktor, dataset training, dan rekomendasi tindakan per kondisi (35 model AERVINEX).': 'Risk detail: real-time score, factor breakdown, training dataset, and action recommendations per condition (35 AERVINEX models).',
'Risk Detail': 'Risk Detail',
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Risiko saat ini': 'Current risk',
'Faktor Kontribusi': 'Contributing Factors',
'Trend Risiko 24 Jam': '24-Hour Risk Trend',
'Aksi Mitigasi': 'Mitigation Actions',
'Ikuti Self-Assessment Kondisi Ini': 'Take Self-Assessment for This Condition',
'Tentang Risiko Ini': 'About This Risk',
'⚕️ Disclaimer:': '⚕️ Disclaimer:',
'AERVINEX adalah wellness tool, bukan alat medis.': 'AERVINEX is a wellness tool, not a medical device.',
'Skor di atas berbasis ML screening — bukan diagnosa. Untuk diagnosa konsultasi dokter.': 'The score above is ML-based screening — not a diagnosis. Consult a doctor for diagnosis.',
'Darurat medis:': 'Medical emergency:',
'Lapor adverse event →': 'Report adverse event →',
'🔬 XAI · Transparansi AI': '🔬 XAI · AI Transparency',
'Kontribusi': 'Contribution',
'bobot': 'weight',
'DETAIL →': 'DETAIL →',
'Inference status': 'Inference status',
'LIVE ML': 'LIVE ML',
'HEURISTIC': 'HEURISTIC',
'ML Model': 'ML Model',
'Performance': 'Performance',
'Dataset Training': 'Training Dataset',
'Feature Importance (SHAP)': 'Feature Importance (SHAP)',
'Referensi': 'References',
'Limitasi': 'Limitations',
'Lihat dokumentasi riset lengkap · SLR · Kaggle EDA · ML Pipeline →': 'View full research documentation · SLR · Kaggle EDA · ML Pipeline →',
```

#### Severity labels & status messages
```js
'RINGAN': 'MILD',
'SEDANG': 'MODERATE',
'TINGGI': 'HIGH',
'KRITIS': 'CRITICAL',
'Tidak ada tindakan urgent': 'No urgent action needed',
'Pantau parameter — lakukan mitigasi preventif': 'Monitor parameters — apply preventive mitigation',
'Aksi mitigasi disarankan segera': 'Mitigation action recommended immediately',
'Hentikan aktivitas — segera mitigasi': 'Stop activity — mitigate immediately',
```

#### TEPRS (Environment Health Risk) — 8 strings
```js
'Environment Health Risk': 'Environment Health Risk',
'TEPRS · Composite score': 'TEPRS · Composite score',
'PM2.5 (kualitas udara)': 'PM2.5 (air quality)',
'Heart Rate baseline': 'Heart rate baseline',
'SpO₂ deficit': 'SpO₂ deficit',
'Pakai masker N95 saat outdoor': 'Wear an N95 mask when outdoors',
'Jika PM2.5 di atas 35 μg/m³, partikel halus menembus saluran napas dalam': 'When PM2.5 exceeds 35 μg/m³, fine particles penetrate the deep airways',
'Hidrasi 250-500ml per 30 menit': 'Hydrate 250–500 ml every 30 minutes',
'Heat + UV meningkatkan kehilangan cairan': 'Heat + UV increase fluid loss',
'Pilih rute dengan vegetasi': 'Choose routes with vegetation',
'Taman/jalur pohon menurunkan PM2.5 lokal 20-40%': 'Parks and tree-lined paths reduce local PM2.5 by 20–40%',
'TEPRS (Total Environment-induced Physiological Risk Score) adalah skor gabungan yang mengukur risiko kesehatan dari kombinasi paparan lingkungan dan respons fisiologi tubuh real-time. Dikalibrasi untuk populasi tropis Asia Tenggara dengan standar TUHAM (ISPU Indonesia + WHO).': 'TEPRS (Total Environment-induced Physiological Risk Score) is a composite score measuring health risk from the combination of environmental exposure and real-time physiological response. Calibrated for Southeast Asian tropical populations using the TUHAM standard (Indonesia ISPU + WHO).',
```

#### Asma / ISPA / COPD composite
```js
'Asma / ISPA / COPD': 'Asthma / ARI / COPD',
'Risiko sistem pernapasan': 'Respiratory system risk',
'PM2.5 (pemicu utama)': 'PM2.5 (primary trigger)',
'Respiratory Rate naik': 'Respiratory rate elevated',
'Pakai masker N95 atau KN95': 'Wear an N95 or KN95 mask',
'Filter 95% partikel ≥ 0.3 μm — efektif vs PM2.5': 'Filters 95% of particles ≥ 0.3 μm — effective against PM2.5',
'Pindah ke indoor ber-AC/HEPA filter': 'Move indoors with AC/HEPA filtering',
'Air purifier dengan filter HEPA H13 menurunkan PM2.5 indoor 80%': 'Air purifiers with HEPA H13 filters reduce indoor PM2.5 by 80%',
'Hindari area dengan paparan asap': 'Avoid areas with smoke exposure',
'Rokok, knalpot, pembakaran sampah menambah PM2.5 lokal': 'Cigarettes, exhaust, and waste burning add to local PM2.5',
'Inhaler reliever harus selalu dibawa': 'Always carry a reliever inhaler',
'Untuk pengguna asma diagnosed — emergency action plan aktif': 'For diagnosed asthma users — keep your emergency action plan active',
'Asma, ISPA (Infeksi Saluran Pernapasan Akut), dan COPD (Chronic Obstructive Pulmonary Disease) memburuk drastis pada paparan PM2.5 > 35 μg/m³. AERVINEX deteksi dini lewat kombinasi air quality + respiratory rate + SpO₂.': 'Asthma, ARI (Acute Respiratory Infection), and COPD (Chronic Obstructive Pulmonary Disease) worsen dramatically at PM2.5 > 35 μg/m³. AERVINEX provides early detection via combined air quality + respiratory rate + SpO₂.',
```

#### Heatstroke
```js
'Heatstroke / Kelelahan Panas': 'Heatstroke / Heat Exhaustion',
'Risiko hipertermia': 'Hyperthermia risk',
'Heart Rate naik': 'Heart rate elevated',
'Hidrasi turun': 'Hydration dropping',
'Lama paparan': 'Exposure duration',
'Hentikan aktivitas — cari teduh segera': 'Stop activity — find shade immediately',
'Pada heat index >32°C, hentikan latihan outdoor': 'At heat index above 32°C, stop outdoor training',
'Hidrasi air + elektrolit': 'Hydrate with water + electrolytes',
'Air saja tidak cukup — tambah ORS/sport drink': 'Water alone is not enough — add ORS or a sports drink',
'Cooling: kompres dingin di leher/aksila/selangkangan': 'Cooling: cold compresses on neck, armpits, and groin',
'Tiga titik vascular utama untuk turunkan suhu inti': 'Three main vascular points to lower core temperature',
'Heat stroke = darurat medis': 'Heatstroke = medical emergency',
'Jika confusion + sangat panas tanpa keringat → 119': 'If confused + very hot without sweating → call 119',
'Heatstroke terjadi saat suhu inti tubuh > 40°C dan thermoregulation gagal. Heat Index = suhu apparent (suhu + kelembapan). Indonesia tropis sering >35°C feels-like. Pelari outdoor dan komuter motor adalah grup risiko tertinggi.': 'Heatstroke occurs when core body temperature exceeds 40°C and thermoregulation fails. Heat Index = apparent temperature (temperature + humidity). Tropical Indonesia frequently exceeds 35°C feels-like. Outdoor runners and motorbike commuters are the highest-risk groups.',
```

#### Dehidrasi (Dehydration)
```js
'Dehidrasi': 'Dehydration',
'Kehilangan cairan tubuh': 'Loss of body fluids',
'Index Hidrasi': 'Hydration index',
'Skin temperature naik': 'Skin temperature elevated',
'Minum 250-500ml dalam 30 menit': 'Drink 250–500 ml within 30 minutes',
'Target hidrasi >70% — sip bukan chug': 'Target hydration >70% — sip, do not chug',
'Tambah elektrolit pada aktivitas >60 menit': 'Add electrolytes for activity >60 minutes',
'Sodium + Potassium hilang lewat keringat': 'Sodium + potassium are lost through sweat',
'Konsumsi buah hidrasi tinggi': 'Eat fruits with high water content',
'Semangka, mentimun, jeruk — water content 90%+': 'Watermelon, cucumber, orange — 90%+ water content',
'Dehidrasi 2% berat badan sudah turunkan performa fisik 10-20%. Dehidrasi 4% = sakit kepala, lelah, irritability. Pelari dan komuter di iklim tropis sangat rentan terutama siang hari.': 'Dehydration of just 2% body weight already reduces physical performance by 10–20%. Dehydration of 4% = headache, fatigue, irritability. Runners and commuters in tropical climates are highly vulnerable, especially at midday.',
```

#### AFib / Atrial Fibrillation
```js
'Aritmia / Atrial Fibrillation': 'Arrhythmia / Atrial Fibrillation',
'Gangguan ritme jantung': 'Heart rhythm disturbance',
'HR variability irregular': 'HR variability irregular',
'Resting HR elevated': 'Resting HR elevated',
'Catat episode + waktu kejadian': 'Log each episode + time of occurrence',
'AFib paroksismal datang-pergi. Frekuensi penting untuk evaluasi medis': 'Paroxysmal AFib comes and goes. Frequency matters for medical evaluation',
'Konsultasi kardiolog untuk EKG': 'Consult a cardiologist for an ECG',
'AERVINEX deteksi screening — diagnosis butuh EKG 12-lead': 'AERVINEX provides screening detection — diagnosis requires a 12-lead ECG',
'Kurangi caffeine, alcohol, nikotin': 'Reduce caffeine, alcohol, and nicotine',
'Trigger umum AFib di populasi muda': 'Common AFib triggers in younger populations',
'Atrial Fibrillation adalah aritmia paling umum. Sering asimptomatik tapi 5x lipat risiko stroke. AERVINEX skrining lewat HRV analysis (Poincaré plot + frequency domain) — bukan pengganti EKG, tapi early warning yang valid.': 'Atrial fibrillation is the most common arrhythmia. Often asymptomatic but carries a 5-fold stroke risk. AERVINEX screens via HRV analysis (Poincaré plot + frequency domain) — not a replacement for ECG, but a valid early warning.',
```

#### Sunburn
```js
'Sunburn / Kerusakan Kulit': 'Sunburn / Skin Damage',
'Paparan UV berlebih': 'Excess UV exposure',
'UV Index saat ini': 'Current UV index',
'Heat (intensifies UV)': 'Heat (intensifies UV)',
'Cumulative UV today': 'Cumulative UV today',
'dosis': 'dose',
'Sunscreen SPF 30+ re-apply tiap 2 jam': 'Reapply SPF 30+ sunscreen every 2 hours',
'Broad-spectrum (UVA + UVB). SPF 50 untuk UV >7': 'Broad-spectrum (UVA + UVB). SPF 50 for UV >7',
'Lengan panjang + topi lebar': 'Long sleeves + wide-brim hat',
'Kain UPF 50+ lebih efektif dari sunscreen di kulit': 'UPF 50+ fabric is more effective than sunscreen on skin',
'Hindari 10:00-15:00 saat UV puncak': 'Avoid 10:00–15:00 when UV peaks',
'Sun shadow rule: bayangan < tinggi badan = UV tinggi': 'Sun-shadow rule: shadow shorter than your height = high UV',
'Paparan UV kumulatif sebabkan photoaging (premature aging), DNA damage, dan meningkatkan risiko skin cancer (melanoma, BCC, SCC). UV index >6 selama 30 menit = sunburn pada skin tipe Asia Tenggara.': 'Cumulative UV exposure causes photoaging (premature aging), DNA damage, and increases skin cancer risk (melanoma, BCC, SCC). UV index >6 for 30 minutes = sunburn for Southeast Asian skin types.',
```

#### ISPA (ARI)
```js
'ISPA · Infeksi Saluran Pernapasan Akut': 'ARI · Acute Respiratory Infection',
'Akut · dipicu polusi + droplet': 'Acute · triggered by pollution + droplets',
'PM2.5 (pemicu inflamasi)': 'PM2.5 (inflammation trigger)',
'PM10 (saluran atas)': 'PM10 (upper airway)',
'Body Temp (demam)': 'Body temp (fever)',
'Masker N95 saat outdoor': 'N95 mask when outdoors',
'PM2.5 + droplet pemicu utama ISPA viral & bakterial': 'PM2.5 + droplets are the main triggers of viral and bacterial ARI',
'Hidrasi hangat + madu': 'Warm hydration + honey',
'Mengurangi iritasi saluran napas atas': 'Reduces upper airway irritation',
'Konsultasi jika demam >38°C atau >3 hari': 'Consult if fever >38°C or persists >3 days',
'Mungkin butuh antibiotik (jika bakterial)': 'May require antibiotics (if bacterial)',
'ISPA adalah penyebab #1 rawat jalan di Indonesia (Riskesdas). Polusi PM2.5 + PM10 melemahkan mukosa saluran napas, meningkatkan kerentanan terhadap infeksi viral/bakterial.': 'ARI is the #1 outpatient cause in Indonesia (Riskesdas). PM2.5 + PM10 pollution weakens the airway mucosa, increasing vulnerability to viral and bacterial infections.',
```

#### COPD
```js
'COPD · Chronic Obstructive Pulmonary Disease': 'COPD · Chronic Obstructive Pulmonary Disease',
'Kronik · obstruksi saluran napas': 'Chronic · airway obstruction',
'PM2.5 paparan jangka panjang': 'PM2.5 long-term exposure',
'SpO₂ saat istirahat': 'SpO₂ at rest',
'Forced Expiratory baseline': 'Forced expiratory baseline',
'Hindari asap rokok aktif/pasif': 'Avoid active and passive cigarette smoke',
'Faktor risiko #1 COPD setelah polusi': 'COPD risk factor #1 after pollution',
'Pursed-lip breathing': 'Pursed-lip breathing',
'Teknik napas membantu kosongkan paru lebih efisien': 'A breathing technique that helps empty the lungs more efficiently',
'Inhaler bronkodilator (jika diresepkan)': 'Bronchodilator inhaler (if prescribed)',
'Untuk diagnosed COPD — rescue inhaler harus dibawa': 'For diagnosed COPD — always carry your rescue inhaler',
'Spirometri tahunan': 'Annual spirometry',
'COPD progresif — pantau FEV1 yearly': 'COPD is progressive — monitor FEV1 yearly',
'COPD adalah kondisi kronik tidak reversibel — saluran napas mengalami obstruksi permanen. Polusi udara + paparan asap jangka panjang adalah penyebab utama. AERVINEX skrining via baseline SpO₂ + frekuensi sesak napas.': 'COPD is a chronic, irreversible condition — the airways suffer permanent obstruction. Air pollution + long-term smoke exposure are the main causes. AERVINEX screens via baseline SpO₂ + shortness-of-breath frequency.',
```

#### Hipoksia / Hypoxia
```js
'Hipoksia Ringan': 'Mild Hypoxia',
'Penurunan oksigenasi jaringan': 'Reduced tissue oxygenation',
'SpO₂ deficit dari baseline': 'SpO₂ deficit from baseline',
'HR kompensasi naik': 'Compensatory HR elevated',
'PM2.5 ambient': 'Ambient PM2.5',
'Deep breathing 5 menit': '5-minute deep breathing',
'Tarik nafas 4 detik → tahan 4 → keluarkan 6 detik': 'Inhale 4 seconds → hold 4 → exhale 6 seconds',
'Pindah ke area dengan udara segar': 'Move to an area with fresh air',
'PM2.5 rendah + vegetasi → oksigenasi optimal': 'Low PM2.5 + vegetation → optimal oxygenation',
'Jika SpO₂ < 92% persisten, konsultasi': 'If SpO₂ <92% persists, consult a doctor',
'Hipoksia akut bisa berarti emboli paru / pneumonia': 'Acute hypoxia can indicate pulmonary embolism or pneumonia',
'Hipoksia ringan terjadi saat oksigen di darah turun. Sebab tropis Asia Tenggara: polusi tinggi + kelembapan + suhu. SpO₂ normal: 95-100%. AERVINEX baselines per user dan deteksi deviasi 24-jam.': 'Mild hypoxia occurs when blood oxygen drops. Southeast Asian tropical causes: high pollution + humidity + heat. Normal SpO₂: 95–100%. AERVINEX baselines per user and detects 24-hour deviations.',
```

#### Heat Exhaustion (Kelelahan Panas)
```js
'Kelelahan Panas (Heat Exhaustion)': 'Heat Exhaustion',
'Stage sebelum heatstroke': 'Stage before heatstroke',
'Sweat rate (skin temp drop)': 'Sweat rate (skin temp drop)',
'Cari teduh + istirahat 10-15 menit': 'Find shade + rest for 10–15 minutes',
'Kelelahan panas reversible kalau ditangani cepat': 'Heat exhaustion is reversible if treated quickly',
'Sport drink (sodium + glukosa)': 'Sports drink (sodium + glucose)',
'Air saja kurang efektif saat keringat banyak': 'Plain water is insufficient with heavy sweating',
'Cooling: handuk basah di leher': 'Cooling: wet towel on the neck',
'Turunkan suhu kulit sebelum jadi heatstroke': 'Lower skin temperature before it becomes heatstroke',
'Hentikan jika gejala memburuk': 'Stop if symptoms worsen',
'Mual, pusing, atau kebingungan → emergency': 'Nausea, dizziness, or confusion → emergency',
'Kelelahan panas (heat exhaustion) terjadi sebelum heatstroke. Gejala: keringat berlebih, lelah, kram otot, mual, pusing. Reversible dengan istirahat + hidrasi. Bila tidak ditangani → progress ke heatstroke (suhu >40°C, status mental berubah).': 'Heat exhaustion occurs before heatstroke. Symptoms: excessive sweating, fatigue, muscle cramps, nausea, dizziness. Reversible with rest + hydration. Untreated → progresses to heatstroke (temp >40°C, altered mental status).',
```

#### Pneumonia
```js
'Pneumonia': 'Pneumonia',
'Infeksi paru berat': 'Severe lung infection',
'PM2.5 paparan kronik': 'PM2.5 chronic exposure',
'Respiratory Rate': 'Respiratory rate',
'Konsultasi medis segera jika demam >38.5°C + sesak': 'Seek medical attention immediately if fever >38.5°C + shortness of breath',
'Pneumonia butuh diagnosis radiologi + antibiotik': 'Pneumonia requires radiological diagnosis + antibiotics',
'Hidrasi adekuat': 'Adequate hydration',
'Mucus lebih mudah dikeluarkan': 'Mucus is easier to expel',
'Istirahat total': 'Complete rest',
'Reduksi konsumsi O₂': 'Reduces O₂ consumption',
'Pneumonia menyebabkan ~5 juta kematian global per tahun. Polusi PM2.5 meningkatkan risiko 14% per 10 μg/m³ (WHO 2021). AERVINEX skrining via kombinasi SpO₂ + RR + body temp trend.': 'Pneumonia causes ~5 million global deaths annually. PM2.5 pollution raises risk by 14% per 10 μg/m³ (WHO 2021). AERVINEX screens via combined SpO₂ + RR + body temp trend.',
```

#### Bronchitis
```js
'Bronchitis Akut': 'Acute Bronchitis',
'Inflamasi bronkus': 'Bronchial inflammation',
'RR naik (batuk)': 'RR elevated (cough)',
'Body Temp': 'Body temp',
'Soothe iritasi mukosa bronkus': 'Soothes bronchial mucosal irritation',
'Hindari iritan (asap, parfum)': 'Avoid irritants (smoke, perfume)',
'Kurangi pemicu batuk': 'Reduces cough triggers',
'Jika batuk >3 minggu, konsultasi': 'If cough persists >3 weeks, consult a doctor',
'Mungkin progress ke chronic bronchitis': 'May progress to chronic bronchitis',
'Bronchitis akut: 90% viral, recovery 1-3 minggu. Polusi udara memperpanjang gejala 40%. AERVINEX deteksi via PM10 + RR trend + body temp.': 'Acute bronchitis: 90% viral, 1–3 week recovery. Air pollution prolongs symptoms by 40%. AERVINEX detects via PM10 + RR trend + body temp.',
```

#### Asma Exacerbation
```js
'Prediksi Asma Eksaserbasi': 'Asthma Exacerbation Prediction',
'Forecast 6-24 jam': 'Forecast 6–24 hours',
'PM2.5 trend (3 jam)': 'PM2.5 trend (3 hours)',
'RR baseline shift': 'RR baseline shift',
'SpO₂ drift down': 'SpO₂ drifting down',
'Humidity (dampness)': 'Humidity (dampness)',
'Inhaler controller pagi-malam': 'Controller inhaler morning and evening',
'Sebelum eksaserbasi nyata': 'Before exacerbation manifests',
'Indoor saat PM2.5 spike diprediksi': 'Stay indoors when a PM2.5 spike is predicted',
'Reduce trigger exposure': 'Reduce trigger exposure',
'Update Asthma Action Plan': 'Update Asthma Action Plan',
'Konsultasi dokter untuk titrasi': 'Consult your doctor for titration',
'Prediksi eksaserbasi asma 6-24 jam sebelum gejala manifest. Akurasi prediksi 6 jam ahead: 88%. Berdasar trend PM2.5 + perubahan baseline fisiologi user.': 'Predicts asthma exacerbation 6–24 hours before symptoms manifest. 6-hour-ahead prediction accuracy: 88%. Based on PM2.5 trend + user physiology baseline shifts.',
```

#### COPD Exacerbation
```js
'Prediksi COPD Eksaserbasi': 'COPD Exacerbation Prediction',
'Forecast 24-48 jam': 'Forecast 24–48 hours',
'RR trend up (5 hari)': 'RR trending up (5 days)',
'SpO₂ baseline drop': 'SpO₂ baseline drop',
'HR resting up': 'Resting HR trending up',
'PM2.5 cum 7d': 'PM2.5 cumulative 7d',
'Rescue inhaler harus dibawa': 'Always carry rescue inhaler',
'Eksaserbasi bisa mendadak': 'Exacerbations can be sudden',
'Self-monitoring intensif': 'Intensive self-monitoring',
'Spirometry portable jika ada': 'Use portable spirometry if available',
'Konsultasi early intervention': 'Consult for early intervention',
'Reduce hospital admission': 'Reduces hospital admission',
'COPD exacerbation prediction berbasis trend RR + SpO₂ baseline 5-7 hari. Early warning 24-48 jam reduce hospital admission 35% (Cochrane review 2022).': 'COPD exacerbation prediction based on RR trend + SpO₂ baseline over 5–7 days. A 24–48-hour early warning reduces hospital admissions by 35% (Cochrane review 2022).',
```

#### Sleep Apnea
```js
'Skrining Sleep Apnea': 'Sleep Apnea Screening',
'OSA risk · nighttime': 'OSA risk · nighttime',
'SpO₂ desat events (ODI)': 'SpO₂ desaturation events (ODI)',
'Suspected snoring (HR pattern)': 'Suspected snoring (HR pattern)',
'BMI (estimated)': 'BMI (estimated)',
'Polysomnografi (PSG)': 'Polysomnography (PSG)',
'Gold standard diagnosis OSA': 'Gold standard for OSA diagnosis',
'Sleep posisi lateral': 'Sleep in a lateral position',
'Reduce upper airway collapse': 'Reduces upper airway collapse',
'BB control (jika overweight)': 'Weight control (if overweight)',
'Faktor risiko #1 modifiable': 'The #1 modifiable risk factor',
'Obstructive Sleep Apnea (OSA) underdiagnosis di Indonesia. AERVINEX skrining ODI (Oxygen Desaturation Index) via PPG saat tidur. ODI > 5/jam = suggestive OSA, butuh PSG.': 'Obstructive Sleep Apnea (OSA) is underdiagnosed in Indonesia. AERVINEX screens ODI (Oxygen Desaturation Index) via PPG during sleep. ODI >5/hour = suggestive of OSA, requires PSG.',
```

#### Bradikardia
```js
'Bradikardia': 'Bradycardia',
'HR < 60 bpm istirahat': 'HR <60 bpm at rest',
'HR resting': 'Resting HR',
'Symptomatic (dizziness)': 'Symptomatic (dizziness)',
'Fitness adjusted (athlete)': 'Fitness-adjusted (athlete)',
'EKG jika simptomatik': 'ECG if symptomatic',
'Bradikardia simptomatik = darurat': 'Symptomatic bradycardia = emergency',
'Athletic bradycardia = sehat': 'Athletic bradycardia = healthy',
'HR 40-50 bpm pada atlet normal': '40–50 bpm HR is normal in athletes',
'Cek interaksi obat': 'Check medication interactions',
'Beta-blocker dll bisa picu bradikardia': 'Beta-blockers and similar drugs can trigger bradycardia',
'Bradikardia: HR <60 bpm. Pada atlet trained, RHR 40-50 normal. Pada non-atlet, bisa indikasi gangguan konduksi jantung (sick sinus, AV block).': 'Bradycardia: HR <60 bpm. In trained athletes, RHR 40–50 is normal. In non-athletes, it may indicate cardiac conduction disorders (sick sinus, AV block).',
```

#### Takikardia
```js
'Takikardia Istirahat': 'Resting Tachycardia',
'RHR > 100 bpm': 'RHR >100 bpm',
'Stress (HRV decline)': 'Stress (HRV decline)',
'Dehidrasi': 'Dehydration',
'Demam': 'Fever',
'Identifikasi penyebab': 'Identify the cause',
'Demam, dehidrasi, hipertiroid, anemia, stres': 'Fever, dehydration, hyperthyroidism, anemia, stress',
'Volume depletion → kompensasi HR': 'Volume depletion → HR compensation',
'Stress management': 'Stress management',
'Vagal tone improve → HR turun': 'Improved vagal tone → lower HR',
'Resting tachycardia (HR>100 saat istirahat) = warning sign. Bisa kompensasi (dehidrasi, anemia, demam) atau patologi (hipertiroid, gagal jantung dini).': 'Resting tachycardia (HR >100 at rest) is a warning sign. It may be compensatory (dehydration, anemia, fever) or pathological (hyperthyroidism, early heart failure).',
```

#### Ektopik Beat
```js
'PVC / PAC (Ektopik Beat)': 'PVC / PAC (Ectopic Beat)',
'Premature contraction': 'Premature contraction',
'Beat irregularity (RR std)': 'Beat irregularity (RR std)',
'Symptomatic palpitations': 'Symptomatic palpitations',
'Caffeine intake (proxy)': 'Caffeine intake (proxy)',
'Stress level': 'Stress level',
'Kurangi caffeine, alkohol, nikotin': 'Reduce caffeine, alcohol, and nicotine',
'Trigger umum ektopik beat': 'Common ectopic beat triggers',
'Stress reduction': 'Stress reduction',
'Sympathetic activation = trigger PVC': 'Sympathetic activation triggers PVCs',
'Holter 24-48 jam jika frequent': '24–48 hour Holter monitor if frequent',
'>1000 PVC/hari butuh evaluasi': '>1000 PVCs/day requires evaluation',
'PVC (Premature Ventricular Contraction) / PAC (atrial) — beat ektopik. Sporadik = normal. Frequent (>1000/hari) atau symptomatic = butuh evaluasi struktural jantung.': 'PVC (Premature Ventricular Contraction) / PAC (atrial) — ectopic beats. Sporadic = normal. Frequent (>1000/day) or symptomatic = requires structural cardiac evaluation.',
```

#### Hipertensi
```js
'Hipertensi (Estimasi)': 'Hypertension (Estimated)',
'Via PWV/PTT proxy': 'Via PWV/PTT proxy',
'Pulse Wave Velocity (est)': 'Pulse Wave Velocity (est)',
'Pulse Transit Time': 'Pulse Transit Time',
'HR resting elevated': 'Resting HR elevated',
'Konfirmasi dengan sphygmomanometer': 'Confirm with a sphygmomanometer',
'AERVINEX hanya screening, bukan diagnosis': 'AERVINEX is screening only, not a diagnosis',
'Reduce sodium <5g/hari': 'Reduce sodium to <5 g/day',
'WHO recommendation': 'WHO recommendation',
'Aktivitas 150 mnt/minggu': '150 min/week of activity',
'Aerobik intensitas sedang': 'Moderate-intensity aerobic',
'Hipertensi screening via Pulse Wave Velocity (PWV) dan Pulse Transit Time (PTT) dari PPG. Bukan pengganti cuff BP tapi tracking trend longitudinal. Sensitivitas ~78% (PWV-based).': 'Hypertension screening via Pulse Wave Velocity (PWV) and Pulse Transit Time (PTT) from PPG. Not a cuff-BP replacement but useful for longitudinal trend tracking. Sensitivity ~78% (PWV-based).',
```

#### Vasovagal
```js
'Vasovagal Syncope Risk': 'Vasovagal Syncope Risk',
'Pingsan reflex': 'Reflex fainting',
'HR sudden drop pattern': 'Sudden HR drop pattern',
'SpO₂ dip': 'SpO₂ dip',
'Stand-up posture (orthostatic)': 'Standing posture (orthostatic)',
'Hydration': 'Hydration',
'Counter-pressure maneuvers': 'Counter-pressure maneuvers',
'Crossed legs + flexed muscles': 'Crossed legs + flexed muscles',
'Hidrasi + intake garam': 'Hydration + salt intake',
'Volume expansion preventive': 'Preventive volume expansion',
'Hindari trigger': 'Avoid triggers',
'Berdiri lama, panas, lapar': 'Prolonged standing, heat, hunger',
'Vasovagal syncope (vasovagal reaction) = kehilangan kesadaran sementara akibat reflex parasimpatik berlebih. AERVINEX deteksi pola pre-syncope (HR drop + SpO₂ dip).': 'Vasovagal syncope (vasovagal reaction) = temporary loss of consciousness from excessive parasympathetic reflex. AERVINEX detects pre-syncope patterns (HR drop + SpO₂ dip).',
```

#### CV Fitness
```js
'CV Fitness Decline': 'Cardiovascular Fitness Decline',
'VO₂max trend down': 'VO₂max trending down',
'HR recovery 1-min': '1-minute HR recovery',
'VO₂max estimated': 'Estimated VO₂max',
'Resting HR trend up': 'Resting HR trending up',
'Activity decrease': 'Activity decrease',
'Build aerobic base': 'Build aerobic base',
'VO₂max improvement specific': 'Specific VO₂max improvement',
'Track HR recovery monthly': 'Track HR recovery monthly',
'Best indicator fitness': 'The best fitness indicator',
'VO₂max + HR recovery rate adalah predictor kuat all-cause mortality. Decline 1 MET ≈ +13% risiko kardiovaskular (Cooper Institute 2018).': 'VO₂max + HR recovery rate are strong predictors of all-cause mortality. A 1 MET decline ≈ +13% cardiovascular risk (Cooper Institute 2018).',
```

#### Heat Cramps
```js
'Heat Cramps': 'Heat Cramps',
'Kram otot saat panas': 'Muscle cramps in heat',
'Sweat loss (Na+ deplete)': 'Sweat loss (Na+ depletion)',
'Activity duration': 'Activity duration',
'Hidrasi': 'Hydration',
'Sodium 0.5-0.7g/L cairan': 'Sodium 0.5–0.7 g per liter of fluid',
'Replace electrolyte loss': 'Replaces electrolyte loss',
'Stretching ringan otot kram': 'Gentle stretching of cramped muscles',
'Manual relief': 'Manual relief',
'Stop aktivitas sementara': 'Stop activity temporarily',
'Recovery cepat': 'Quick recovery',
'Heat cramps = kram otot akibat sweat-induced sodium depletion. Sering pada pelari/atlet di iklim tropis. Reversible <30 menit dengan elektrolit + rest.': 'Heat cramps = muscle cramps caused by sweat-induced sodium depletion. Common in runners/athletes in tropical climates. Reversible in <30 minutes with electrolytes + rest.',
```

#### Hyponatremia
```js
'Hyponatremia': 'Hyponatremia',
'Overhydration sodium drop': 'Overhydration sodium drop',
'Water intake excess': 'Excess water intake',
'Sodium replacement': 'Sodium replacement',
'Duration > 4 jam': 'Duration >4 hours',
'Body weight gain': 'Body weight gain',
'Sport drink, bukan air kosong': 'Sports drink, not plain water',
'Untuk aktivitas >2 jam': 'For activity >2 hours',
'Tracking berat sebelum-setelah': 'Track weight before vs after',
'Naik = overhydration': 'Weight gain = overhydration',
'Sakit kepala + nausea + confusion': 'Headache + nausea + confusion',
'Emergency, butuh saline IV': 'Emergency, IV saline required',
'Hyponatremia (exercise-associated, EAH) = Na serum <135 mmol/L akibat overhydration. Marathon runners high risk. Severe EAH (Na<125) = emergency.': 'Hyponatremia (exercise-associated, EAH) = serum Na <135 mmol/L from overhydration. Marathon runners are high risk. Severe EAH (Na <125) = emergency.',
```

#### Photokeratitis
```js
'Photokeratitis': 'Photokeratitis',
'UV burn pada mata': 'UV burn on the eyes',
'UV Index': 'UV Index',
'Reflective surface (snow/water)': 'Reflective surface (snow/water)',
'Duration unprotected': 'Unprotected duration',
'Altitude (high UV)': 'Altitude (high UV)',
'Sunglasses UV400 (UVA+UVB)': 'UV400 sunglasses (UVA+UVB)',
'Wajib untuk UV >5': 'Mandatory for UV >5',
'Topi lebar': 'Wide-brim hat',
'Reduce 50% UV exposure ke mata': 'Reduces eye UV exposure by 50%',
'Hindari UV puncak 10:00-15:00': 'Avoid peak UV 10:00–15:00',
'Prevention paling efektif': 'The most effective prevention',
'Photokeratitis = "snow blindness" / sunburn pada kornea. Onset 4-12 jam post-exposure. Self-limiting 24-72 jam tapi sangat nyeri. Repeated → pterygium, katarak.': 'Photokeratitis = "snow blindness" / sunburn of the cornea. Onset 4–12 hours post-exposure. Self-limiting in 24–72 hours but very painful. Repeated episodes → pterygium, cataracts.',
```

#### Vitamin D
```js
'Vitamin D Status': 'Vitamin D Status',
'Tracking sintesis kulit': 'Tracking skin synthesis',
'UV exposure deficit': 'UV exposure deficit',
'Skin pigmentation': 'Skin pigmentation',
'Indoor lifestyle': 'Indoor lifestyle',
'Sunscreen overuse': 'Sunscreen overuse',
'Paparan matahari 10-15 min/hari': '10–15 minutes of sun exposure per day',
'Pagi 09:00-10:00, lengan + wajah': 'Morning 09:00–10:00, arms + face',
'Suplementasi 1000-2000 IU/hari': 'Supplement 1,000–2,000 IU/day',
'Jika tracking UV minimal': 'If UV tracking shows minimal exposure',
'Tes 25(OH)D serum tahunan': 'Annual serum 25(OH)D test',
'Target >30 ng/mL': 'Target >30 ng/mL',
'Defisiensi vitamin D umum di Asia urban (~70% penduduk). UV-B kulit = sintesis kolekalsiferol. AERVINEX track kumulatif UV-B exposure untuk estimasi sintesis.': 'Vitamin D deficiency is common in urban Asia (~70% of the population). UV-B on skin = cholecalciferol synthesis. AERVINEX tracks cumulative UV-B exposure to estimate synthesis.',
```

#### Skin Cancer
```js
'Risiko Kanker Kulit': 'Skin Cancer Risk',
'UV cumulative · long-term': 'UV cumulative · long-term',
'UV dose cumulative (10 tahun)': 'Cumulative UV dose (10 years)',
'Skin type (Fitzpatrick)': 'Skin type (Fitzpatrick)',
'Sunburn history': 'Sunburn history',
'Family history': 'Family history',
'Self-skin exam bulanan': 'Monthly self skin exam',
'ABCDE: Asymmetry, Border, Color, Diameter, Evolving': 'ABCDE: Asymmetry, Border, Color, Diameter, Evolving',
'Dermatologi check tahunan': 'Annual dermatology check',
'Especially after 40 atau riwayat sunburn': 'Especially after 40 or with sunburn history',
'SPF 30+ daily untuk sun-exposed area': 'Daily SPF 30+ for sun-exposed areas',
'Prevention #1': 'Prevention #1',
'Skin cancer (melanoma, BCC, SCC) terkait paparan UV kumulatif. AERVINEX track lifetime UV dose untuk risk stratification. Bukan diagnostik — selalu konfirmasi dermatologi.': 'Skin cancer (melanoma, BCC, SCC) is linked to cumulative UV exposure. AERVINEX tracks lifetime UV dose for risk stratification. Not diagnostic — always confirm with a dermatologist.',
```

#### Demam (Fever)
```js
'Demam (Fever)': 'Fever',
'Suhu tubuh > 37.5°C': 'Body temp >37.5°C',
'Body Temperature': 'Body temperature',
'HR elevation': 'HR elevation',
'Symptomatic (chills/sweat)': 'Symptomatic (chills/sweat)',
'Demam meningkatkan insensible water loss': 'Fever increases insensible water loss',
'Antipyretik (paracetamol) jika nyeri': 'Antipyretic (paracetamol) if painful',
'Bukan untuk turunkan demam saja': 'Not just to lower the temperature itself',
'Konsultasi jika >38.5°C >3 hari atau >40°C': 'Consult if >38.5°C for >3 days, or >40°C',
'Cari fokus infeksi': 'Identify the source of infection',
'Demam = mekanisme imun. Onset cepat (jam) biasanya infeksi viral/bakterial. Persistent >7 hari = fever of unknown origin (FUO) butuh workup.': 'Fever is an immune mechanism. Rapid onset (within hours) is usually viral/bacterial infection. Persistent >7 days = fever of unknown origin (FUO), needs workup.',
```

#### Hipotermia
```js
'Hipotermia': 'Hypothermia',
'Body temp < 35°C': 'Body temp <35°C',
'Ambient cold exposure': 'Ambient cold exposure',
'Wet clothing': 'Wet clothing',
'Hangatkan pasif (selimut, pindah indoor)': 'Passive warming (blankets, move indoors)',
'Avoid active rewarming aggressive': 'Avoid aggressive active rewarming',
'Minuman hangat (jika sadar)': 'Warm drinks (if conscious)',
'Kalori + warm fluid': 'Calories + warm fluid',
'Severe (<32°C) = emergency': 'Severe (<32°C) = emergency',
'Risk arrhythmia, butuh rewarming kontrol RS': 'Arrhythmia risk, needs controlled rewarming in hospital',
'Hipotermia jarang di tropis kecuali pendaki/diving/AC ekstrem. Body core <35°C = mild, <32°C = severe (arrhythmia risk).': 'Hypothermia is rare in the tropics except for mountaineers, divers, or extreme AC exposure. Core <35°C = mild, <32°C = severe (arrhythmia risk).',
```

#### Stres Kronik (Chronic Stress)
```js
'Stres Kronik': 'Chronic Stress',
'HRV persistent decline': 'HRV persistent decline',
'HRV (RMSSD) trend down': 'HRV (RMSSD) trending down',
'LF/HF persistent high': 'LF/HF persistently high',
'Resting HR up': 'Resting HR elevated',
'Sleep quality decline': 'Sleep quality decline',
'Mindfulness 10-20 menit/hari': 'Mindfulness 10–20 minutes/day',
'Vagal tone improvement RCT-proven': 'RCT-proven vagal tone improvement',
'Sleep hygiene priority': 'Prioritize sleep hygiene',
'Restorative sleep = HRV recovery': 'Restorative sleep = HRV recovery',
'Walking outdoor 30 mnt': '30 minutes of outdoor walking',
'Green space + light exposure': 'Green space + light exposure',
'Stres kronik tampak sebagai HRV decline persisten + LF/HF imbalance. Berhubungan dengan all-cause mortality. Reversible dengan mindfulness, exercise, sleep.': 'Chronic stress appears as persistent HRV decline + LF/HF imbalance. Linked to all-cause mortality. Reversible with mindfulness, exercise, and sleep.',
```

#### Burnout
```js
'Burnout Risk': 'Burnout Risk',
'Emotional + physical exhaustion': 'Emotional + physical exhaustion',
'HRV decline 30 hari': '30-day HRV decline',
'Sleep deprivation': 'Sleep deprivation',
'Time-off scheduled': 'Schedule time off',
'Recovery butuh waktu disengaja': 'Recovery requires intentional time',
'Identify stressor utama': 'Identify the primary stressor',
'Pekerjaan, hubungan, finansial': 'Work, relationships, finances',
'Konsultasi mental health': 'Consult a mental health professional',
'Burnout severe = clinical depression': 'Severe burnout = clinical depression',
'Burnout (Maslach Burnout Inventory): emotional exhaustion + depersonalization + reduced efficacy. AERVINEX track via objective physiological markers + activity pattern.': 'Burnout (Maslach Burnout Inventory): emotional exhaustion + depersonalization + reduced efficacy. AERVINEX tracks it via objective physiological markers + activity patterns.',
```

#### Panic Attack
```js
'Panic Attack': 'Panic Attack',
'Acute sympathetic surge': 'Acute sympathetic surge',
'HR sudden spike': 'Sudden HR spike',
'RR hyperventilation': 'RR hyperventilation',
'HRV LF/HF spike': 'HRV LF/HF spike',
'Recent stressor': 'Recent stressor',
'Box breathing 4-4-4-4': 'Box breathing 4-4-4-4',
'Parasympathetic activation': 'Parasympathetic activation',
'Grounding (5-4-3-2-1 senses)': 'Grounding (5-4-3-2-1 senses)',
'Refocus attention': 'Refocus attention',
'Frequent panic = konsultasi': 'Frequent panic = consult a doctor',
'Mungkin generalized anxiety disorder': 'Possibly generalized anxiety disorder',
'Panic attack: HR spike sudden + hyperventilation + sympathetic surge. Self-limiting 10-30 mnt tapi sangat distressing. Frequent = panic disorder, butuh treatment.': 'Panic attack: sudden HR spike + hyperventilation + sympathetic surge. Self-limiting in 10–30 minutes but highly distressing. Frequent episodes = panic disorder, requires treatment.',
```

#### Sleep Deprivation
```js
'Sleep Deprivation': 'Sleep Deprivation',
'Cumulative sleep debt': 'Cumulative sleep debt',
'Sleep duration < 7 jam': 'Sleep duration <7 hours',
'HRV decline morning': 'Morning HRV decline',
'Activity/fatigue ratio': 'Activity/fatigue ratio',
'Konsisten 7-9 jam/malam': 'Stay consistent at 7–9 hours per night',
'Sleep debt akumulatif': 'Sleep debt is cumulative',
'Screen time off 1 jam pre-bed': 'No screens 1 hour before bed',
'Blue light suppress melatonin': 'Blue light suppresses melatonin',
'Caffeine cutoff 14:00': 'Caffeine cutoff at 14:00',
'Half-life 5 jam': 'Half-life of 5 hours',
'Sleep deprivation chronic = inflammasi sistemik + insulin resistance + immune dysfunction. <7 jam = elevated all-cause mortality.': 'Chronic sleep deprivation = systemic inflammation + insulin resistance + immune dysfunction. <7 hours = elevated all-cause mortality.',
```

#### Overtraining
```js
'Overtraining Syndrome': 'Overtraining Syndrome',
'NFOR / OTS': 'NFOR / OTS',
'HRV decline 7 hari': '7-day HRV decline',
'Resting HR rise': 'Resting HR rise',
'Performance decline': 'Performance decline',
'Training load high': 'High training load',
'Recovery week (50% reduction)': 'Recovery week (50% reduction)',
'Sub-clinical OT = NFOR, masih reversible': 'Sub-clinical OT = NFOR, still reversible',
'Track HRV daily': 'Track HRV daily',
'Indicator paling sensitif': 'The most sensitive indicator',
'Sports medicine consult jika persistent': 'Sports medicine consult if persistent',
'OTS bisa 6-12 bulan recovery': 'OTS can take 6–12 months to recover from',
'Overtraining Syndrome (OTS) = stage paling severe overreaching. Symptoms: performance decline + HRV decline + mood disturbance. Reversible NFOR vs irreversible OTS.': 'Overtraining Syndrome (OTS) = the most severe stage of overreaching. Symptoms: performance decline + HRV decline + mood disturbance. Reversible NFOR vs irreversible OTS.',
```

#### Sedentary
```js
'Sedentary Lifestyle Risk': 'Sedentary Lifestyle Risk',
'Inactivity-related': 'Inactivity-related',
'Steps < 5000/hari': 'Steps <5,000/day',
'Sit time > 8 jam/hari': 'Sit time >8 hours/day',
'No structured exercise': 'No structured exercise',
'CV fitness low': 'Low CV fitness',
'Target 7,500-10,000 steps/hari': 'Target 7,500–10,000 steps/day',
'Easy win, dose-response benefit': 'Easy win, dose-response benefit',
'Break sitting every 30 mnt': 'Break up sitting every 30 minutes',
'Movement snacks': 'Movement snacks',
'Resistance training 2x/week': 'Resistance training 2x/week',
'Sarcopenia prevention': 'Sarcopenia prevention',
'Physical inactivity = 4th leading cause of mortality globally (WHO). Sitting >8 jam/hari = elevated risk independent dari exercise.': 'Physical inactivity is the 4th leading cause of mortality globally (WHO). Sitting >8 hours/day = elevated risk independent of exercise.',
```

#### Migraine Trigger
```js
'Migraine Trigger': 'Migraine Trigger',
'Multi-modal trigger detection': 'Multi-modal trigger detection',
'Heat Index high': 'Heat Index high',
'UV bright light': 'UV bright light',
'Stress': 'Stress',
'Hidrasi proaktif': 'Proactive hydration',
'Dehidrasi trigger umum': 'Dehydration is a common trigger',
'Sunglasses + topi': 'Sunglasses + hat',
'Reduce light trigger': 'Reduces light trigger',
'Sleep regular': 'Regular sleep',
'Sleep disruption = trigger': 'Sleep disruption is a trigger',
'Abortif (triptan/NSAID) early': 'Abortive (triptan/NSAID) early',
'Pakai saat aura/awal headache': 'Use at aura/onset of headache',
'Migraine trigger multifaktorial: heat, UV, dehidrasi, sleep, stress, hormonal, food. AERVINEX track concurrent triggers untuk personalized prevention.': 'Migraine triggers are multifactorial: heat, UV, dehydration, sleep, stress, hormonal, food. AERVINEX tracks concurrent triggers for personalized prevention.',
```

#### Cardiac Event
```js
'Cardiac Event Risk': 'Cardiac Event Risk',
'Acute cardiovascular event': 'Acute cardiovascular event',
'HR severe abnormal': 'HR severely abnormal',
'SpO₂ severe drop': 'SpO₂ severe drop',
'HRV catastrophic decline': 'HRV catastrophic decline',
'Previous CV history': 'Previous CV history',
'Symptoms chest pain/syncope = 119': 'Symptoms of chest pain/syncope = call 119',
'Emergency, time-critical': 'Emergency, time-critical',
'Aspirin 162-325mg jika dicurigai MI': 'Aspirin 162–325 mg if MI suspected',
'Per AHA guidelines (jika dicurigai dokter)': 'Per AHA guidelines (if suspected by a doctor)',
'Routine follow-up cardiology': 'Routine cardiology follow-up',
'Untuk known CV disease': 'For known CV disease',
'Cardiac event risk score: composite indicator dari pattern abnormal yang prediktif. BUKAN diagnostik — emergency symptoms tetap minta evaluasi medis akut.': 'Cardiac event risk score: composite indicator from predictive abnormal patterns. NOT diagnostic — emergency symptoms still require acute medical evaluation.',
```

---

### From: public/metric-detail.html (90+ strings)

#### Page chrome / tabs / charts
```js
'Detail Metric — AERVINEX': 'Metric Detail — AERVINEX',
'Metric': 'Metric',
'1 jam': '1 hour',
'24 jam': '24 hours',
'7 hari': '7 days',
'Trend': 'Trend',
'Baseline': 'Baseline',
'Statistik 24 Jam': '24-Hour Statistics',
'Rata-rata': 'Average',
'Insight & Rekomendasi': 'Insights & Recommendations',
'Terkait Risiko Kesehatan': 'Related Health Risks',
'Lihat detail risiko & faktor kontribusi': 'View risk detail & contributing factors',
```

#### Heart Rate
```js
'Heart Rate': 'Heart Rate',
'PPG · BPM real-time': 'PPG · BPM real-time',
'Bradycardia · Rendah': 'Bradycardia · Low',
'Normal · Aman': 'Normal · Safe',
'Elevated · aktivitas': 'Elevated · activity',
'Sangat tinggi · awas': 'Very high · caution',
'Resting HR Anda': 'Your Resting HR',
'Baseline ~75 bpm — turun dari 78 bpm bulan lalu, indikasi recovery membaik': 'Baseline ~75 bpm — down from 78 bpm last month, indicating improving recovery',
'HRV terkait': 'Related HRV',
'HR variabilitas adalah indikator stres autonomic — cek RMSSD di Recovery': 'HR variability is an autonomic stress indicator — check RMSSD in Recovery',
'HR sangat tinggi': 'HR very high',
'Pertimbangkan istirahat. Jika tidak sedang aktivitas, periksa aritmia': 'Consider resting. If not exercising, check for arrhythmia',
```

#### SpO₂
```js
'Oksigen Darah (SpO₂)': 'Blood Oxygen (SpO₂)',
'Pulse oximetry': 'Pulse oximetry',
'Normal · sehat': 'Normal · healthy',
'Borderline · pantau': 'Borderline · monitor',
'Hipoksia · konsultasi medis': 'Hypoxia · seek medical advice',
'SpO₂ normal 95-100%': 'Normal SpO₂ is 95–100%',
'Penurunan persisten di bawah 92% saat istirahat = tanda hipoksia': 'Persistent drop below 92% at rest = sign of hypoxia',
'Faktor altitude': 'Altitude factor',
'Di dataran tinggi normal turun 1-2%. AERVINEX kompensasi otomatis': 'At high altitudes it normally drops 1–2%. AERVINEX compensates automatically',
```

#### Respiratory Rate
```js
'Laju napas': 'Breathing rate',
'Rendah · cek': 'Low · check',
'Normal · istirahat': 'Normal · at rest',
'Tinggi · aktivitas': 'High · activity',
'Normal istirahat 12-20 brpm': 'Normal resting is 12–20 brpm',
'Naik saat aktivitas/stres, turun saat tidur dalam': 'Rises with activity/stress, falls in deep sleep',
'Tachypnea': 'Tachypnea',
'RR >24 brpm saat istirahat = warning sign respiratory distress': 'RR >24 brpm at rest = warning sign of respiratory distress',
```

#### Hidrasi
```js
'Index hidrasi tubuh': 'Body hydration index',
'Hidrasi cukup': 'Hydration sufficient',
'Mulai turun · minum': 'Starting to drop · drink',
'Dehidrasi ringan': 'Mild dehydration',
'Dehidrasi sedang · segera minum': 'Moderate dehydration · drink now',
'Target harian 2-3 L': 'Daily target 2–3 L',
'Pada cuaca panas tropis bisa naik ke 3.5 L. AERVINEX kalkulasi otomatis': 'In tropical heat this can rise to 3.5 L. AERVINEX calculates automatically',
'Minum 250-500ml dalam 30 menit. Tingkatkan elektrolit jika berkeringat banyak': 'Drink 250–500 ml within 30 minutes. Add electrolytes if sweating heavily',
```

#### UV
```js
'Rendah · aman': 'Low · safe',
'Sedang · SPF 30+': 'Moderate · SPF 30+',
'Tinggi · SPF 50': 'High · SPF 50',
'Sangat tinggi · hindari': 'Very high · avoid',
'Ekstrem · indoor': 'Extreme · stay indoors',
'Time-to-burn': 'Time-to-burn',
'< 15 menit untuk skin tipe sedang': '<15 minutes for medium skin types',
'~30-45 menit': '~30–45 minutes',
'> 1 jam': '>1 hour',
'Sunscreen': 'Sunscreen',
'Re-apply tiap 2 jam saat outdoor. Gunakan SPF 30+ minimum': 'Reapply every 2 hours outdoors. Use SPF 30+ minimum',
```

#### PM2.5
```js
'Partikel halus udara': 'Fine airborne particles',
'Baik · sehat': 'Good · healthy',
'Sedang · sensitif waspada': 'Moderate · sensitive groups cautious',
'Tidak sehat · masker': 'Unhealthy · wear mask',
'Sangat tidak sehat · indoor': 'Very unhealthy · stay indoors',
'Berbahaya · darurat': 'Hazardous · emergency',
'Standar WHO': 'WHO standard',
'Annual mean 5 μg/m³. Indonesia (ISPU) batas sedang 50 μg/m³': 'Annual mean 5 μg/m³. Indonesia ISPU moderate threshold 50 μg/m³',
'PM2.5 tinggi': 'PM2.5 high',
'Pakai masker N95. Hindari outdoor cardio. Cek air purifier indoor': 'Wear an N95 mask. Avoid outdoor cardio. Check indoor air purifier',
```

#### Heat Index
```js
'Suhu apparent': 'Apparent temperature',
'Nyaman': 'Comfortable',
'Hati-hati': 'Caution',
'Sangat panas · cramps': 'Very hot · cramps risk',
'Bahaya · heatstroke': 'Danger · heatstroke',
'Ekstrem': 'Extreme',
'Heat Index = suhu + RH': 'Heat Index = temperature + RH',
'Tropical Asia Tenggara sering >35°C feels-like saat siang': 'Tropical Southeast Asia frequently exceeds 35°C feels-like at midday',
'Kurangi intensitas': 'Reduce intensity',
'Pindah indoor jika memungkinkan. Hidrasi + elektrolit setiap 15 menit': 'Move indoors if possible. Hydrate + electrolytes every 15 minutes',
```

#### Resting HR
```js
'Resting HR': 'Resting HR',
'Denyut istirahat': 'Resting heart rate',
'Atletik (excellent)': 'Athletic (excellent)',
'Sangat baik': 'Excellent',
'Normal': 'Normal',
'Tinggi · cek stres/tidur': 'High · check stress/sleep',
'Resting HR atletik 40-50 bpm': 'Athletic resting HR 40–50 bpm',
'Indikator cardio fitness yang kuat': 'A strong cardio fitness indicator',
'Trend penting': 'Trend matters',
'Kenaikan persisten 5+ bpm = warning overtraining/penyakit': 'A persistent rise of 5+ bpm = warning of overtraining/illness',
```

#### RMSSD / SDNN / LF-HF
```js
'RMSSD (HRV)': 'RMSSD (HRV)',
'Variabilitas parasimpatik': 'Parasympathetic variability',
'Rendah · stres tinggi': 'Low · high stress',
'Sedang': 'Moderate',
'Baik': 'Good',
'Sangat baik · recovery prima': 'Excellent · prime recovery',
'RMSSD = vagal tone': 'RMSSD = vagal tone',
'Tinggi = sistem saraf parasimpatik dominan = recovery baik': 'High = parasympathetic dominance = good recovery',
'Bandingkan vs personal baseline': 'Compare to your personal baseline',
'Bukan absolute number — turun 20% dari baseline = stres/overtraining': 'Not an absolute number — a 20% drop from baseline = stress/overtraining',
'SDNN (HRV)': 'SDNN (HRV)',
'Variabilitas 5 menit': '5-minute variability',
'Rendah': 'Low',
'SDNN = global ANS': 'SDNN = global ANS',
'Mencerminkan keseluruhan otonom (simpatik + parasimpatik)': 'Reflects total autonomic activity (sympathetic + parasympathetic)',
'LF/HF Ratio': 'LF/HF Ratio',
'Stres autonomic': 'Autonomic stress',
'Parasimpatik dominan · rest': 'Parasympathetic dominance · rest',
'Seimbang · normal': 'Balanced · normal',
'Simpatik dominan · stres': 'Sympathetic dominance · stress',
'Stres tinggi': 'High stress',
'LF/HF = simpatik/parasimpatik': 'LF/HF = sympathetic/parasympathetic ratio',
'Tinggi = stres, rendah = recovery. Sweet spot 1.5-2.0': 'High = stress, low = recovery. Sweet spot 1.5–2.0',
```

#### Related risk names map
```js
'Asma / ISPA': 'Asthma / ARI',
'Aritmia / AFib': 'Arrhythmia / AFib',
'Sunburn': 'Sunburn',
```

---

### From: public/assessment.html (40+ strings)

```js
'Assessment — AERVINEX': 'Assessment — AERVINEX',
'Assessment': 'Assessment',
'⚠️ Self-assessment ini bukan diagnosis medis. Hasil untuk skrining + tracking longitudinal.': '⚠️ This self-assessment is not a medical diagnosis. Results are for screening and longitudinal tracking only.',
'Mulai Assessment': 'Start Assessment',
'dari': 'of',
'Lanjut': 'Next',
'Selesai': 'Finish',
'Back': 'Back',
'Pilih semua yang relevan': 'Select all that apply',
'Range': 'Range',
'Pertanyaan': 'Question',
'Tidak pernah': 'Never',
'Sangat sering': 'Very often',
'✓ Ya': '✓ Yes',
'✗ Tidak': '✗ No',
'Self-Assessment': 'Self-Assessment',
'pertanyaan': 'questions',
'Assessment untuk kondisi ini belum tersedia.': 'Assessment for this condition is not yet available.',
'Kembali ke daftar →': 'Back to list →',
'Mohon jawab dulu pertanyaan ini': 'Please answer this question first',
'Hasil Self-Assessment': 'Self-Assessment Result',
'Your Self-Score': 'Your Self-Score',
'ML Sensor Score': 'ML Sensor Score',
'RENDAH': 'LOW',
'Risiko ringan. Lanjutkan gaya hidup sehat & monitoring rutin.': 'Low risk. Continue your healthy lifestyle and regular monitoring.',
'Risiko moderat. Pertimbangkan modifikasi gaya hidup + konsultasi preventif.': 'Moderate risk. Consider lifestyle modification + preventive consultation.',
'Risiko cukup tinggi. Sangat disarankan konsultasi medis untuk evaluasi.': 'Fairly high risk. Medical consultation strongly recommended for evaluation.',
'Risiko sangat tinggi. Konsultasi medis sesegera mungkin.': 'Very high risk. Seek medical consultation as soon as possible.',
'Konsultasi dokter': 'Consult a doctor',
'Validasi screening dengan pemeriksaan klinis': 'Validate screening with a clinical examination',
'Lihat ML Detail': 'View ML Detail',
'Bandingkan dengan sensor reading + faktor kontribusi': 'Compare with sensor readings + contributing factors',
'Re-take 30 hari': 'Retake in 30 days',
'Tracking perubahan longitudinal': 'Track longitudinal change',
'Assessment tersimpan · skor': 'Assessment saved · score',
'Retake': 'Retake',
'ML Detail': 'ML Detail',
'Risks': 'Risks',
```

---

### From: public/assessment-history.html (12 strings)

```js
'Assessment History — AERVINEX': 'Assessment History — AERVINEX',
'Assessment History': 'Assessment History',
'Loading...': 'Loading...',
'Trend Visit': 'Visit Trend',
'Bandingkan skor lintas waktu untuk kondisi yang sama. Berguna untuk track perubahan setelah modifikasi gaya hidup.': 'Compare scores over time for the same condition. Useful for tracking changes after lifestyle modifications.',
'Semua Riwayat': 'All History',
'assessment tersimpan': 'assessments saved',
'Belum ada assessment': 'No assessments yet',
'Mulai dari Risk List untuk mengisi assessment pertama Anda.': 'Start from Risk List to complete your first assessment.',
'Trend akan muncul setelah Anda ada 2+ assessment per kondisi.': 'Trends appear once you have 2+ assessments per condition.',
'Lakukan 2+ assessment kondisi yang sama untuk lihat trend.': 'Take 2+ assessments of the same condition to see a trend.',
'skor user:': 'user score:',
'Gagal load history': 'Failed to load history',
```

---

### From: public/encyclopedia.html (12 strings)

```js
'Encyclopedia — AERVINEX': 'Encyclopedia — AERVINEX',
'Encyclopedia': 'Encyclopedia',
'Library 35 kondisi · referensi medis': '35-condition library · medical reference',
'Cari penyakit, gejala, atau topik...': 'Search diseases, symptoms, or topics...',
'Kategori Pelajari': 'Browse by Category',
'Library berdasarkan SLR 87 paper + clinical guidelines (GINA, WHO, ATS, AHA, ACSM, ESC, NICE).': 'Library based on an SLR of 87 papers + clinical guidelines (GINA, WHO, ATS, AHA, ACSM, ESC, NICE).',
'Semua Artikel': 'All Articles',
'Lihat Sumber Riset Lengkap (SLR + Datasets)': 'View Full Research Sources (SLR + Datasets)',
'Tidak ada hasil': 'No results',
'Coba kata kunci lain': 'Try a different keyword',
```

---

### From: public/alerts.html (25 strings)

```js
'Notifikasi — AERVINEX': 'Notifications — AERVINEX',
'Notifikasi': 'Notifications',
'belum dibaca': 'unread',
'Kritis': 'Critical',
'Level 2': 'Level 2',
'Level 1': 'Level 1',
'Info': 'Info',
'Tandai semua dibaca': 'Mark all as read',
'PM2.5 SPIKE — 168 μg/m³': 'PM2.5 SPIKE — 168 μg/m³',
'Kualitas udara berbahaya · pindah ke indoor segera': 'Hazardous air quality · move indoors immediately',
'menit lalu': 'minutes ago',
'Heat Index 36°C': 'Heat Index 36°C',
'Risiko heatstroke meningkat · kurangi intensitas': 'Heatstroke risk rising · reduce intensity',
'Hidrasi turun ke 58%': 'Hydration dropped to 58%',
'Minum air 250-500ml dalam 30 menit': 'Drink 250–500 ml of water within 30 minutes',
'Sinkronisasi data harian selesai': 'Daily data sync complete',
'Semua sensor reading tersinkronisasi ke cloud': 'All sensor readings synced to cloud',
'jam lalu': 'hours ago',
'UV Index 8 — Sangat Tinggi': 'UV Index 8 — Very High',
'Pakai SPF 50+ atau cari teduh': 'Use SPF 50+ or seek shade',
'Resting HR naik 6 bpm dari baseline': 'Resting HR up 6 bpm from baseline',
'Pertimbangkan istirahat ekstra malam ini': 'Consider extra rest tonight',
'Energy harvest mencatat +12% hari ini': 'Energy harvest recorded +12% today',
'Thermoelectric + biofuel cell sumbangkan 0.18 Wh': 'Thermoelectric + biofuel cell contributed 0.18 Wh',
'Aritmia terdeteksi (singkat, 12 detik)': 'Arrhythmia detected (brief, 12 seconds)',
'HR irregular · skrining, bukan diagnosis medis': 'HR irregular · screening, not medical diagnosis',
'Kemarin': 'Yesterday',
'PM2.5 di rute commute pagi tinggi': 'PM2.5 high on your morning commute route',
'Pertimbangkan masker N95 untuk besok': 'Consider an N95 mask tomorrow',
'Streak 5 hari aktivitas tercapai!': '5-day activity streak achieved!',
'Pertahankan momentum recovery yang baik': 'Maintain your strong recovery momentum',
'hari lalu': 'days ago',
'Tidak ada notifikasi pada filter ini': 'No notifications match this filter',
'Semua notifikasi ditandai dibaca': 'All notifications marked as read',
```

---

### From: public/js/disease-list.js (60+ strings — 35 disease metadata)

#### Categories
```js
'Composite': 'Composite',
'Pernapasan': 'Respiratory',
'Kardiovaskular': 'Cardiovascular',
'Heat': 'Heat',
'Kulit & UV': 'Skin & UV',
'Suhu Tubuh': 'Body Temperature',
'Stress & Mental': 'Stress & Mental',
'Aktivitas': 'Activity',
'Triggers': 'Triggers',
```

#### Disease names + taglines
```js
'Environment Health Risk (TEPRS)': 'Environment Health Risk (TEPRS)',
'Skor risiko lingkungan komposit (PM, UV, heat, fisiologi)': 'Composite environmental risk score (PM, UV, heat, physiology)',
'Asma': 'Asthma',
'Penyempitan saluran napas reversibel · dipicu polusi/alergen': 'Reversible airway narrowing · triggered by pollution/allergens',
'ISPA': 'ARI',
'Infeksi Saluran Pernapasan Akut · dipicu PM2.5+droplet': 'Acute Respiratory Infection · triggered by PM2.5 + droplets',
'COPD': 'COPD',
'Obstruksi kronik · paparan polusi/asap jangka panjang': 'Chronic obstruction · long-term pollution/smoke exposure',
'Hipoksia Ringan': 'Mild Hypoxia',
'Penurunan oksigenasi jaringan': 'Reduced tissue oxygenation',
'Pneumonia': 'Pneumonia',
'Infeksi paru · SpO₂ deficit + demam + RR naik': 'Lung infection · SpO₂ deficit + fever + RR elevated',
'Bronchitis Akut': 'Acute Bronchitis',
'Inflamasi bronkus · 90% viral · self-limiting 1-3 minggu': 'Bronchial inflammation · 90% viral · self-limiting in 1–3 weeks',
'Prediksi Asma Eksaserbasi': 'Asthma Exacerbation Prediction',
'Forecast 6-24 jam · LSTM model': 'Forecast 6–24 hours · LSTM model',
'Prediksi COPD Eksaserbasi': 'COPD Exacerbation Prediction',
'Forecast 24-48 jam · trend RR + SpO₂': 'Forecast 24–48 hours · RR + SpO₂ trend',
'Sleep Apnea Screening': 'Sleep Apnea Screening',
'OSA · ODI screening saat tidur (PPG)': 'OSA · ODI screening during sleep (PPG)',
'Aritmia / AFib': 'Arrhythmia / AFib',
'Atrial fibrillation · skrining via HRV CNN': 'Atrial fibrillation · HRV CNN screening',
'Bradikardia': 'Bradycardia',
'HR < 60 bpm istirahat (athletic vs pathologic)': 'HR <60 bpm at rest (athletic vs pathologic)',
'Takikardia Istirahat': 'Resting Tachycardia',
'RHR > 100 bpm · indikasi kompensasi/patologi': 'RHR >100 bpm · compensatory/pathologic indicator',
'PVC / PAC (Ektopik Beat)': 'PVC / PAC (Ectopic Beat)',
'Premature contraction · trigger caffeine/stres': 'Premature contraction · caffeine/stress triggers',
'Hipertensi (Estimasi PWV/PTT)': 'Hypertension (PWV/PTT Estimate)',
'PPG-based BP screening · butuh konfirmasi cuff': 'PPG-based BP screening · cuff confirmation required',
'Vasovagal Syncope Risk': 'Vasovagal Syncope Risk',
'Reflex pingsan · HR drop + SpO₂ dip pattern': 'Reflex fainting · HR drop + SpO₂ dip pattern',
'CV Fitness Decline': 'Cardiovascular Fitness Decline',
'VO₂max + HR recovery rate · predictor mortality': 'VO₂max + HR recovery rate · mortality predictor',
'Cardiac Event Risk': 'Cardiac Event Risk',
'Composite acute cardiac event indicator': 'Composite acute cardiac event indicator',
'Heatstroke': 'Heatstroke',
'Suhu inti >40°C · failure thermoregulation': 'Core temp >40°C · thermoregulation failure',
'Kelelahan Panas': 'Heat Exhaustion',
'Heat exhaustion · stage sebelum heatstroke': 'Heat exhaustion · pre-heatstroke stage',
'Dehidrasi': 'Dehydration',
'Kehilangan cairan tubuh · turunkan performa fisik': 'Loss of body fluids · lowers physical performance',
'Heat Cramps': 'Heat Cramps',
'Kram otot saat panas · sodium depletion': 'Muscle cramps in heat · sodium depletion',
'Hyponatremia (EAH)': 'Hyponatremia (EAH)',
'Overhydration sodium drop · marathon risk': 'Overhydration sodium drop · marathon risk',
'Sunburn / Kerusakan Kulit': 'Sunburn / Skin Damage',
'Paparan UV berlebih · sunburn + photoaging': 'Excess UV exposure · sunburn + photoaging',
'Photokeratitis': 'Photokeratitis',
'UV burn pada mata · onset 4-12 jam': 'UV burn on eyes · 4–12 hour onset',
'Vitamin D Status': 'Vitamin D Status',
'Tracking sintesis dari paparan UV-B kulit': 'Tracking synthesis from skin UV-B exposure',
'Skin Cancer Risk': 'Skin Cancer Risk',
'UV cumulative lifetime · long-term risk': 'Lifetime cumulative UV · long-term risk',
'Demam (Fever)': 'Fever',
'Suhu tubuh > 37.5°C · mekanisme imun': 'Body temp >37.5°C · immune mechanism',
'Hipotermia': 'Hypothermia',
'Body core < 35°C · jarang di tropis': 'Core <35°C · rare in the tropics',
'Stres Kronik': 'Chronic Stress',
'HRV persistent decline + LF/HF imbalance': 'HRV persistent decline + LF/HF imbalance',
'Burnout Risk': 'Burnout Risk',
'Emotional + physical exhaustion · Maslach MBI': 'Emotional + physical exhaustion · Maslach MBI',
'Panic Attack': 'Panic Attack',
'Acute sympathetic surge · self-limiting 10-30 mnt': 'Acute sympathetic surge · self-limiting 10–30 min',
'Sleep Deprivation': 'Sleep Deprivation',
'Cumulative sleep debt · <7h/malam': 'Cumulative sleep debt · <7h/night',
'Overtraining Syndrome': 'Overtraining Syndrome',
'NFOR/OTS · HRV decline + performance drop': 'NFOR/OTS · HRV decline + performance drop',
'Sedentary Lifestyle Risk': 'Sedentary Lifestyle Risk',
'Inactivity-related · 4th leading cause mortality': 'Inactivity-related · 4th leading cause of mortality',
'Migraine Trigger': 'Migraine Trigger',
'Multi-modal: heat, UV, dehydration, sleep, stress': 'Multi-modal: heat, UV, dehydration, sleep, stress',
```

---

### From: public/js/assessments.js (350+ strings — 35 questionnaires)

#### Common scaffolding
```js
'Self-Check': 'Self-Check',
'Self-Assessment': 'Self-Assessment',
```

#### TEPRS
```js
'Environment Health Risk · Self-Check': 'Environment Health Risk · Self-Check',
'Self-assessment paparan lingkungan + respon tubuh Anda. Combine dengan reading sensor untuk full TEPRS.': 'Self-assessment of your environmental exposure + body response. Combine with sensor readings for the full TEPRS.',
'Berapa jam/hari Anda outdoor area perkotaan?': 'How many hours per day do you spend outdoors in urban areas?',
'<1 jam': '<1 hour',
'1-2 jam': '1–2 hours',
'3-5 jam': '3–5 hours',
'>5 jam': '>5 hours',
'Rute commute utama:': 'Primary commute route:',
'Mobil/kantor AC': 'Car / AC office',
'Transportasi umum': 'Public transport',
'Motor/sepeda': 'Motorbike / bicycle',
'Jalan kaki': 'Walking',
'Gejala yang dialami minggu ini:': 'Symptoms experienced this week:',
'Pusing': 'Dizziness',
'Sesak napas': 'Shortness of breath',
'Iritasi mata': 'Eye irritation',
'Sakit tenggorokan': 'Sore throat',
'Batuk': 'Cough',
'Kulit terbakar matahari': 'Sunburned skin',
'Cepat lelah': 'Fatigues easily',
'Kualitas tidur seminggu ini (0=buruk, 5=excellent):': 'Sleep quality this past week (0=poor, 5=excellent):',
'Pernah pakai masker outdoor minggu ini?': 'Worn a mask outdoors this week?',
'Aktivitas fisik (menit/minggu):': 'Physical activity (minutes/week):',
```

#### Asma (Asthma)
```js
'Asma · Self-Assessment': 'Asthma · Self-Assessment',
'Berbasis GINA Asthma Control Test (ACT) yang dimodifikasi.': 'Based on a modified GINA Asthma Control Test (ACT).',
'Frekuensi sesak, wheezing, batuk malam minggu ini (0=tidak ada, 5=setiap hari):': 'Frequency of shortness of breath, wheezing, or nighttime cough this week (0=none, 5=daily):',
'Apakah Anda terdiagnosis asma oleh dokter?': 'Have you been diagnosed with asthma by a doctor?',
'Penggunaan inhaler reliever (Ventolin/Salbutamol):': 'Reliever inhaler use (Ventolin/Salbutamol):',
'Tidak pakai': 'Not used',
'<2x/minggu': '<2x/week',
'2-3x/minggu': '2–3x/week',
'Setiap hari': 'Daily',
'Pemicu yang Anda alami:': 'Triggers you experience:',
'Polusi udara': 'Air pollution',
'Asap rokok': 'Cigarette smoke',
'Debu rumah': 'House dust',
'Bulu hewan': 'Pet dander',
'Cuaca dingin': 'Cold weather',
'Aktivitas fisik': 'Physical activity',
'Stres': 'Stress',
'Infeksi virus': 'Viral infection',
'Frekuensi terbangun malam karena sesak:': 'Frequency of waking at night due to breathlessness:',
'Pernah PEF/spirometry abnormal?': 'Ever had abnormal PEF/spirometry results?',
```

#### ISPA
```js
'ISPA · Self-Assessment': 'ARI · Self-Assessment',
'Skrining infeksi saluran napas akut akibat polusi+infeksi.': 'Screening for acute respiratory infection from pollution + infection.',
'Severity batuk minggu ini:': 'Cough severity this week:',
'Demam > 37.5°C dalam 7 hari terakhir?': 'Fever >37.5°C in the past 7 days?',
'Gejala yang dialami:': 'Symptoms experienced:',
'Pilek': 'Runny nose',
'Nyeri tenggorokan': 'Throat pain',
'Sakit kepala': 'Headache',
'Lelah': 'Fatigue',
'Hidung tersumbat': 'Nasal congestion',
'Suara serak': 'Hoarse voice',
'Paparan PM2.5 area Anda (hari ini):': 'PM2.5 exposure in your area today:',
'Tidak tahu': 'Unknown',
'Baik <35': 'Good <35',
'Sedang 35-55': 'Moderate 35–55',
'Tidak Sehat >55': 'Unhealthy >55',
'Kontak dengan penderita ISPA dalam 7 hari?': 'Contact with someone with ARI in the past 7 days?',
```

#### COPD
```js
'COPD · Self-Assessment': 'COPD · Self-Assessment',
'Modified CAT (COPD Assessment Test) — bukan diagnostik.': 'Modified CAT (COPD Assessment Test) — not diagnostic.',
'Sesak napas saat aktivitas (jalan cepat/naik tangga):': 'Shortness of breath during activity (brisk walking / climbing stairs):',
'Riwayat merokok:': 'Smoking history:',
'Tidak pernah': 'Never',
'Berhenti >10 thn': 'Quit >10 years ago',
'Berhenti <10 thn': 'Quit <10 years ago',
'Masih merokok': 'Still smoking',
'Batuk produktif (dahak) di pagi hari:': 'Productive cough (with phlegm) in the morning:',
'Pernah terdiagnosis COPD/emfisema?': 'Ever diagnosed with COPD/emphysema?',
'Usia Anda:': 'Your age:',
```

#### Hipoksia
```js
'Hipoksia Ringan · Self-Assessment': 'Mild Hypoxia · Self-Assessment',
'Skrining oksigenasi tidak optimal.': 'Screening for suboptimal oxygenation.',
'Frekuensi pusing/sakit kepala ringan:': 'Frequency of dizziness/mild headache:',
'Cepat lelah saat aktivitas ringan:': 'Fatigues easily during light activity:',
'SpO₂ pernah <95% saat istirahat?': 'SpO₂ ever <95% at rest?',
'Pernah pingsan/hampir pingsan?': 'Ever fainted or nearly fainted?',
'Faktor risiko:': 'Risk factors:',
'Altitude >1500m': 'Altitude >1,500 m',
'Sleep apnea': 'Sleep apnea',
'Anemia diketahui': 'Known anemia',
'PPOK/COPD': 'COPD',
'Asthma': 'Asthma',
```

#### Pneumonia
```js
'Pneumonia · Self-Assessment': 'Pneumonia · Self-Assessment',
'WARNING: jika positif, konsultasi medis segera. Pneumonia butuh diagnosis radiologi.': 'WARNING: if positive, seek medical consultation immediately. Pneumonia requires radiological diagnosis.',
'Demam > 38°C >2 hari?': 'Fever >38°C for >2 days?',
'Severity sesak napas:': 'Shortness of breath severity:',
'Batuk dengan dahak hijau/kuning/berdarah?': 'Cough with green/yellow/bloody phlegm?',
'Nyeri dada saat napas dalam?': 'Chest pain on deep breathing?',
'Usia >65': 'Age >65',
'Diabetes': 'Diabetes',
'Kanker aktif': 'Active cancer',
'Steroid kronik': 'Chronic steroid use',
'Imunokompromis': 'Immunocompromised',
```

#### Bronchitis
```js
'Bronchitis Akut · Self-Assessment': 'Acute Bronchitis · Self-Assessment',
'90% kasus viral · self-limiting 1-3 minggu.': '90% of cases are viral · self-limiting in 1–3 weeks.',
'Durasi batuk:': 'Cough duration:',
'<7 hari': '<7 days',
'1-2 minggu': '1–2 weeks',
'2-3 minggu': '2–3 weeks',
'>3 minggu': '>3 weeks',
'Demam ringan dalam onset?': 'Mild fever at onset?',
'Gejala penyerta:': 'Associated symptoms:',
'Nyeri dada saat batuk': 'Chest pain when coughing',
'Wheezing': 'Wheezing',
'Riwayat asma/atopi?': 'History of asthma/atopy?',
'Paparan asap/polusi tinggi minggu ini?': 'High smoke/pollution exposure this week?',
```

#### Asma Exacerbation Self-Check
```js
'Prediksi Asma Eksaserbasi · Self-Check': 'Asthma Exacerbation Prediction · Self-Check',
'Forecast 6-24 jam ahead.': '6–24 hour ahead forecast.',
'Apakah Anda diagnosis asma aktif?': 'Do you have an active asthma diagnosis?',
'Penggunaan reliever 24 jam terakhir:': 'Reliever use in the past 24 hours:',
'Sesak napas saat ini:': 'Current shortness of breath:',
'PM2.5 area prediksi memburuk?': 'Local PM2.5 forecast worsening?',
'Pernah eksaserbasi butuh ER 12 bulan terakhir?': 'Any ER-requiring exacerbation in the past 12 months?',
```

#### COPD Exacerbation Self-Check
```js
'Prediksi COPD Eksaserbasi · Self-Check': 'COPD Exacerbation Prediction · Self-Check',
'Forecast 24-48 jam.': '24–48 hour forecast.',
'Apakah Anda diagnosis COPD?': 'Do you have a COPD diagnosis?',
'Sesak napas memburuk dibanding baseline:': 'Shortness of breath worse than baseline:',
'Dahak berubah warna/volume meningkat?': 'Sputum changed color or increased in volume?',
'ISPA dalam 14 hari terakhir?': 'ARI in the past 14 days?',
'Riwayat eksaserbasi 12 bulan?': 'Exacerbation history in past 12 months?',
```

#### Sleep Apnea (STOP-BANG)
```js
'Sleep Apnea Screening (STOP-BANG)': 'Sleep Apnea Screening (STOP-BANG)',
'STOP-BANG questionnaire adapted.': 'Adapted STOP-BANG questionnaire.',
'Anda mendengkur keras (loud snoring)?': 'Do you snore loudly?',
'Sering merasa lelah/mengantuk siang hari?': 'Often feel tired or drowsy during the day?',
'Pernah diobservasi berhenti napas saat tidur?': 'Ever observed to stop breathing during sleep?',
'Tekanan darah tinggi/terdiagnosis hipertensi?': 'High blood pressure / diagnosed hypertension?',
'BMI > 35?': 'BMI >35?',
'Usia > 50 tahun?': 'Age >50?',
'Lingkar leher > 40 cm?': 'Neck circumference >40 cm?',
'Jenis kelamin pria?': 'Male sex?',
```

#### AFib
```js
'AFib · Self-Assessment': 'AFib · Self-Assessment',
'Skrining gejala atrial fibrillation.': 'Screening for atrial fibrillation symptoms.',
'Frekuensi palpitasi (jantung berdebar tidak teratur):': 'Frequency of palpitations (irregular pounding heartbeat):',
'Pernah terdiagnosis AFib/aritmia?': 'Ever diagnosed with AFib/arrhythmia?',
'Kelelahan': 'Fatigue',
'Pingsan': 'Fainting',
'Nyeri dada': 'Chest pain',
'Usia:': 'Age:',
'Risk factor:': 'Risk factors:',
'Hipertensi': 'Hypertension',
'Penyakit jantung': 'Heart disease',
'Hipertiroid': 'Hyperthyroidism',
'Konsumsi alkohol harian': 'Daily alcohol consumption',
```

#### Bradikardia
```js
'Bradikardia · Self-Assessment': 'Bradycardia · Self-Assessment',
'HR < 60 bpm istirahat.': 'HR <60 bpm at rest.',
'Resting HR rata-rata (bpm):': 'Average resting HR (bpm):',
'Gejala bradikardia:': 'Bradycardia symptoms:',
'Sesak saat aktivitas': 'Breathless on exertion',
'Konfusi': 'Confusion',
'Anda atlet trained (latihan endurance)?': 'Are you a trained endurance athlete?',
'Konsumsi beta-blocker/calcium channel blocker?': 'Taking beta-blockers / calcium channel blockers?',
'Riwayat pacemaker/heart block?': 'History of pacemaker / heart block?',
```

#### Takikardia
```js
'Takikardia Istirahat · Self-Assessment': 'Resting Tachycardia · Self-Assessment',
'RHR > 100 bpm.': 'RHR >100 bpm.',
'Faktor pemicu:': 'Triggers:',
'Stres tinggi': 'High stress',
'Anemia': 'Anemia',
'Kehamilan': 'Pregnancy',
'Konsumsi caffeine/energy drink:': 'Caffeine / energy drink intake:',
'Palpitasi': 'Palpitations',
'Sesak': 'Breathlessness',
'Berkeringat': 'Sweating',
```

#### Ektopik Beat
```js
'PVC / PAC · Self-Assessment': 'PVC / PAC · Self-Assessment',
'Premature contraction screening.': 'Premature contraction screening.',
'Frekuensi sensasi "skipped beat":': 'Frequency of "skipped beat" sensations:',
'Konsumsi caffeine harian (cup):': 'Daily caffeine intake (cups):',
'Konsumsi alkohol/minggu:': 'Alcohol intake per week:',
'Riwayat penyakit jantung struktural?': 'History of structural heart disease?',
'Tingkat stres saat ini:': 'Current stress level:',
```

#### Hipertensi
```js
'Hipertensi · Self-Assessment': 'Hypertension · Self-Assessment',
'Skrining risiko hipertensi · konfirmasi cuff BP wajib.': 'Hypertension risk screening · cuff BP confirmation required.',
'Sistolik terakhir (mmHg):': 'Last systolic (mmHg):',
'Diastolik terakhir (mmHg):': 'Last diastolic (mmHg):',
'Riwayat keluarga': 'Family history',
'Obesitas': 'Obesity',
'Konsumsi garam tinggi': 'High salt intake',
'Sedentary': 'Sedentary',
'Stres kronik': 'Chronic stress',
'Alkohol harian': 'Daily alcohol',
'Merokok': 'Smoking',
'Sedang konsumsi obat antihipertensi?': 'Currently taking antihypertensive medication?',
```

#### Vasovagal
```js
'Vasovagal Syncope · Self-Assessment': 'Vasovagal Syncope · Self-Assessment',
'Pingsan reflex screening.': 'Reflex fainting screening.',
'Frekuensi pingsan/hampir pingsan 12 bulan:': 'Frequency of fainting / near-fainting in past 12 months:',
'Trigger Anda:': 'Your triggers:',
'Berdiri lama': 'Prolonged standing',
'Panas': 'Heat',
'Lapar': 'Hunger',
'Pemandangan darah': 'Sight of blood',
'Stres emosional': 'Emotional stress',
'Buang air': 'Defecation/urination',
'Gejala pre-syncope (pusing, berkeringat, mual)?': 'Pre-syncope symptoms (dizziness, sweating, nausea)?',
'Riwayat keluarga vasovagal?': 'Family history of vasovagal?',
'Pernah konfirmasi tilt-table test?': 'Ever confirmed by tilt-table test?',
```

#### CV Fitness
```js
'CV Fitness · Self-Assessment': 'Cardiovascular Fitness · Self-Assessment',
'VO₂max + HR recovery estimation.': 'VO₂max + HR recovery estimation.',
'Frekuensi exercise aerobik:': 'Frequency of aerobic exercise:',
'1-2x/minggu': '1–2x/week',
'3-4x/minggu': '3–4x/week',
'5+x/minggu': '5+x/week',
'Kemudahan naik 2 lantai (0=mudah, 5=tidak bisa):': 'Ease of climbing 2 flights of stairs (0=easy, 5=unable):',
'Resting HR (bpm):': 'Resting HR (bpm):',
'HR recovery 1 menit pasca latihan (bpm drop):': 'HR recovery 1 minute post-exercise (bpm drop):',
```

#### Cardiac Event
```js
'Cardiac Event Risk · Self-Assessment': 'Cardiac Event Risk · Self-Assessment',
'Composite indicator · BUKAN untuk gejala akut!': 'Composite indicator · NOT for acute symptoms!',
'Riwayat:': 'Medical history:',
'CAD/Angina': 'CAD / Angina',
'MI sebelumnya': 'Previous MI',
'Stroke': 'Stroke',
'Dislipidemia': 'Dyslipidemia',
'Merokok aktif?': 'Active smoker?',
'Riwayat keluarga MI < 55 tahun?': 'Family history of MI before age 55?',
'Gejala 24 jam terakhir:': 'Symptoms in past 24 hours:',
'Berkeringat dingin': 'Cold sweats',
```

#### Heatstroke
```js
'Heatstroke Risk · Self-Assessment': 'Heatstroke Risk · Self-Assessment',
'WARNING: severe heat illness = emergency.': 'WARNING: severe heat illness = emergency.',
'Heat index saat ini (°C):': 'Current heat index (°C):',
'Durasi outdoor (jam):': 'Outdoor duration (hours):',
'Gejala:': 'Symptoms:',
'Berkeringat berhenti': 'Sweating stopped',
'Confusion': 'Confusion',
'Mual/muntah': 'Nausea / vomiting',
'Sakit kepala parah': 'Severe headache',
'HR sangat cepat': 'Very rapid HR',
'Kulit panas kering': 'Hot dry skin',
'Acclimatized ke cuaca panas?': 'Acclimatized to hot weather?',
'Hidrasi adekuat (>2L hari ini)?': 'Adequate hydration (>2 L today)?',
```

#### Heat Exhaustion
```js
'Heat Exhaustion · Self-Assessment': 'Heat Exhaustion · Self-Assessment',
'Stage sebelum heatstroke.': 'Stage before heatstroke.',
'Severity kelelahan saat ini:': 'Current fatigue severity:',
'Berkeringat berlebih': 'Excessive sweating',
'Kram otot': 'Muscle cramps',
'Mual': 'Nausea',
'Lemas': 'Weakness',
'Headache': 'Headache',
'Heat index (°C):': 'Heat index (°C):',
'Durasi aktivitas outdoor (menit):': 'Outdoor activity duration (minutes):',
'Hidrasi (0=cukup, 5=sangat kurang):': 'Hydration (0=sufficient, 5=very low):',
```

#### Dehidrasi
```js
'Dehidrasi · Self-Assessment': 'Dehydration · Self-Assessment',
'Skrining cepat status hidrasi.': 'Quick hydration status screening.',
'Warna urine:': 'Urine color:',
'Bening': 'Clear',
'Kuning muda': 'Light yellow',
'Kuning gelap': 'Dark yellow',
'Coklat': 'Brown',
'Asupan cairan hari ini (liter):': 'Fluid intake today (liters):',
'Haus': 'Thirst',
'Mulut kering': 'Dry mouth',
'BAK kurang': 'Reduced urination',
'Tingkat aktivitas hari ini (0=istirahat, 5=intens):': 'Today\'s activity level (0=rest, 5=intense):',
'Cuaca panas/lembab?': 'Hot / humid weather?',
```

#### Heat Cramps
```js
'Heat Cramps · Self-Assessment': 'Heat Cramps · Self-Assessment',
'Kram otot saat aktivitas panas.': 'Muscle cramps during heat activity.',
'Sedang/baru saja mengalami kram otot?': 'Currently or recently experienced muscle cramps?',
'Intensitas keringat:': 'Sweat intensity:',
'Durasi aktivitas (jam):': 'Activity duration (hours):',
'Konsumsi sport drink/elektrolit?': 'Consumed sports drinks / electrolytes?',
```

#### Hyponatremia
```js
'Hyponatremia (EAH) · Self-Assessment': 'Hyponatremia (EAH) · Self-Assessment',
'Overhydration during endurance.': 'Overhydration during endurance activity.',
'Asupan air saat aktivitas (L/jam):': 'Water intake during activity (L/hour):',
'Konsumsi sodium/electrolyte selama aktivitas?': 'Consumed sodium / electrolytes during activity?',
'Bingung': 'Confusion',
'Edema (bengkak)': 'Edema (swelling)',
'Lemah': 'Weak',
'Berat badan naik post-exercise?': 'Body weight gained post-exercise?',
```

#### Sunburn
```js
'Sunburn · Self-Assessment': 'Sunburn · Self-Assessment',
'Risiko paparan UV.': 'UV exposure risk.',
'UV index saat ini (0-11+):': 'Current UV index (0–11+):',
'Durasi outdoor unprotected (menit):': 'Outdoor unprotected duration (minutes):',
'Pakai sunscreen SPF 30+?': 'Wearing SPF 30+ sunscreen?',
'Tipe kulit (Fitzpatrick):': 'Skin type (Fitzpatrick):',
'Tipe I (selalu terbakar)': 'Type I (always burns)',
'Tipe II': 'Type II',
'Tipe III': 'Type III',
'Tipe IV (Asia Tenggara)': 'Type IV (Southeast Asian)',
'Tipe V-VI (gelap)': 'Type V–VI (dark)',
'Riwayat sunburn parah <12 bulan?': 'Severe sunburn history in past 12 months?',
```

#### Photokeratitis
```js
'Photokeratitis · Self-Assessment': 'Photokeratitis · Self-Assessment',
'UV burn pada mata.': 'UV burn on the eyes.',
'Gejala mata:': 'Eye symptoms:',
'Nyeri': 'Pain',
'Mata merah': 'Red eyes',
'Photophobia': 'Photophobia',
'Penglihatan kabur': 'Blurred vision',
'Sensasi pasir di mata': 'Sand-like sensation in eye',
'Berair': 'Watery eyes',
'Outdoor tanpa kacamata UV dalam 24 jam?': 'Outdoors without UV glasses in past 24 hours?',
'UV index saat itu:': 'UV index at the time:',
'Area reflektif (salju, air, pasir putih)?': 'Reflective surface (snow, water, white sand)?',
'Pernah welding/UV lamp exposure?': 'Ever exposed to welding or UV lamps?',
```

#### Vitamin D
```js
'Vitamin D Status · Self-Assessment': 'Vitamin D Status · Self-Assessment',
'Tracking sintesis dari paparan UV-B.': 'Tracking synthesis from UV-B exposure.',
'Paparan matahari pagi (10-12 menit):': 'Morning sun exposure (10–12 minutes):',
'3-5x/minggu': '3–5x/week',
'Hampir tidak pernah': 'Almost never',
'Lifestyle:': 'Lifestyle:',
'Outdoor worker': 'Outdoor worker',
'Mixed indoor/outdoor': 'Mixed indoor/outdoor',
'Mostly indoor (kantoran)': 'Mostly indoor (office)',
'Hampir tidak pernah outdoor': 'Almost never outdoors',
'Konsumsi ikan berlemak ≥2x/minggu?': 'Eat fatty fish ≥2x/week?',
'Suplementasi vitamin D?': 'Vitamin D supplementation?',
'Pakai sunscreen daily (full coverage)?': 'Daily full-coverage sunscreen?',
'Skin tone:': 'Skin tone:',
'Sangat terang': 'Very light',
'Gelap': 'Dark',
```

#### Skin Cancer
```js
'Skin Cancer Risk · Self-Assessment': 'Skin Cancer Risk · Self-Assessment',
'Long-term cumulative UV risk.': 'Long-term cumulative UV risk.',
'Jumlah sunburn parah lifetime:': 'Number of severe sunburns in lifetime:',
'Skin type:': 'Skin type:',
'Tipe IV': 'Type IV',
'Tipe V-VI': 'Type V–VI',
'Riwayat keluarga skin cancer?': 'Family history of skin cancer?',
'Mole/nevi banyak (>50)?': 'Many moles / nevi (>50)?',
'Pernah tanning bed?': 'Ever used a tanning bed?',
'ABCDE warning di mole:': 'ABCDE warning signs on a mole:',
'Border irregular': 'Border irregular',
'Color variation': 'Color variation',
'Diameter >6mm': 'Diameter >6 mm',
'Evolving': 'Evolving',
```

#### Demam
```js
'Demam · Self-Assessment': 'Fever · Self-Assessment',
'Suhu tubuh > 37.5°C.': 'Body temperature >37.5°C.',
'Suhu tubuh terakhir (°C):': 'Last body temperature (°C):',
'Menggigil': 'Chills',
'Nyeri otot': 'Muscle aches',
'Durasi demam (hari):': 'Fever duration (days):',
'Sudah konsumsi antipiretik?': 'Already taken an antipyretic?',
'Bisa identifikasi fokus infeksi (tenggorokan, ISK, dll)?': 'Can you identify the infection focus (throat, UTI, etc.)?',
```

#### Hipotermia
```js
'Hipotermia · Self-Assessment': 'Hypothermia · Self-Assessment',
'Body core < 35°C.': 'Core <35°C.',
'Menggigil hebat': 'Severe shivering',
'Kulit pucat/biru': 'Pale / bluish skin',
'Konfusi': 'Confusion',
'Bicara melambat': 'Slowed speech',
'Drowsiness': 'Drowsiness',
'Paparan dingin/basah lama?': 'Prolonged cold/wet exposure?',
'Pakaian basah?': 'Wet clothing?',
```

#### Stres Kronik (PSS-10)
```js
'Stres Kronik · Self-Assessment (PSS-10 adapted)': 'Chronic Stress · Self-Assessment (PSS-10 adapted)',
'Perceived Stress Scale adapted.': 'Adapted Perceived Stress Scale.',
'Frekuensi merasa kewalahan minggu ini:': 'Frequency of feeling overwhelmed this week:',
'Frekuensi gugup/cemas:': 'Frequency of feeling nervous / anxious:',
'Kesulitan tidur akibat pikiran:': 'Difficulty sleeping due to racing thoughts:',
'Iritabilitas/mudah marah:': 'Irritability / quick to anger:',
'Frekuensi feel "in control" (0=tdk pernah, 5=selalu):': 'Frequency of feeling "in control" (0=never, 5=always):',
'Gejala somatik:': 'Somatic symptoms:',
'Ketegangan otot': 'Muscle tension',
'Sakit perut': 'Stomachache',
'Tachycardia': 'Tachycardia',
'Berkeringat berlebihan': 'Excessive sweating',
```

#### Burnout
```js
'Burnout (Maslach MBI) · Self-Assessment': 'Burnout (Maslach MBI) · Self-Assessment',
'Adapted from Maslach Burnout Inventory.': 'Adapted from the Maslach Burnout Inventory.',
'Merasa emotionally drained dari pekerjaan:': 'Feeling emotionally drained from work:',
'Frekuensi cynicism / detachment dari work:': 'Frequency of cynicism / detachment from work:',
'Penurunan sense of accomplishment:': 'Reduced sense of accomplishment:',
'Kelelahan fisik di awal hari kerja:': 'Physical exhaustion at the start of the workday:',
'Penurunan produktivitas:': 'Decline in productivity:',
'Jam kerja/minggu:': 'Work hours per week:',
```

#### Panic Attack
```js
'Panic Attack · Self-Assessment': 'Panic Attack · Self-Assessment',
'Berdasar DSM-5 panic criteria.': 'Based on DSM-5 panic criteria.',
'Frekuensi serangan panik 30 hari:': 'Frequency of panic attacks in past 30 days:',
'Gejala saat serangan:': 'Symptoms during attack:',
'Tremor': 'Tremor',
'Hot flashes': 'Hot flashes',
'Fear of dying': 'Fear of dying',
'Derealization': 'Derealization',
'Numbness': 'Numbness',
'Severity peak attack (0=ringan, 5=incapacitating):': 'Peak attack severity (0=mild, 5=incapacitating):',
'Mengganggu fungsi harian?': 'Disrupts daily functioning?',
'Avoidance behavior (menghindari trigger)?': 'Avoidance behavior (avoiding triggers)?',
```

#### Sleep Deprivation
```js
'Sleep Deprivation · Self-Assessment': 'Sleep Deprivation · Self-Assessment',
'Cumulative sleep debt.': 'Cumulative sleep debt.',
'Rata-rata tidur (jam/malam) minggu ini:': 'Average sleep this week (hours/night):',
'Kualitas tidur:': 'Sleep quality:',
'Daytime sleepiness:': 'Daytime sleepiness:',
'Konsumsi caffeine >2 cup/hari?': 'Caffeine intake >2 cups/day?',
'Screen time >1 jam pre-bed?': 'Screen time >1 hour before bed?',
```

#### Overtraining
```js
'Overtraining Syndrome · Self-Assessment': 'Overtraining Syndrome · Self-Assessment',
'NFOR vs OTS distinction.': 'NFOR vs OTS distinction.',
'Performance plateau/decline despite training:': 'Performance plateau / decline despite training:',
'Persistent fatigue meski rest:': 'Persistent fatigue despite rest:',
'Mood swing': 'Mood swing',
'Sleep disturbance': 'Sleep disturbance',
'Loss appetite': 'Loss of appetite',
'Frequent illness': 'Frequent illness',
'Muscle soreness chronic': 'Chronic muscle soreness',
'Hilang motivasi': 'Loss of motivation',
'Training hours/week:': 'Training hours/week:',
'Recovery days/week:': 'Recovery days/week:',
'RHR rise dari baseline (0=tidak, 5=>10 bpm naik):': 'RHR rise from baseline (0=none, 5=>10 bpm rise):',
```

#### Sedentary
```js
'Sedentary Risk · Self-Assessment': 'Sedentary Risk · Self-Assessment',
'WHO physical activity guidelines.': 'WHO physical activity guidelines.',
'Steps/hari rata-rata:': 'Average steps per day:',
'Jam duduk/hari (kerja+leisure):': 'Sitting hours per day (work + leisure):',
'Exercise terstruktur/minggu (menit):': 'Structured exercise per week (minutes):',
'Break sitting tiap 30 mnt?': 'Break up sitting every 30 minutes?',
'Resistance training 2x/minggu?': 'Resistance training 2x/week?',
```

#### Migraine Trigger
```js
'Migraine Trigger · Self-Assessment': 'Migraine Trigger · Self-Assessment',
'Multi-trigger pattern analysis.': 'Multi-trigger pattern analysis.',
'Frekuensi migrain/bulan:': 'Migraines per month:',
'Heat extrem': 'Extreme heat',
'UV/bright light': 'UV / bright light',
'Sleep disruption': 'Sleep disruption',
'Hormonal': 'Hormonal',
'Caffeine': 'Caffeine',
'Wine/red wine': 'Wine / red wine',
'Cheese aged': 'Aged cheese',
'Skipping meals': 'Skipping meals',
'Cuaca berubah': 'Weather changes',
'Aura sebelum migrain?': 'Aura before migraine?',
'Severity pain saat episode:': 'Pain severity during episode:',
'Konsumsi profilaksis (CGRP, beta-blocker)?': 'Taking prophylaxis (CGRP, beta-blockers)?',
'Riwayat keluarga migrain?': 'Family history of migraine?',
```

---

### From: public/js/encyclopedia.js (30 strings)

```js
'positif': 'positive',
'negatif': 'negative',
'Kuat': 'Strong',
'Sedang': 'Moderate',
'Lemah': 'Weak',
'Tidak signifikan': 'Not significant',
'Baik': 'Good',
'Tidak Sehat': 'Unhealthy',
'Sangat Tidak Sehat': 'Very Unhealthy',
'Berbahaya': 'Hazardous',
'rekaman': 'records',
'PM2.5 rata-rata (μg/m³)': 'Average PM2.5 (μg/m³)',
'AQI rata-rata': 'Average AQI',
'Kasus Pernapasan': 'Respiratory Cases',
'Rawat Inap': 'Hospital Admissions',
'PM2.5 vs Rawat Inap': 'PM2.5 vs Hospital Admissions',
'AQI vs Kasus Pernapasan': 'AQI vs Respiratory Cases',
'Suhu vs Rawat Inap': 'Temperature vs Hospital Admissions',
'NO₂ vs Kasus Kardiovaskular': 'NO₂ vs Cardiovascular Cases',
'Suhu (°C)': 'Temperature (°C)',
'Kelembaban (%)': 'Humidity (%)',
'Kecepatan Angin (km/h)': 'Wind Speed (km/h)',
'Tanpa Stres': 'No Stress',
'Tekanan Waktu': 'Time Pressure',
'Gangguan/Interupsi': 'Interruption / Disruption',
'Lebih tinggi = stres/aktif': 'Higher = stressed / active',
'Lebih tinggi = HR lebih rendah (santai)': 'Higher = lower HR (relaxed)',
'Lebih tinggi = pemulihan lebih baik': 'Higher = better recovery',
'Lebih tinggi = variabilitas lebih besar': 'Higher = greater variability',
'Lebih tinggi = tonus vagal lebih kuat': 'Higher = stronger vagal tone',
'Lebih tinggi = pemulihan HRV lebih baik': 'Higher = better HRV recovery',
'Proxy RMSSD — short-term variability': 'RMSSD proxy — short-term variability',
'Long-term variability — overall HRV': 'Long-term variability — overall HRV',
'Lebih tinggi = dominansi simpatis (stres)': 'Higher = sympathetic dominance (stress)',
'Lebih rendah = ritme lebih teratur (stres)': 'Lower = more regular rhythm (stress)',
'Lebih rendah = sinyal lebih sederhana (stres)': 'Lower = simpler signal (stress)',
'Intensitas Latihan': 'Training Intensity',
'Jam Latihan/Minggu': 'Training Hours/Week',
'Hari Recovery/Minggu': 'Recovery Days/Week',
'Skor Kelelahan': 'Fatigue Score',
'Skor Performa': 'Performance Score',
'Risiko ACL': 'ACL Risk',
'Keseimbangan Beban': 'Load Balance',
'Cedera': 'Injured',
'Sehat': 'Healthy',
'🔥 Skor Kelelahan': '🔥 Fatigue Score',
'💪 Intensitas Latihan': '💪 Training Intensity',
'🦵 Risiko ACL': '🦵 ACL Risk',
'⚖️ Keseimbangan Beban': '⚖️ Load Balance',
'😴 Hari Recovery': '😴 Recovery Days',
'HR rata-rata (bpm)': 'Average HR (bpm)',
'Suhu Tubuh (°C)': 'Body Temperature (°C)',
'Langkah rata-rata': 'Average steps',
'Suhu Tubuh': 'Body Temperature',
'Step Count': 'Step Count',
'langkah': 'steps',
'4 dataset · ': '4 datasets · ',
'Gagal memuat data': 'Failed to load data',
```

---

## Report

**Total unique strings extracted: ~820** across 10 files (7 HTML + 3 JS), spanning page chrome, 35 disease registries, 35 self-assessment questionnaires (each 5–8 questions with option labels), metric detail panels for 12 physiological signals, alert templates, encyclopedia dataset labels, and JSON-LD MedicalCondition fragments.

**Top 5 conditions with the densest text content** (in `risk-detail.html` RISKS registry):

1. **TEPRS / Environment Health Risk** — composite intro, 5 factors with full unit labels, 3 mitigation actions with two-line clinical rationales, TUHAM calibration paragraph (~13 strings + long description).
2. **Asma / ISPA / COPD** — 3 factors, 4 actions each with action + sub-text, plus a long description mentioning PM2.5 threshold mechanics (~15 strings + description).
3. **Heatstroke** — 4 factors with mixed units, 4 emergency actions including 119 callout, full pathophysiology description covering Indonesian tropical context (~14 strings + description).
4. **AFib / Atrial Fibrillation** — 3 factors (HRV, SpO₂, RHR), 3 actions with paroxysmal-AFib clinical reasoning, screening-vs-diagnostic disclaimer paragraph (~13 strings + description).
5. **Sunburn** — 3 factors (UV, heat, cumulative dose), 3 actions with SPF dosing details, photoaging/skin-cancer description with Southeast Asian skin-type calibration note (~13 strings + description).

**Ambiguous medical terms — flagged for review**:
- "ISPA" — translated to "ARI" (Acute Respiratory Infection) per glossary. Indonesian medical literature sometimes uses ISPA broadly; English UX may need a tooltip on first mention.
- "Demam" — kept as "Fever" but the registry id `demam` and label `Demam (Fever)` already bilingual; ensure key/value separation when implementing.
- "Hipoksia Ringan" → "Mild Hypoxia" — note that clinical English usually says "mild hypoxemia" for low SpO₂; chose "Hypoxia" for consistency with rest of UI.
- "ISPU" (Indonesian air-quality index) left untranslated — Indonesia-specific regulatory term.
- "Riskesdas" (national health survey) left untranslated — proper noun.
- "PPOK" (alt spelling for COPD in option lists) — translated as "COPD" per glossary.
- Severity labels `RINGAN/SEDANG/TINGGI/KRITIS` translated as `MILD/MODERATE/HIGH/CRITICAL` — note `RENDAH` (used in assessment result) maps to `LOW` to align with the lower-bound severity tier vocabulary already used elsewhere in the app.

The output file is at `C:\Users\mosto\Desktop\aervio\docs\i18n-strings-cluster-b.md`.
