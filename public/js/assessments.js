/* AERVINEX Self-Assessment Questionnaires — 35 conditions.
   Question types:
     yn       — yes/no (1 or 0)
     scale    — 0-5 Likert (normalized 0-1)
     multi    — multi-select checkboxes (count selected / total)
     radio    — single choice with explicit option weights
     num      — number input with min/max range, normalized
   Each question has weight (sum should ≈ 1.0 across questions).
   Final score = sum(answer_normalized * weight) * 100 → 0-100%
*/
window.ASSESSMENTS = {

  // ── Composite ──────────────────────────────────────
  teprs: {
    name: 'Environment Health Risk · Self-Check',
    icon: '🌍',
    desc: 'Self-assessment paparan lingkungan + respon tubuh Anda. Combine dengan reading sensor untuk full TEPRS.',
    questions: [
      { id: 'q1', type: 'radio', q: 'Berapa jam/hari Anda outdoor area perkotaan?', options: [['<1 jam',0.1],['1-2 jam',0.3],['3-5 jam',0.6],['>5 jam',0.9]], weight: 0.25 },
      { id: 'q2', type: 'radio', q: 'Rute commute utama:', options: [['Mobil/kantor AC',0.2],['Transportasi umum',0.5],['Motor/sepeda',0.8],['Jalan kaki',0.9]], weight: 0.20 },
      { id: 'q3', type: 'multi', q: 'Gejala yang dialami minggu ini:', opts: ['Pusing','Sesak napas','Iritasi mata','Sakit tenggorokan','Batuk','Kulit terbakar matahari','Cepat lelah'], weight: 0.25 },
      { id: 'q4', type: 'scale', q: 'Kualitas tidur seminggu ini (0=buruk, 5=excellent):', weight: 0.15, inverted: true },
      { id: 'q5', type: 'yn', q: 'Pernah pakai masker outdoor minggu ini?', weight: 0.10, inverted: true },
      { id: 'q6', type: 'num', q: 'Aktivitas fisik (menit/minggu):', min: 0, max: 600, weight: 0.05, inverted: true },
    ]
  },

  // ── Pernapasan ─────────────────────────────────────
  asma: {
    name: 'Asma · Self-Assessment',
    icon: '🫁',
    desc: 'Berbasis GINA Asthma Control Test (ACT) yang dimodifikasi.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi sesak, wheezing, batuk malam minggu ini (0=tidak ada, 5=setiap hari):', weight: 0.25 },
      { id: 'q2', type: 'yn', q: 'Apakah Anda terdiagnosis asma oleh dokter?', weight: 0.20 },
      { id: 'q3', type: 'radio', q: 'Penggunaan inhaler reliever (Ventolin/Salbutamol):', options: [['Tidak pakai',0.0],['<2x/minggu',0.3],['2-3x/minggu',0.6],['Setiap hari',1.0]], weight: 0.20 },
      { id: 'q4', type: 'multi', q: 'Pemicu yang Anda alami:', opts: ['Polusi udara','Asap rokok','Debu rumah','Bulu hewan','Cuaca dingin','Aktivitas fisik','Stres','Infeksi virus'], weight: 0.15 },
      { id: 'q5', type: 'scale', q: 'Frekuensi terbangun malam karena sesak:', weight: 0.10 },
      { id: 'q6', type: 'yn', q: 'Pernah PEF/spirometry abnormal?', weight: 0.10 },
    ]
  },
  ispa: {
    name: 'ISPA · Self-Assessment', icon: '🤧', desc: 'Skrining infeksi saluran napas akut akibat polusi+infeksi.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Severity batuk minggu ini:', weight: 0.25 },
      { id: 'q2', type: 'yn', q: 'Demam > 37.5°C dalam 7 hari terakhir?', weight: 0.25 },
      { id: 'q3', type: 'multi', q: 'Gejala yang dialami:', opts: ['Pilek','Nyeri tenggorokan','Sakit kepala','Lelah','Hidung tersumbat','Suara serak'], weight: 0.20 },
      { id: 'q4', type: 'radio', q: 'Paparan PM2.5 area Anda (hari ini):', options: [['Tidak tahu',0.3],['Baik <35',0.1],['Sedang 35-55',0.5],['Tidak Sehat >55',0.9]], weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Kontak dengan penderita ISPA dalam 7 hari?', weight: 0.15 },
    ]
  },
  copd: {
    name: 'COPD · Self-Assessment', icon: '🚬', desc: 'Modified CAT (COPD Assessment Test) — bukan diagnostik.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Sesak napas saat aktivitas (jalan cepat/naik tangga):', weight: 0.25 },
      { id: 'q2', type: 'radio', q: 'Riwayat merokok:', options: [['Tidak pernah',0.0],['Berhenti >10 thn',0.2],['Berhenti <10 thn',0.5],['Masih merokok',1.0]], weight: 0.25 },
      { id: 'q3', type: 'scale', q: 'Batuk produktif (dahak) di pagi hari:', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Pernah terdiagnosis COPD/emfisema?', weight: 0.20 },
      { id: 'q5', type: 'num', q: 'Usia Anda:', min: 18, max: 90, weight: 0.10 },
    ]
  },
  hipoksia: {
    name: 'Hipoksia Ringan · Self-Assessment', icon: '🫁', desc: 'Skrining oksigenasi tidak optimal.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi pusing/sakit kepala ringan:', weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Cepat lelah saat aktivitas ringan:', weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'SpO₂ pernah <95% saat istirahat?', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Pernah pingsan/hampir pingsan?', weight: 0.10 },
      { id: 'q5', type: 'multi', q: 'Faktor risiko:', opts: ['Altitude >1500m','Sleep apnea','Anemia diketahui','PPOK/COPD','Asthma'], weight: 0.15 },
    ]
  },
  pneumonia: {
    name: 'Pneumonia · Self-Assessment', icon: '🦠', desc: 'WARNING: jika positif, konsultasi medis segera. Pneumonia butuh diagnosis radiologi.',
    questions: [
      { id: 'q1', type: 'yn', q: 'Demam > 38°C >2 hari?', weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Severity sesak napas:', weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Batuk dengan dahak hijau/kuning/berdarah?', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Nyeri dada saat napas dalam?', weight: 0.15 },
      { id: 'q5', type: 'multi', q: 'Faktor risiko:', opts: ['Usia >65','Diabetes','Kanker aktif','Steroid kronik','Imunokompromis'], weight: 0.10 },
    ]
  },
  bronchitis: {
    name: 'Bronchitis Akut · Self-Assessment', icon: '😷', desc: '90% kasus viral · self-limiting 1-3 minggu.',
    questions: [
      { id: 'q1', type: 'radio', q: 'Durasi batuk:', options: [['<7 hari',0.3],['1-2 minggu',0.6],['2-3 minggu',0.8],['>3 minggu',1.0]], weight: 0.30 },
      { id: 'q2', type: 'yn', q: 'Demam ringan dalam onset?', weight: 0.20 },
      { id: 'q3', type: 'multi', q: 'Gejala penyerta:', opts: ['Nyeri dada saat batuk','Wheezing','Lelah','Pilek','Suara serak'], weight: 0.25 },
      { id: 'q4', type: 'yn', q: 'Riwayat asma/atopi?', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Paparan asap/polusi tinggi minggu ini?', weight: 0.10 },
    ]
  },
  'asma-exacerbation': {
    name: 'Prediksi Asma Eksaserbasi · Self-Check', icon: '⚡', desc: 'Forecast 6-24 jam ahead.',
    questions: [
      { id: 'q1', type: 'yn', q: 'Apakah Anda diagnosis asma aktif?', weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Penggunaan reliever 24 jam terakhir:', weight: 0.25 },
      { id: 'q3', type: 'scale', q: 'Sesak napas saat ini:', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'PM2.5 area prediksi memburuk?', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Pernah eksaserbasi butuh ER 12 bulan terakhir?', weight: 0.10 },
    ]
  },
  'copd-exacerbation': {
    name: 'Prediksi COPD Eksaserbasi · Self-Check', icon: '⚡', desc: 'Forecast 24-48 jam.',
    questions: [
      { id: 'q1', type: 'yn', q: 'Apakah Anda diagnosis COPD?', weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Sesak napas memburuk dibanding baseline:', weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Dahak berubah warna/volume meningkat?', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'ISPA dalam 14 hari terakhir?', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Riwayat eksaserbasi 12 bulan?', weight: 0.10 },
    ]
  },
  'sleep-apnea': {
    name: 'Sleep Apnea Screening (STOP-BANG)', icon: '😴', desc: 'STOP-BANG questionnaire adapted.',
    questions: [
      { id: 'q1', type: 'yn', q: 'Anda mendengkur keras (loud snoring)?', weight: 0.15 },
      { id: 'q2', type: 'yn', q: 'Sering merasa lelah/mengantuk siang hari?', weight: 0.15 },
      { id: 'q3', type: 'yn', q: 'Pernah diobservasi berhenti napas saat tidur?', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Tekanan darah tinggi/terdiagnosis hipertensi?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'BMI > 35?', weight: 0.10 },
      { id: 'q6', type: 'yn', q: 'Usia > 50 tahun?', weight: 0.10 },
      { id: 'q7', type: 'yn', q: 'Lingkar leher > 40 cm?', weight: 0.10 },
      { id: 'q8', type: 'yn', q: 'Jenis kelamin pria?', weight: 0.10 },
    ]
  },

  // ── Kardiovaskular ─────────────────────────────────
  afib: {
    name: 'AFib · Self-Assessment', icon: '❤️', desc: 'Skrining gejala atrial fibrillation.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi palpitasi (jantung berdebar tidak teratur):', weight: 0.30 },
      { id: 'q2', type: 'yn', q: 'Pernah terdiagnosis AFib/aritmia?', weight: 0.25 },
      { id: 'q3', type: 'multi', q: 'Gejala penyerta:', opts: ['Pusing','Sesak napas','Kelelahan','Pingsan','Nyeri dada'], weight: 0.20 },
      { id: 'q4', type: 'num', q: 'Usia:', min: 18, max: 100, weight: 0.15 },
      { id: 'q5', type: 'multi', q: 'Risk factor:', opts: ['Hipertensi','Diabetes','Penyakit jantung','Hipertiroid','Konsumsi alkohol harian'], weight: 0.10 },
    ]
  },
  bradikardia: {
    name: 'Bradikardia · Self-Assessment', icon: '🐢', desc: 'HR < 60 bpm istirahat.',
    questions: [
      { id: 'q1', type: 'num', q: 'Resting HR rata-rata (bpm):', min: 30, max: 100, weight: 0.40, inverted: true },
      { id: 'q2', type: 'multi', q: 'Gejala bradikardia:', opts: ['Pusing','Lelah','Pingsan','Sesak saat aktivitas','Konfusi'], weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Anda atlet trained (latihan endurance)?', weight: 0.15, inverted: true },
      { id: 'q4', type: 'yn', q: 'Konsumsi beta-blocker/calcium channel blocker?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Riwayat pacemaker/heart block?', weight: 0.10 },
    ]
  },
  takikardia: {
    name: 'Takikardia Istirahat · Self-Assessment', icon: '🐇', desc: 'RHR > 100 bpm.',
    questions: [
      { id: 'q1', type: 'num', q: 'Resting HR rata-rata (bpm):', min: 50, max: 180, weight: 0.40 },
      { id: 'q2', type: 'multi', q: 'Faktor pemicu:', opts: ['Stres tinggi','Demam','Dehidrasi','Anemia','Hipertiroid','Kehamilan'], weight: 0.25 },
      { id: 'q3', type: 'scale', q: 'Konsumsi caffeine/energy drink:', weight: 0.15 },
      { id: 'q4', type: 'multi', q: 'Gejala penyerta:', opts: ['Palpitasi','Pusing','Sesak','Nyeri dada','Berkeringat'], weight: 0.20 },
    ]
  },
  'ektopik-beat': {
    name: 'PVC / PAC · Self-Assessment', icon: '💗', desc: 'Premature contraction screening.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi sensasi "skipped beat":', weight: 0.35 },
      { id: 'q2', type: 'scale', q: 'Konsumsi caffeine harian (cup):', weight: 0.20 },
      { id: 'q3', type: 'scale', q: 'Konsumsi alkohol/minggu:', weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Riwayat penyakit jantung struktural?', weight: 0.15 },
      { id: 'q5', type: 'scale', q: 'Tingkat stres saat ini:', weight: 0.15 },
    ]
  },
  hipertensi: {
    name: 'Hipertensi · Self-Assessment', icon: '🩸', desc: 'Skrining risiko hipertensi · konfirmasi cuff BP wajib.',
    questions: [
      { id: 'q1', type: 'num', q: 'Sistolik terakhir (mmHg):', min: 80, max: 220, weight: 0.30 },
      { id: 'q2', type: 'num', q: 'Diastolik terakhir (mmHg):', min: 40, max: 130, weight: 0.20 },
      { id: 'q3', type: 'multi', q: 'Faktor risiko:', opts: ['Riwayat keluarga','Obesitas','Konsumsi garam tinggi','Sedentary','Stres kronik','Alkohol harian','Merokok'], weight: 0.25 },
      { id: 'q4', type: 'num', q: 'Usia:', min: 18, max: 100, weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Sedang konsumsi obat antihipertensi?', weight: 0.10 },
    ]
  },
  vasovagal: {
    name: 'Vasovagal Syncope · Self-Assessment', icon: '🫨', desc: 'Pingsan reflex screening.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi pingsan/hampir pingsan 12 bulan:', weight: 0.35 },
      { id: 'q2', type: 'multi', q: 'Trigger Anda:', opts: ['Berdiri lama','Panas','Lapar','Dehidrasi','Pemandangan darah','Stres emosional','Buang air'], weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Gejala pre-syncope (pusing, berkeringat, mual)?', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Riwayat keluarga vasovagal?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Pernah konfirmasi tilt-table test?', weight: 0.10 },
    ]
  },
  'cv-fitness': {
    name: 'CV Fitness · Self-Assessment', icon: '📉', desc: 'VO₂max + HR recovery estimation.',
    questions: [
      { id: 'q1', type: 'radio', q: 'Frekuensi exercise aerobik:', options: [['Tidak pernah',1.0],['1-2x/minggu',0.6],['3-4x/minggu',0.3],['5+x/minggu',0.1]], weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Kemudahan naik 2 lantai (0=mudah, 5=tidak bisa):', weight: 0.25 },
      { id: 'q3', type: 'num', q: 'Resting HR (bpm):', min: 40, max: 100, weight: 0.20 },
      { id: 'q4', type: 'num', q: 'HR recovery 1 menit pasca latihan (bpm drop):', min: 0, max: 60, weight: 0.15, inverted: true },
      { id: 'q5', type: 'num', q: 'Usia:', min: 18, max: 90, weight: 0.10 },
    ]
  },
  'cardiac-event': {
    name: 'Cardiac Event Risk · Self-Assessment', icon: '🚨', desc: 'Composite indicator · BUKAN untuk gejala akut!',
    questions: [
      { id: 'q1', type: 'multi', q: 'Riwayat:', opts: ['CAD/Angina','MI sebelumnya','Stroke','Diabetes','Hipertensi','Dislipidemia'], weight: 0.40 },
      { id: 'q2', type: 'yn', q: 'Merokok aktif?', weight: 0.15 },
      { id: 'q3', type: 'num', q: 'Usia:', min: 18, max: 100, weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Riwayat keluarga MI < 55 tahun?', weight: 0.15 },
      { id: 'q5', type: 'multi', q: 'Gejala 24 jam terakhir:', opts: ['Nyeri dada','Sesak','Palpitasi','Pingsan','Berkeringat dingin'], weight: 0.15 },
    ]
  },

  // ── Heat ────────────────────────────────────────────
  heatstroke: {
    name: 'Heatstroke Risk · Self-Assessment', icon: '🥵', desc: 'WARNING: severe heat illness = emergency.',
    questions: [
      { id: 'q1', type: 'num', q: 'Heat index saat ini (°C):', min: 20, max: 50, weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Durasi outdoor (jam):', weight: 0.20 },
      { id: 'q3', type: 'multi', q: 'Gejala:', opts: ['Berkeringat berhenti','Confusion','Mual/muntah','Sakit kepala parah','HR sangat cepat','Kulit panas kering'], weight: 0.25 },
      { id: 'q4', type: 'yn', q: 'Acclimatized ke cuaca panas?', weight: 0.10, inverted: true },
      { id: 'q5', type: 'yn', q: 'Hidrasi adekuat (>2L hari ini)?', weight: 0.15, inverted: true },
    ]
  },
  'kelelahan-panas': {
    name: 'Heat Exhaustion · Self-Assessment', icon: '🌡️', desc: 'Stage sebelum heatstroke.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Severity kelelahan saat ini:', weight: 0.30 },
      { id: 'q2', type: 'multi', q: 'Gejala:', opts: ['Berkeringat berlebih','Pusing','Kram otot','Mual','Lemas','Headache'], weight: 0.30 },
      { id: 'q3', type: 'num', q: 'Heat index (°C):', min: 25, max: 45, weight: 0.20 },
      { id: 'q4', type: 'num', q: 'Durasi aktivitas outdoor (menit):', min: 0, max: 360, weight: 0.10 },
      { id: 'q5', type: 'scale', q: 'Hidrasi (0=cukup, 5=sangat kurang):', weight: 0.10 },
    ]
  },
  dehidrasi: {
    name: 'Dehidrasi · Self-Assessment', icon: '💧', desc: 'Skrining cepat status hidrasi.',
    questions: [
      { id: 'q1', type: 'radio', q: 'Warna urine:', options: [['Bening',0.0],['Kuning muda',0.2],['Kuning gelap',0.6],['Coklat',1.0]], weight: 0.30 },
      { id: 'q2', type: 'num', q: 'Asupan cairan hari ini (liter):', min: 0, max: 5, weight: 0.25, inverted: true },
      { id: 'q3', type: 'multi', q: 'Gejala:', opts: ['Haus','Mulut kering','Pusing','Lemas','Sakit kepala','BAK kurang'], weight: 0.20 },
      { id: 'q4', type: 'scale', q: 'Tingkat aktivitas hari ini (0=istirahat, 5=intens):', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Cuaca panas/lembab?', weight: 0.10 },
    ]
  },
  'heat-cramps': {
    name: 'Heat Cramps · Self-Assessment', icon: '🦵', desc: 'Kram otot saat aktivitas panas.',
    questions: [
      { id: 'q1', type: 'yn', q: 'Sedang/baru saja mengalami kram otot?', weight: 0.30 },
      { id: 'q2', type: 'scale', q: 'Intensitas keringat:', weight: 0.25 },
      { id: 'q3', type: 'num', q: 'Durasi aktivitas (jam):', min: 0, max: 6, weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Konsumsi sport drink/elektrolit?', weight: 0.15, inverted: true },
      { id: 'q5', type: 'num', q: 'Heat index (°C):', min: 25, max: 45, weight: 0.10 },
    ]
  },
  hyponatremia: {
    name: 'Hyponatremia (EAH) · Self-Assessment', icon: '🧂', desc: 'Overhydration during endurance.',
    questions: [
      { id: 'q1', type: 'num', q: 'Asupan air saat aktivitas (L/jam):', min: 0, max: 2, weight: 0.40 },
      { id: 'q2', type: 'num', q: 'Durasi aktivitas (jam):', min: 0, max: 8, weight: 0.20 },
      { id: 'q3', type: 'yn', q: 'Konsumsi sodium/electrolyte selama aktivitas?', weight: 0.15, inverted: true },
      { id: 'q4', type: 'multi', q: 'Gejala:', opts: ['Sakit kepala','Mual','Bingung','Edema (bengkak)','Lemah'], weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Berat badan naik post-exercise?', weight: 0.10 },
    ]
  },

  // ── Kulit & UV ──────────────────────────────────────
  sunburn: {
    name: 'Sunburn · Self-Assessment', icon: '☀️', desc: 'Risiko paparan UV.',
    questions: [
      { id: 'q1', type: 'num', q: 'UV index saat ini (0-11+):', min: 0, max: 11, weight: 0.30 },
      { id: 'q2', type: 'num', q: 'Durasi outdoor unprotected (menit):', min: 0, max: 240, weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Pakai sunscreen SPF 30+?', weight: 0.20, inverted: true },
      { id: 'q4', type: 'radio', q: 'Tipe kulit (Fitzpatrick):', options: [['Tipe I (selalu terbakar)',1.0],['Tipe II',0.8],['Tipe III',0.5],['Tipe IV (Asia Tenggara)',0.3],['Tipe V-VI (gelap)',0.1]], weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Riwayat sunburn parah <12 bulan?', weight: 0.10 },
    ]
  },
  photokeratitis: {
    name: 'Photokeratitis · Self-Assessment', icon: '👁️', desc: 'UV burn pada mata.',
    questions: [
      { id: 'q1', type: 'multi', q: 'Gejala mata:', opts: ['Nyeri','Mata merah','Photophobia','Penglihatan kabur','Sensasi pasir di mata','Berair'], weight: 0.40 },
      { id: 'q2', type: 'yn', q: 'Outdoor tanpa kacamata UV dalam 24 jam?', weight: 0.25 },
      { id: 'q3', type: 'num', q: 'UV index saat itu:', min: 0, max: 11, weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Area reflektif (salju, air, pasir putih)?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Pernah welding/UV lamp exposure?', weight: 0.05 },
    ]
  },
  'vitamin-d': {
    name: 'Vitamin D Status · Self-Assessment', icon: '🌞', desc: 'Tracking sintesis dari paparan UV-B.',
    questions: [
      { id: 'q1', type: 'radio', q: 'Paparan matahari pagi (10-12 menit):', options: [['Setiap hari',0.0],['3-5x/minggu',0.2],['1-2x/minggu',0.5],['Hampir tidak pernah',1.0]], weight: 0.35 },
      { id: 'q2', type: 'radio', q: 'Lifestyle:', options: [['Outdoor worker',0.1],['Mixed indoor/outdoor',0.4],['Mostly indoor (kantoran)',0.8],['Hampir tidak pernah outdoor',1.0]], weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Konsumsi ikan berlemak ≥2x/minggu?', weight: 0.15, inverted: true },
      { id: 'q4', type: 'yn', q: 'Suplementasi vitamin D?', weight: 0.10, inverted: true },
      { id: 'q5', type: 'yn', q: 'Pakai sunscreen daily (full coverage)?', weight: 0.10 },
      { id: 'q6', type: 'radio', q: 'Skin tone:', options: [['Sangat terang',0.0],['Sedang',0.3],['Gelap',0.7]], weight: 0.05 },
    ]
  },
  'skin-cancer': {
    name: 'Skin Cancer Risk · Self-Assessment', icon: '🔬', desc: 'Long-term cumulative UV risk.',
    questions: [
      { id: 'q1', type: 'num', q: 'Jumlah sunburn parah lifetime:', min: 0, max: 30, weight: 0.30 },
      { id: 'q2', type: 'radio', q: 'Skin type:', options: [['Tipe I (selalu terbakar)',1.0],['Tipe II',0.7],['Tipe III',0.4],['Tipe IV',0.2],['Tipe V-VI',0.1]], weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Riwayat keluarga skin cancer?', weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Mole/nevi banyak (>50)?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Pernah tanning bed?', weight: 0.10 },
      { id: 'q6', type: 'multi', q: 'ABCDE warning di mole:', opts: ['Asymmetry','Border irregular','Color variation','Diameter >6mm','Evolving'], weight: 0.10 },
    ]
  },

  // ── Suhu Tubuh ──────────────────────────────────────
  demam: {
    name: 'Demam · Self-Assessment', icon: '🤒', desc: 'Suhu tubuh > 37.5°C.',
    questions: [
      { id: 'q1', type: 'num', q: 'Suhu tubuh terakhir (°C):', min: 35, max: 41, weight: 0.50 },
      { id: 'q2', type: 'multi', q: 'Gejala:', opts: ['Menggigil','Berkeringat','Sakit kepala','Lelah','Nyeri otot','Mual'], weight: 0.20 },
      { id: 'q3', type: 'num', q: 'Durasi demam (hari):', min: 0, max: 14, weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Sudah konsumsi antipiretik?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Bisa identifikasi fokus infeksi (tenggorokan, ISK, dll)?', weight: 0.05, inverted: true },
    ]
  },
  hipotermia: {
    name: 'Hipotermia · Self-Assessment', icon: '🥶', desc: 'Body core < 35°C.',
    questions: [
      { id: 'q1', type: 'num', q: 'Suhu tubuh terakhir (°C):', min: 30, max: 37, weight: 0.50, inverted: true },
      { id: 'q2', type: 'multi', q: 'Gejala:', opts: ['Menggigil hebat','Kulit pucat/biru','Konfusi','Bicara melambat','Lemas','Drowsiness'], weight: 0.25 },
      { id: 'q3', type: 'yn', q: 'Paparan dingin/basah lama?', weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Pakaian basah?', weight: 0.10 },
    ]
  },

  // ── Stress & Mental ─────────────────────────────────
  'stress-kronik': {
    name: 'Stres Kronik · Self-Assessment (PSS-10 adapted)', icon: '😰', desc: 'Perceived Stress Scale adapted.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi merasa kewalahan minggu ini:', weight: 0.20 },
      { id: 'q2', type: 'scale', q: 'Frekuensi gugup/cemas:', weight: 0.20 },
      { id: 'q3', type: 'scale', q: 'Kesulitan tidur akibat pikiran:', weight: 0.15 },
      { id: 'q4', type: 'scale', q: 'Iritabilitas/mudah marah:', weight: 0.15 },
      { id: 'q5', type: 'scale', q: 'Frekuensi feel "in control" (0=tdk pernah, 5=selalu):', weight: 0.15, inverted: true },
      { id: 'q6', type: 'multi', q: 'Gejala somatik:', opts: ['Sakit kepala','Ketegangan otot','Sakit perut','Tachycardia','Berkeringat berlebihan'], weight: 0.15 },
    ]
  },
  burnout: {
    name: 'Burnout (Maslach MBI) · Self-Assessment', icon: '🪫', desc: 'Adapted from Maslach Burnout Inventory.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Merasa emotionally drained dari pekerjaan:', weight: 0.25 },
      { id: 'q2', type: 'scale', q: 'Frekuensi cynicism / detachment dari work:', weight: 0.20 },
      { id: 'q3', type: 'scale', q: 'Penurunan sense of accomplishment:', weight: 0.20 },
      { id: 'q4', type: 'scale', q: 'Kelelahan fisik di awal hari kerja:', weight: 0.15 },
      { id: 'q5', type: 'scale', q: 'Penurunan produktivitas:', weight: 0.10 },
      { id: 'q6', type: 'num', q: 'Jam kerja/minggu:', min: 0, max: 80, weight: 0.10 },
    ]
  },
  'anxiety-panic': {
    name: 'Panic Attack · Self-Assessment', icon: '😱', desc: 'Berdasar DSM-5 panic criteria.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi serangan panik 30 hari:', weight: 0.30 },
      { id: 'q2', type: 'multi', q: 'Gejala saat serangan:', opts: ['Palpitasi','Sesak napas','Pusing','Berkeringat','Tremor','Mual','Hot flashes','Fear of dying','Derealization','Numbness'], weight: 0.30 },
      { id: 'q3', type: 'scale', q: 'Severity peak attack (0=ringan, 5=incapacitating):', weight: 0.15 },
      { id: 'q4', type: 'yn', q: 'Mengganggu fungsi harian?', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Avoidance behavior (menghindari trigger)?', weight: 0.10 },
    ]
  },
  'sleep-deprivation': {
    name: 'Sleep Deprivation · Self-Assessment', icon: '😪', desc: 'Cumulative sleep debt.',
    questions: [
      { id: 'q1', type: 'num', q: 'Rata-rata tidur (jam/malam) minggu ini:', min: 3, max: 12, weight: 0.40, inverted: true },
      { id: 'q2', type: 'scale', q: 'Kualitas tidur:', weight: 0.20, inverted: true },
      { id: 'q3', type: 'scale', q: 'Daytime sleepiness:', weight: 0.20 },
      { id: 'q4', type: 'yn', q: 'Konsumsi caffeine >2 cup/hari?', weight: 0.10 },
      { id: 'q5', type: 'yn', q: 'Screen time >1 jam pre-bed?', weight: 0.10 },
    ]
  },

  // ── Aktivitas ───────────────────────────────────────
  overtraining: {
    name: 'Overtraining Syndrome · Self-Assessment', icon: '🏋️', desc: 'NFOR vs OTS distinction.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Performance plateau/decline despite training:', weight: 0.25 },
      { id: 'q2', type: 'scale', q: 'Persistent fatigue meski rest:', weight: 0.20 },
      { id: 'q3', type: 'multi', q: 'Gejala penyerta:', opts: ['Mood swing','Sleep disturbance','Loss appetite','Frequent illness','Muscle soreness chronic','Hilang motivasi'], weight: 0.20 },
      { id: 'q4', type: 'num', q: 'Training hours/week:', min: 0, max: 30, weight: 0.15 },
      { id: 'q5', type: 'num', q: 'Recovery days/week:', min: 0, max: 7, weight: 0.10, inverted: true },
      { id: 'q6', type: 'scale', q: 'RHR rise dari baseline (0=tidak, 5=>10 bpm naik):', weight: 0.10 },
    ]
  },
  sedentary: {
    name: 'Sedentary Risk · Self-Assessment', icon: '🛋️', desc: 'WHO physical activity guidelines.',
    questions: [
      { id: 'q1', type: 'num', q: 'Steps/hari rata-rata:', min: 1000, max: 15000, weight: 0.35, inverted: true },
      { id: 'q2', type: 'num', q: 'Jam duduk/hari (kerja+leisure):', min: 4, max: 16, weight: 0.30 },
      { id: 'q3', type: 'num', q: 'Exercise terstruktur/minggu (menit):', min: 0, max: 500, weight: 0.20, inverted: true },
      { id: 'q4', type: 'yn', q: 'Break sitting tiap 30 mnt?', weight: 0.10, inverted: true },
      { id: 'q5', type: 'yn', q: 'Resistance training 2x/minggu?', weight: 0.05, inverted: true },
    ]
  },

  // ── Triggers ────────────────────────────────────────
  'migraine-trigger': {
    name: 'Migraine Trigger · Self-Assessment', icon: '🤕', desc: 'Multi-trigger pattern analysis.',
    questions: [
      { id: 'q1', type: 'scale', q: 'Frekuensi migrain/bulan:', weight: 0.30 },
      { id: 'q2', type: 'multi', q: 'Trigger Anda:', opts: ['Heat extrem','UV/bright light','Dehidrasi','Sleep disruption','Stres','Hormonal','Caffeine','Wine/red wine','Cheese aged','Skipping meals','Cuaca berubah'], weight: 0.30 },
      { id: 'q3', type: 'yn', q: 'Aura sebelum migrain?', weight: 0.10 },
      { id: 'q4', type: 'scale', q: 'Severity pain saat episode:', weight: 0.15 },
      { id: 'q5', type: 'yn', q: 'Konsumsi profilaksis (CGRP, beta-blocker)?', weight: 0.10, inverted: true },
      { id: 'q6', type: 'yn', q: 'Riwayat keluarga migrain?', weight: 0.05 },
    ]
  },
};
