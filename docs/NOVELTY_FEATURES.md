# Rumusan Fitur Novelty — AERVINEX
## "From Detection to Action: A Smartwatch System for Monitoring and Responding to Environment-Induced Health Risks"

> Dokumen ini merumuskan **11 fitur novelty** yang diusulkan berdasarkan:
> - Systematic Literature Review (SLR) PRISMA dari 50 paper PubMed (2017–2026)
> - Masukan pengembangan domain **Sport Science & Sport Technology**
> - Analisis kebutuhan sistem **Risk Analyzer** terintegrasi
>
> Versi: 2.0 | Diperbarui: 4 Mei 2026

---

## Fitur 1: Dual-Layer Sensor Fusion Architecture (DLSFA)

### Latar Belakang Gap
Hampir seluruh smartwatch komersial hanya menangkap data fisiologis (HR, SpO2, HRV) tanpa integrasi data lingkungan. Sistem yang mencoba menggabungkan keduanya umumnya mengharuskan pengguna membawa perangkat lingkungan terpisah (portable AQI meter, UV sensor) yang tidak tersinkronisasi secara real-time dengan data tubuh — sehingga korelasi lingkungan–fisiologi tidak dapat dilakukan secara otomatis dan berkelanjutan. Selain itu, pendekatan "tambah sensor onboard" pada perangkat wrist-worn terkendala berat, ukuran, dan konsumsi daya.

### Rumusan Fitur
Sistem mengintegrasikan dua lapisan data dalam satu platform wearable melalui **Geospatial Environmental Fusion**:

- **Layer 1 — Sensor Fisiologi (onboard smartwatch):**
  - Heart Rate & HRV (RMSSD, SDNN, pNN50) via PPG (MAX30102)
  - Blood Oxygen Saturation / SpO₂ via PPG
  - Skin & Core Temperature via IR Thermal (MLX90614)
  - Electrodermal Activity / Galvanic Skin Response (EDA/GSR)
  - Gait & Motion: Cadence, Impact G-force, Vertical Oscillation, Body Lean (IMU 9-DOF)
  - Posisi & Kecepatan via GPS

- **Layer 2 — Geospatial Environmental Data Integration:**
  - Sistem secara otomatis mengidentifikasi **stasiun pemantauan lingkungan pemerintah terdekat** menggunakan koordinat GPS pengguna real-time (algoritma haversine distance ranking)
  - Data yang diambil per siklus:
    - PM2.5 / AQI dari jaringan **IQAir/WAQI** (stasiun BMKG/KLHK terdekat)
    - Suhu Ambien, Kelembaban, UV Index, Kecepatan Angin dari **Open-Meteo** (model ECMWF/DWD)
  - Label sumber ditampilkan secara transparan: nama stasiun + jarak dari pengguna (contoh: *"Stasiun: Jakarta-Kemayoran · 2.3 km"*)
  - Tidak memerlukan sensor lingkungan fisik tambahan pada perangkat

- **Fusion Engine:**
  - Layer 1 dan Layer 2 disampel dalam siklus yang sama dan diberi **timestamp alignment** untuk korelasi langsung antara paparan lingkungan dan respons fisiologi
  - Preprocessing terjadi di edge (mobile app): normalisasi, interpolasi jika data stasiun tertunda, dan flagging kualitas data
  - Output fusion dikonsumsi oleh TEPRS, MCD, EPO, dan CRAD secara unified

### Arsitektur DLSFA

```
┌───────────────────────────────────────────────────────────────┐
│                     AERVINEX DLSFA PLATFORM                      │
├───────────────────────────┬───────────────────────────────────┤
│   LAYER 1 — ONBOARD       │   LAYER 2 — GEOSPATIAL ENV        │
│   (Wrist-worn Sensors)    │   (Nearest Government Station)     │
│                           │                                     │
│  MAX30102  →  HR, SpO₂,  │  GPS Coords ──► Haversine Rank     │
│             HRV           │       │                             │
│  MLX90614  →  Skin/Core  │       ▼                             │
│             Temp          │  IQAir/WAQI  →  PM2.5, AQI        │
│  EDA/GSR   →  Sympathetic│  Open-Meteo  →  Temp, Hum, UV     │
│             Score         │       │                             │
│  IMU 9-DOF →  Gait, G    │       ▼                             │
│  GPS       →  Position   │  Station Name + Distance Label      │
│                           │                                     │
├───────────────────────────┴───────────────────────────────────┤
│              TIMESTAMP-ALIGNED FUSION ENGINE                   │
│   → TEPRS · MCD · CRAD · EPO · AARC · AIRI · RRSS            │
└───────────────────────────────────────────────────────────────┘
```

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (DLSFA) |
|-------|-----------------|----------------|
| Sensor lingkungan | Perangkat terpisah / tidak ada | Nearest-station otomatis via GPS haversine |
| Sinkronisasi data | Manual / post-hoc | Real-time, per-siklus, timestamp-aligned |
| Form factor | Multi-device (smartwatch + AQI meter + app terpisah) | Single wrist-worn + fusion di mobile |
| Korelasi env–fisio | Tidak otomatis, butuh input manual | Otomatis, geospatial-aware, transparan |
| Sumber data env | Input manual atau API umum tanpa konteks lokasi | Auto nearest-station dari jaringan BMKG/KLHK terdekat |
| Transparansi sumber | Tidak ada | Nama stasiun + jarak ditampilkan real-time |

### Posisi Orisinalitas DLSFA
Kebaruan DLSFA bukan pada menambah sensor fisik baru (yang terkendala ukuran & daya), melainkan pada **otomatisasi pemilihan sumber data lingkungan terdekat secara geospasial dan fusi real-time dengan data fisiologi onboard** — sesuatu yang tidak dilakukan oleh smartwatch komersial manapun. Pengguna tidak perlu memilih kota, stasiun, atau sumber data secara manual: sistem memilih sendiri berdasarkan posisi GPS aktual.

### Referensi Pendukung
- Guarnaccia et al. (2026) — Convergent Sensing: Integrating Biometric and Environmental Monitoring, *Biosensors*
- Kassem et al. (2025) — Climate change, health, and wearable biosensors, *Prog Mol Biol Transl Sci*
- Koch et al. (2022) — Wearables for Health Effects of Climate Change Weather Extremes, *JMIR mHealth*
- Michanikou et al. (2023) — Setup of Consumer Wearables for Exposure & Health Monitoring, *JoVE*

---

## Fitur 2: Tiered Environment-Physiological Risk Score (TEPRS)

### Latar Belakang Gap
Sistem alert yang ada hanya men-trigger notifikasi dari anomali fisiologis saja (misal: HR tinggi). Tidak ada sistem yang mengkuantifikasi risiko secara gabungan antara tingkat paparan lingkungan berbahaya dan respons fisiologis yang terdeteksi, sehingga konteks risiko tidak terbaca dengan akurat.

### Rumusan Fitur
Algoritma scoring real-time yang menghasilkan nilai risiko komposit dari dua dimensi:

**Formula Dasar:**
```
TEPRS = w1 × E_score + w2 × P_score
```

Di mana:
- `E_score` = Environmental Exposure Score (0–100), dihitung dari:
  - Normalisasi AQI lokal (PM2.5, VOC, CO) terhadap standar WHO/BMKG
  - UV Index relatif terhadap paparan harian maksimum
  - Deviasi suhu lingkungan dari zona nyaman termal (18–26°C)
- `P_score` = Physiological Deviation Score (0–100), dihitung dari:
  - Deviasi HR dari baseline personal (%)
  - SpO2 drop dari baseline (%)
  - HRV suppression dari baseline (%)
- `w1`, `w2` = bobot adaptif (default: 0.4, 0.6 — dapat dikonfigurasi)

**Level Risiko dan Aksi:**

| Level | TEPRS | Warna | Makna | Tindakan Default |
|-------|-------|-------|-------|-----------------|
| 0 | 0–24 | 🟢 Hijau | Aman | Monitoring pasif |
| 1 | 25–49 | 🟡 Kuning | Waspada | Notifikasi ringan ke pengguna |
| 2 | 50–74 | 🟠 Oranye | Berbahaya | Alert aktif + rekomendasi tindakan |
| 3 | 75–100 | 🔴 Merah | Kritis | Alert darurat + notifikasi caregiver |

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (TEPRS) |
|-------|-----------------|----------------|
| Basis alert | Hanya fisiologi | Fisiologi + lingkungan |
| Granularitas | Binary (alert/no alert) | 4-level graduated |
| Personalisasi | Threshold global | Berbasis baseline personal |
| Konteks risiko | Tidak ada | Terintegrasi dalam skor |

### Referensi Pendukung
- Alavi et al. (2021) — Real-time Alerting System for COVID-19 Using Wearable Data, *medRxiv/Stanford*
- Esmaeilpour et al. (2024) — Detection of Respiratory Infections Using Consumer Wearables, *JMIR Formative Research*
- Song et al. (2026) — Digital-Human Community Care with Smartwatch Monitoring, *JMIR Aging*

---

## Fitur 3: Automated Action Response Chain (AARC)

### Latar Belakang Gap
Sistem monitoring yang ada bersifat satu arah: sensor → dashboard. Tidak ada sistem yang mengimplementasikan respons otomatis dan terstruktur pasca-deteksi. Penelitian Demkowicz et al. (2023) menunjukkan bahwa respons klinis terhadap alert sangat bervariasi antar tenaga kesehatan, mengindikasikan kebutuhan panduan tindakan yang terstandar.

### Rumusan Fitur
Rantai respons otomatis yang dipicu oleh level TEPRS:

```
[Deteksi Risiko]
      │
      ▼
[TEPRS Level Assessment]
      │
      ├─ Level 1 (Kuning) ──→ [1a] Notifikasi di smartwatch
      │                        [1b] Rekomendasi kontekstual (teks singkat)
      │                        [1c] Logging data ke cloud
      │
      ├─ Level 2 (Oranye) ──→ [2a] Alert vibration + audio
      │                        [2b] Rekomendasi tindakan spesifik
      │                        [2c] Peta lokasi ruang/area lebih aman (jika GPS aktif)
      │                        [2d] Notifikasi ke mobile app pendamping
      │
      └─ Level 3 (Merah) ──→ [3a] Alert darurat maksimum
                              [3b] SMS/push notifikasi ke kontak darurat
                              [3c] Notifikasi ke caregiver / fasilitas kesehatan
                              [3d] Auto-log snapshot data semua sensor
                              [3e] Prompt konfirmasi kondisi pengguna
```

**Komponen Rekomendasi Kontekstual (Level 1–2):**
- Berbasis rule engine dengan input: jenis paparan dominan + waktu + lokasi + profil pengguna
- Contoh output:
  - PM2.5 tinggi + outdoor → "Disarankan masuk ruangan / gunakan masker"
  - Suhu ekstrem + HR tinggi → "Istirahat di tempat sejuk, hindari aktivitas fisik"
  - CO tinggi indoor → "Segera keluar ruangan, buka ventilasi"

**Feedback Loop Post-Action:**
- Pengguna mengkonfirmasi tindakan yang diambil
- Sistem memantau perubahan TEPRS pasca-tindakan (30 menit)
- Hasil dikirim ke log pembelajaran untuk personalisasi berikutnya

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (AARC) |
|-------|-----------------|----------------|
| Respons pasca-deteksi | Hanya alert | Alert + rekomendasi + eskalasi + feedback |
| Aktor yang dilibatkan | Pengguna saja | Pengguna, caregiver, faskes |
| Standarisasi tindakan | Tidak ada | Protocol terstruktur per level |
| Learning dari tindakan | Tidak ada | Feedback loop aktif |

### Referensi Pendukung
- Demkowicz et al. (2023) — Physician responses to Apple Watch alerts, *American Heart Journal*
- Song et al. (2026) — Digital-Human Community Care Integration, *JMIR Aging*
- Michanikou et al. (2023) — Setup of Consumer Wearables for Exposure & Health Monitoring, *JoVE*

---

## Fitur 4: Tropical Urban Health Adaptation Module (TUHAM)

### Latar Belakang Gap
Sebanyak 94% studi wearable environment-health dilakukan di negara berpenghasilan tinggi (Eropa, Amerika Utara). Tidak ada sistem yang divalidasi dan dikalibrasi untuk karakteristik lingkungan kota-kota tropis Asia Tenggara: kelembaban ekstrem (>80%), PM2.5 tinggi (>75 µg/m³), UV Index 10–12 (extreme), dan iklim dengan dua musim (hujan/kemarau).

### Rumusan Fitur
Modul kalibrasi dan adaptasi yang menyesuaikan seluruh sistem dengan konteks urban tropis:

**Sub-komponen:**

1. **Threshold Kalibrasi Regional:**
   - Ambang batas PM2.5 mengacu pada Standar Baku Mutu Udara Ambien (BMKG/KLHK Indonesia): kategori Baik (<15 µg/m³), Sedang (15–65), Tidak Sehat (>65)
   - UV Index threshold disesuaikan dengan paparan harian rata-rata ekuator (UV 8–12 = "Very High" sampai "Extreme")
   - Heat Index model dikalibrasi untuk kombinasi suhu 30–38°C + kelembaban 70–95%

2. **Musim-Aware Risk Adjustment:**
   - Sistem membaca tanggal dan lokasi untuk mengidentifikasi musim (kemarau/penghujan)
   - Bobot polutan udara dinaikkan pada musim kemarau (kebakaran hutan, debu)
   - Bobot suhu/kelembaban dinaikkan pada musim panas kering

3. **Profil Fisiologi Populasi Lokal:**
   - Baseline HR, SpO2, HRV dari populasi Indonesia/Asia Tenggara (BMI rata-rata, kondisi kardiorespiratori)
   - Referensi profil risiko untuk penyakit endemis lokal yang diperparah lingkungan (ISPA, DBD terkait suhu)

4. **Integrasi Data Lingkungan Eksternal:**
   - API BMKG (data cuaca real-time)
   - API KLHK / IQAir (AQI nasional)
   - API BMKG UV Index harian

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (TUHAM) |
|-------|-----------------|----------------|
| Geografis | Negara maju, iklim temperate | Tropis, Asia Tenggara |
| Standar kualitas udara | WHO / EPA | BMKG / KLHK Indonesia |
| Adaptasi musiman | Tidak ada | Otomatis (kemarau/hujan) |
| Integrasi data eksternal | Minimal | API BMKG + KLHK + IQAir |

### Referensi Pendukung
- Kassem et al. (2025) — Climate change, health, and wearable biosensors, *Prog Mol Biol Transl Sci*
- Koch et al. (2022) — Wearables for Climate Change Weather Extremes, *JMIR mHealth*
- GBD 2021 Risk Factors Collaborators (2024) — Global burden of 88 risk factors, *The Lancet*

---

## Fitur 5: Adaptive Personal Risk Baseline (APRB)

### Latar Belakang Gap
Penelitian Dons et al. (2017) menunjukkan variabilitas individual yang sangat besar dalam respons fisiologi terhadap dosis polutan yang sama. Sistem saat ini menggunakan threshold global yang sama untuk semua pengguna, menyebabkan over-alert pada pengguna sehat dan under-alert pada pengguna dengan kondisi tertentu.

### Rumusan Fitur
Sistem on-device learning yang membangun dan memperbarui profil risiko personal secara adaptif:

**Fase 1 — Baseline Acquisition (Hari 1–14):**
- Perangkat merekam data fisiologi dan lingkungan secara pasif
- Tidak ada alert yang dikirim (kecuali anomali ekstrem)
- Sistem membangun distribusi statistik personal: mean ± SD untuk HR, SpO2, HRV dalam berbagai konteks (istirahat, aktif, tidur)

**Fase 2 — Context-Aware Profiling (Hari 15–30):**
- Baseline dibedakan per konteks:
  - Waktu (pagi/siang/malam)
  - Aktivitas fisik (sedentary/walking/running)
  - Lokasi (indoor/outdoor)
  - Hari kerja vs. akhir pekan
- Threshold TEPRS disesuaikan per konteks

**Fase 3 — Continuous Adaptation (Hari 30+):**
- Model diperbarui secara inkremental (online learning) setiap minggu
- Mekanisme drift detection: jika baseline bergeser signifikan → notifikasi ke pengguna (kemungkinan perubahan kondisi kesehatan)
- Federated learning: pola anonim dikontribusikan ke model populasi (opt-in)

**Privacy Safeguards:**
- Semua model disimpan on-device (tidak dikirim ke cloud)
- Kontribusi federated learning sepenuhnya opt-in dan ter-anonimisasi
- Pengguna dapat reset baseline kapan saja

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (APRB) |
|-------|-----------------|----------------|
| Threshold | Global, satu untuk semua | Personal, konteks-aware |
| Adaptasi | Statis / tidak ada | Continuous online learning |
| Drift detection | Tidak ada | Otomatis, dengan notifikasi |
| Privacy | Data ke cloud | On-device, federated opt-in |

### Referensi Pendukung
- Alavi et al. (2021) — Real-time Alerting System (personal baseline approach), *Stanford/medRxiv*
- Ng et al. (2023) — Few-shot personalized AF detection, *Artificial Intelligence in Medicine*
- Dons et al. (2017) — Individual variability in inhaled pollution dose, *Environ Sci & Technology*

---

## Fitur 6: Multi-Context Discriminator (MCD)

### Latar Belakang Gap
Esmaeilpour et al. (2024) melaporkan false positive rate 2%/hari, dengan PPV hanya 4–10% di populasi umum. Penyebab utama: olahraga intens, tidur buruk, stres emosional, dan konsumsi alkohol memicu perubahan fisiologi yang identik dengan respons terhadap paparan lingkungan berbahaya. Alert fatigue akibat false positive adalah hambatan utama adopsi sistem wearable health.

### Rumusan Fitur
Modul filter kontekstual yang membedakan penyebab anomali fisiologi sebelum alert dikirimkan:

**Input MCD:**
- Data akselerometer / gyroscope (tingkat aktivitas fisik aktual)
- Waktu hari (jam biologis — circadian context)
- Data lingkungan dari DLSFA Layer 2 (ada/tidaknya paparan berbahaya)
- Lokasi GPS (indoor/outdoor, kategori area)
- Riwayat aktivitas pengguna (dari APRB)

**Logika Discriminasi:**

```
Jika (anomali fisiologi terdeteksi):
  Jika (aktivitas fisik tinggi) DAN (E_score rendah):
    → Klasifikasi: EXERCISE-INDUCED → Tidak alert, catat log
  
  Jika (waktu malam) DAN (aktivitas rendah) DAN (E_score rendah):
    → Klasifikasi: SLEEP DISRUPTION → Notifikasi ringan (kualitas tidur)
  
  Jika (E_score tinggi) DAN (aktivitas normal/rendah):
    → Klasifikasi: ENVIRONMENT-INDUCED → Proses ke TEPRS → Alert sesuai level
  
  Jika (E_score tinggi) DAN (aktivitas fisik tinggi):
    → Klasifikasi: COMPOUNDED RISK → Tingkatkan TEPRS score (+10%)
  
  Lainnya:
    → Klasifikasi: UNCERTAIN → Monitor 5 menit, reassess
```

**Output MCD:**
- Label penyebab anomali (exercise / sleep / environment / compounded / uncertain)
- Adjusted TEPRS berdasarkan konteks
- Log untuk model improvement

### Keunggulan Dibanding State-of-the-Art
| Aspek | State-of-the-Art | AERVINEX (MCD) |
|-------|-----------------|--------------|
| False positive handling | Tidak ada filter | Context-aware discrimination |
| Sumber konteks | HR saja | HR + akselerometer + env + waktu + GPS |
| Alert fatigue | Tinggi (PPV 4–10%) | Dikurangi signifikan |
| Klasifikasi penyebab | Tidak ada | 5 kategori terstruktur |

### Referensi Pendukung
- Esmaeilpour et al. (2024) — Detection of Respiratory Infections, false positive analysis, *JMIR Formative Research*
- Kim H et al. (2025) — Stress Detection Reproducibility to Consumer Wearable Sensors, *IEEE EMBC*
- Fedorin et al. (2022) — Lightweight HR monitoring, motion artifact reduction, *IEEE EMBC*

---

## Ringkasan Matriks Novelty

| # | Nama Fitur | Kode | Gap Ditutup | Komponen Utama |
|---|-----------|------|-------------|----------------|
| 1 | Dual-Layer Sensor Fusion Architecture | DLSFA | Tidak ada integrasi sensor env dalam smartwatch | Sensor fisio + lingkungan sinkron |
| 2 | Tiered Environment-Physiological Risk Score | TEPRS | Tidak ada scoring risiko gabungan env-fisio | Formula skor + 4 level graduated |
| 3 | Automated Action Response Chain | AARC | Tidak ada closed-loop response system | Rantai aksi otomatis + feedback |
| 4 | Tropical Urban Health Adaptation Module | TUHAM | Tidak ada validasi di Asia/tropis | Kalibrasi regional + API BMKG |
| 5 | Adaptive Personal Risk Baseline | APRB | Threshold global = alert fatigue | On-device personalized learning |
| 6 | Multi-Context Discriminator | MCD | False positive dari olahraga/tidur | Context-aware anomali classification |

---

## Posisi Novelty Utama (Klaim Orisinalitas)

> **AERVINEX adalah sistem pertama yang mengintegrasikan secara kohesif:** deteksi paparan lingkungan berbahaya (DLSFA) → kuantifikasi risiko gabungan environment-fisiologi yang dipersonalisasi (TEPRS + APRB) → aksi terstruktur dan terukur (AARC), dengan pengurangan false positive berbasis konteks (MCD), yang dikalibrasi untuk populasi dan kondisi lingkungan urban tropis Asia Tenggara (TUHAM).

Tidak satupun dari 50 paper yang dianalisis dalam SLR ini mengimplementasikan ketiga komponen inti (Deteksi → Analisis → Aksi) dalam satu platform wearable terintegrasi.

---

---

## Fitur 7: Composite Risk Analyzer Dashboard (CRAD)

### Latar Belakang
Sistem monitoring yang ada menyajikan data sensor secara terpisah (grafik HR sendiri, grafik AQI sendiri) tanpa memberikan gambaran risiko holistik yang mudah dipahami pengguna atau tenaga kesehatan. Pengguna membutuhkan satu panel tunggal yang merangkum semua dimensi risiko secara bersamaan.

### Rumusan Fitur
Engine analisis multi-dimensi yang mengagregasi seluruh data sensor menjadi profil risiko visual dan numerik real-time:

**Dimensi Risiko yang Dianalisis:**
```
┌─────────────────────────────────────────────────────────────┐
│               COMPOSITE RISK ANALYZER                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ ENV RISK     │ CARDIAC RISK │ RESPIRATORY  │ THERMAL RISK   │
│ (PM, VOC,CO) │ (HR, HRV,   │ RISK         │ (Suhu+Lembab+  │
│              │  ECG anomaly)│ (SpO2, RR,   │  Heat Index)   │
│              │              │  breath rate)│                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                   TEPRS COMPOSITE SCORE                      │
│                   + TREND ANALYSIS                           │
│              (memburuk / stabil / membaik)                   │
├─────────────────────────────────────────────────────────────┤
│  HISTORICAL PATTERN │  TRIGGER LOG  │  RECOMMENDED ACTION   │
└─────────────────────────────────────────────────────────────┘
```

**Sub-fitur Risk Analyzer:**

1. **Trend Trajectory Analysis:** Mendeteksi apakah TEPRS sedang naik/turun dalam 15/30/60 menit terakhir — penting untuk early warning sebelum threshold kritis tercapai.

2. **Co-occurrence Risk Map:** Visualisasi kombinasi risiko yang terjadi bersamaan (contoh: UV tinggi + HR tinggi + SpO2 turun = heat stroke risk pattern).

3. **Risk Fingerprint:** Pola risiko unik per pengguna berdasarkan historis 30 hari — mendeteksi apakah kejadian saat ini adalah anomali atau pola berulang.

4. **Predictive Risk Window:** Model prediksi risiko 30–60 menit ke depan berbasis tren sensor saat ini (LSTM atau time-series forecasting ringan).

5. **Clinical Export Report:** Generate laporan PDF otomatis berisi ringkasan paparan lingkungan, anomali fisiologi, dan tindakan yang diambil — untuk dikonsultasikan ke dokter.

### Kaggle Datasets Relevan
- [Air Quality and Health Impact Dataset](https://www.kaggle.com/datasets/rabieelkharoua/air-quality-and-health-impact-dataset)
- [Urban Air Quality and Health Impact Analysis](https://www.kaggle.com/datasets/abdullah0a/urban-air-quality-and-health-impact-dataset)

---

## Fitur 8–11: Sport Science & Sport Technology Module (SSTM)

> Modul ini memperluas cakupan AERVINEX dari monitoring kesehatan umum ke domain **sport science** — khususnya untuk **pencegahan cedera** dan **optimasi performa atlet** berbasis data sensor real-time.

---

### Fitur 8: Athlete Injury Risk Index (AIRI)

### Latar Belakang Gap
Cedera olahraga menyebabkan kerugian besar bagi atlet dan tim. Sebagian besar sistem monitoring performa hanya melihat output (kecepatan, jarak) tanpa mempertimbangkan status fisiologis internal atlet. Overtraining dan kelelahan kumulatif adalah prediktor utama cedera yang selama ini tidak terdeteksi secara real-time.

### Rumusan Fitur
Sistem scoring real-time yang mengkuantifikasi risiko cedera akut dan kronis berbasis data wearable:

**Formula AIRI:**
```
AIRI = f(Training Load, Recovery Score, Neuromuscular Fatigue, Environmental Stress)
```

**Komponen Input:**
| Sinyal | Sumber | Kontribusi AIRI |
|--------|--------|----------------|
| Acute:Chronic Workload Ratio (ACWR) | HR + GPS + akselerometer | High (30%) |
| HRV Suppression dari baseline | PPG | High (25%) |
| Resting HR elevation | PPG (pagi hari) | Medium (15%) |
| Neuromuscular Load (impact g-force) | Accelerometer | Medium (15%) |
| Sleep Quality Score (malam sebelumnya) | Accelerometer + HR | Medium (10%) |
| Environmental Heat/Humidity Load | Sensor lingkungan | Low (5%) |

**Threshold AIRI:**
| Level | Nilai | Makna | Rekomendasi |
|-------|-------|-------|-------------|
| Safe | 0–0.5 | Risiko rendah | Lanjutkan program latihan |
| Caution | 0.5–0.75 | Risiko sedang | Kurangi intensitas 20% |
| High Risk | 0.75–0.9 | Risiko tinggi | Istirahat aktif, hindari high-impact |
| Danger | >0.9 | Risiko cedera akut | Stop latihan, konsultasi medis |

**Injury Pattern Recognition:**
- Deteksi pola ACWR > 1.5 (zona cedera klasik dalam sport science)
- Flagging saat penurunan HRV >20% dari baseline minggu ini
- Alert overtraining syndrome jika resting HR naik >7 bpm selama 3 hari berturut-turut

### Kaggle Datasets Relevan
- [Athlete Injury and Performance Dataset](https://www.kaggle.com/datasets/ziya07/athlete-injury-and-performance-dataset)
- [Injury Prediction for Competitive Runners](https://www.kaggle.com/datasets/shashwatwork/injury-prediction-for-competitive-runners)
- [Injury Prediction Dataset](https://www.kaggle.com/datasets/mrsimple07/injury-prediction-dataset)
- [Wearable Sports Health Monitoring Dataset](https://www.kaggle.com/datasets/ziya07/wearable-sports-health-monitoring-dataset)

---

### Fitur 9: Real-Time Performance Analytics Engine (RPAE)

### Latar Belakang Gap
Atlet membutuhkan umpan balik instan selama sesi latihan untuk mengoptimalkan intensitas dan mencegah under/overtraining. Sistem saat ini hanya memberikan data pasca-sesi (post-hoc analysis) tanpa panduan real-time selama olahraga berlangsung.

### Rumusan Fitur
Engine analitik yang berjalan real-time selama sesi latihan dan memberikan panduan berbasis zone:

**Training Zone System (berbasis HR dan HRV):**
```
Zone 1 — Recovery   : 50–60% HRmax  → Pemulihan aktif
Zone 2 — Aerobic    : 60–70% HRmax  → Pembakaran lemak, aerobic base
Zone 3 — Tempo      : 70–80% HRmax  → Lactate threshold training
Zone 4 — Threshold  : 80–90% HRmax  → Anaerobic threshold
Zone 5 — VO2max     : 90–100% HRmax → Kapasitas maksimal
```

**Metrik Real-Time yang Dipantau:**
- **HR Zone** dan durasi waktu di setiap zone
- **Estimasi VO2max** berbasis HR recovery (Firstbeat/Polar algorithm)
- **Lactate Threshold Estimation** via HRV deflection point
- **Cadence & Stride Efficiency** via accelerometer (untuk lari)
- **Power Output Estimation** via akselerometer + GPS (untuk bersepeda)
- **Anaerobic Reserve** — estimasi sisa kapasitas sebelum kelelahan
- **Real-time Caloric Expenditure** termasuk kontribusi lingkungan (panas meningkatkan kebutuhan kalori)

**Performance Score (0–100):**
Skor komposit pasca-sesi yang menggabungkan: efisiensi latihan, kepatuhan terhadap target zone, dan kondisi fisiologi selama sesi.

### Kaggle Datasets Relevan
- [Cycling VO2 Dataset](https://www.kaggle.com/datasets/andreazignoli/cycling-vo2)
- [Athlete Performance Prediction Dataset](https://www.kaggle.com/datasets/zadafiyabhrami/athlete-performance-prediction-dataset)
- [Cross-Sport Athlete Performance Dataset](https://www.kaggle.com/datasets/programmer3/cross-sport-athlete-performance-dataset)
- [Running and Heart Rate Data](https://www.kaggle.com/datasets/mcandocia/running-heart-rate-recovery)

---

### Fitur 10: Recovery & Readiness Score System (RRSS)

### Latar Belakang Gap
Pemulihan (recovery) adalah fase yang sama pentingnya dengan latihan itu sendiri, namun sering diabaikan karena kurangnya alat ukur objektif. Atlet sering berlatih dalam kondisi belum pulih sepenuhnya, yang meningkatkan risiko cedera dan menurunkan adaptasi latihan.

### Rumusan Fitur
Sistem yang mengukur status pemulihan atlet setiap pagi dan memberikan rekomendasi beban latihan hari itu:

**Daily Readiness Score (DRS) — Dihitung Setiap Pagi:**
```
DRS = w1×HRV_recovery + w2×RHR_status + w3×Sleep_score + w4×Env_quality
```

| Komponen | Pengukuran | Waktu |
|----------|-----------|-------|
| HRV Recovery | HRV pagi vs. baseline 7 hari | 5 menit setelah bangun |
| Resting HR Status | HR terendah selama tidur | Monitoring malam hari |
| Sleep Score | Durasi + kualitas tidur (movement analysis) | Malam |
| Environmental Quality | Kualitas udara & suhu saat akan latihan | Real-time |

**Output DRS:**
| DRS | Status | Rekomendasi Latihan |
|-----|--------|---------------------|
| 85–100 | Fully Recovered | Latihan intensitas penuh, boleh PR attempt |
| 70–84 | Well Recovered | Latihan normal sesuai program |
| 55–69 | Partially Recovered | Kurangi volume 25%, hindari interval |
| 40–54 | Under-recovered | Hanya Zone 1–2, atau istirahat aktif |
| <40 | Overreached | Istirahat penuh, protokol pemulihan |

**Integrated Recovery Recommendations:**
- Saran hidrasi berbasis paparan panas hari sebelumnya
- Saran window latihan optimal (waktu terbaik berdasarkan AQI + suhu)
- Nutrisi timing suggestion (berdasarkan sesi terakhir dan DRS)

### Kaggle Datasets Relevan
- [SWELL Heart Rate Variability (HRV) Dataset](https://www.kaggle.com/datasets/qiriro/swell-heart-rate-variability-hrv)
- [HRV Prediction Dataset](https://www.kaggle.com/datasets/saurabhshahane/hvr-prediction)
- [Wearable Sports Health Monitoring Dataset](https://www.kaggle.com/datasets/ziya07/wearable-sports-health-monitoring-dataset)

---

### Fitur 11: Environmental Performance Optimizer (EPO)

### Latar Belakang Gap
Kondisi lingkungan (panas, kelembaban, kualitas udara, UV) secara langsung mempengaruhi performa olahraga dan risiko kesehatan atlet. Namun tidak ada sistem yang secara otomatis menyesuaikan target latihan berdasarkan kondisi lingkungan saat itu, memaksa atlet atau pelatih untuk membuat penyesuaian manual yang sering tidak akurat.

### Rumusan Fitur
Sistem yang secara otomatis menyesuaikan target performa dan memberikan rekomendasi berbasis kondisi lingkungan real-time:

**Environmental Impact on Performance (EIP) Model:**
```
EIP_adjustment = f(Heat_Index, AQI, UV_Index, Altitude, Humidity)
```

**Tabel Penyesuaian Performa:**
| Kondisi Lingkungan | Penyesuaian Target Pace | Penyesuaian HR Target | Risiko |
|-------------------|------------------------|----------------------|--------|
| Suhu >30°C + Lembab >80% | Kurangi 8–12% | Turunkan zone 1 level | Heat stress |
| AQI 100–150 (Tidak Sehat) | Kurangi volume 30% | Pertahankan Zone 1–2 | Respiratory |
| AQI >150 (Sangat Tidak Sehat) | Batalkan outdoor, indoor only | Zone 1 max | Bahaya |
| UV Index >8 | Batasi durasi <45 menit outdoor | Normal | Sunstroke |
| Heat Index >40°C | Hentikan sesi | Emergency cool-down | Kritis |

**Smart Session Planning:**
- Rekomendasikan waktu sesi optimal dalam sehari berdasarkan prediksi AQI + suhu (API BMKG)
- Alert pre-session: "Kondisi hari ini tidak optimal untuk interval training. Saran: pindah ke zona 2 dan kurangi durasi 20%"
- Rute alternatif berbasis AQI (jika GPS aktif) — arahkan ke area dengan AQI lebih rendah

**Heat Acclimatization Tracker:**
- Memantau proses adaptasi tubuh terhadap panas selama 7–14 hari pertama di lingkungan panas
- Secara otomatis melonggarkan penyesuaian EIP seiring adaptasi fisiologis terbentuk

### Kaggle Datasets Relevan
- [Global Air Quality Dataset](https://www.kaggle.com/datasets/waqi786/global-air-quality-dataset)
- [PM2.5 Global Air Pollution Dataset](https://www.kaggle.com/datasets/kweinmeister/pm25-global-air-pollution-20102017)
- [Wearable Sports Health Monitoring Dataset](https://www.kaggle.com/datasets/ziya07/wearable-sports-health-monitoring-dataset)

---

## Ringkasan Matriks Novelty (Updated — 11 Fitur)

| # | Nama Fitur | Kode | Kategori | Gap Utama |
|---|-----------|------|----------|-----------|
| 1 | Dual-Layer Sensor Fusion Architecture | DLSFA | Core | Integrasi sensor env+fisio |
| 2 | Tiered Environment-Physiological Risk Score | TEPRS | Core | Scoring risiko gabungan |
| 3 | Automated Action Response Chain | AARC | Core | Closed-loop response |
| 4 | Tropical Urban Health Adaptation Module | TUHAM | Core | Konteks Asia/Indonesia |
| 5 | Adaptive Personal Risk Baseline | APRB | Core | Personalisasi threshold |
| 6 | Multi-Context Discriminator | MCD | Core | Reduksi false positive |
| 7 | Composite Risk Analyzer Dashboard | CRAD | Analytics | Visualisasi risiko holistik |
| 8 | Athlete Injury Risk Index | AIRI | Sport Science | Pencegahan cedera |
| 9 | Real-Time Performance Analytics Engine | RPAE | Sport Tech | Optimasi latihan real-time |
| 10 | Recovery & Readiness Score System | RRSS | Sport Science | Manajemen pemulihan |
| 11 | Environmental Performance Optimizer | EPO | Sport+Env | Adaptasi latihan vs. lingkungan |

---

## Rekomendasi Machine Learning untuk AERVINEX

### Jawaban: Ya, ML sangat cocok — dan berikut rekomendasi arsitektur modelnya

| Fitur | Algoritma ML yang Direkomendasikan | Dataset Latihan |
|-------|----------------------------------|----------------|
| TEPRS scoring | Gradient Boosting (XGBoost/LightGBM) | WESAD + Air Quality Health Impact |
| MCD (context discrimination) | Multi-class Random Forest | WESAD + Activity Recognition |
| AIRI (injury risk) | LSTM time-series + Random Forest | Athlete Injury Dataset + Injury Prediction |
| RPAE (VO2max estimation) | Regression (SVR / Ridge) | Cycling VO2 + Athlete Performance |
| RRSS (readiness score) | Ensemble (HRV + sleep features) | SWELL HRV + Sleep datasets |
| APRB (personal baseline) | Online learning / EWMA adaptive | On-device, no pretrained model |
| EPO (env adjustment) | Rule-based + regression | AQI datasets + Sports performance |
| ECG arrhythmia detection | 1D-CNN / Transformer | PhysioNet ECG datasets |

**Rekomendasi Deployment:**
- **On-device (smartwatch):** Model ringan (TFLite / ONNX) untuk MCD, APRB, zone detection
- **Edge/Mobile (smartphone):** TEPRS, AIRI, RRSS, RPAE
- **Cloud:** CRAD dashboard, federated learning aggregation, predictive risk window

---

## Kaggle Datasets Relevan untuk AERVINEX (Terorganisir)

### Kategori 1: Wearable Health Monitoring
| Dataset | URL | Fitur AERVINEX |
|---------|-----|-------------|
| Wearable Health Device Performance 2025 | [Link](https://www.kaggle.com/datasets/pratyushpuri/wearable-health-devices-performance-analysis) | DLSFA, TEPRS |
| Wearable Sports Health Monitoring | [Link](https://www.kaggle.com/datasets/ziya07/wearable-sports-health-monitoring-dataset) | AIRI, RPAE, RRSS |
| Apple Watch and Fitbit Data | [Link](https://www.kaggle.com/datasets/aleespinosa/apple-watch-and-fitbit-data) | DLSFA, APRB |
| Smartwatch Health Data | [Link](https://www.kaggle.com/datasets/mohammedarfathr/smartwatch-health-data-uncleaned) | TEPRS, MCD |

### Kategori 2: Stress & Physiological Response
| Dataset | URL | Fitur AERVINEX |
|---------|-----|-------------|
| WESAD — Wearable Stress & Affect Detection | [Link](https://www.kaggle.com/datasets/orvile/wesad-wearable-stress-affect-detection-dataset) | MCD, TEPRS, AIRI |
| SWELL HRV Dataset | [Link](https://www.kaggle.com/datasets/qiriro/swell-heart-rate-variability-hrv) | RRSS, AIRI |
| Nurse Stress Prediction Wearable Sensors | [Link](https://www.kaggle.com/datasets/priyankraval/nurse-stress-prediction-wearable-sensors) | MCD, TEPRS |
| Heart Rate Prediction for Stress | [Link](https://www.kaggle.com/datasets/vinayakshanawad/heart-rate-prediction-to-monitor-stress-level) | TEPRS, AIRI |

### Kategori 3: Environmental Quality
| Dataset | URL | Fitur AERVINEX |
|---------|-----|-------------|
| Air Quality & Health Impact | [Link](https://www.kaggle.com/datasets/rabieelkharoua/air-quality-and-health-impact-dataset) | DLSFA, TEPRS, CRAD |
| Urban Air Quality & Health Impact | [Link](https://www.kaggle.com/datasets/abdullah0a/urban-air-quality-and-health-impact-dataset) | TUHAM, EPO |
| PM2.5 Air Pollution Dataset | [Link](https://www.kaggle.com/datasets/ineubytes/pm25-airpolution-dataset) | TUHAM, EPO |
| Global Air Quality Dataset | [Link](https://www.kaggle.com/datasets/waqi786/global-air-quality-dataset) | TUHAM, EPO |

### Kategori 4: Sport Science & Injury Prevention
| Dataset | URL | Fitur AERVINEX |
|---------|-----|-------------|
| Athlete Injury & Performance Dataset | [Link](https://www.kaggle.com/datasets/ziya07/athlete-injury-and-performance-dataset) | AIRI |
| Injury Prediction for Competitive Runners | [Link](https://www.kaggle.com/datasets/shashwatwork/injury-prediction-for-competitive-runners) | AIRI |
| Injury Prediction Dataset | [Link](https://www.kaggle.com/datasets/mrsimple07/injury-prediction-dataset) | AIRI |
| Comprehensive Sports Sensor DB | [Link](https://www.kaggle.com/datasets/sujaykapadnis/comprehensive-sports-database) | RPAE, AIRI |

### Kategori 5: Athletic Performance & VO2max
| Dataset | URL | Fitur AERVINEX |
|---------|-----|-------------|
| Cycling VO2 Dataset | [Link](https://www.kaggle.com/datasets/andreazignoli/cycling-vo2) | RPAE |
| Athlete Performance Prediction | [Link](https://www.kaggle.com/datasets/zadafiyabhrami/athlete-performance-prediction-dataset) | RPAE, RRSS |
| Cross-Sport Athlete Performance | [Link](https://www.kaggle.com/datasets/programmer3/cross-sport-athlete-performance-dataset) | RPAE |
| Running and Heart Rate Recovery | [Link](https://www.kaggle.com/datasets/mcandocia/running-heart-rate-recovery) | RPAE, AIRI |
| HRV Prediction Dataset | [Link](https://www.kaggle.com/datasets/saurabhshahane/hvr-prediction) | RRSS, AIRI |

---

## Fitur 12: Explainable AI Module (XAI-M)

### Latar Belakang Gap
Salah satu hambatan terbesar adopsi AI dalam sistem kesehatan adalah **black-box problem** — pengguna dan tenaga kesehatan tidak tahu *mengapa* sistem memberikan suatu keputusan atau alert. Kepercayaan terhadap sistem AI kesehatan sangat bergantung pada transparansi dan interpretabilitas model.

### Rumusan Fitur
Lapisan XAI yang menjelaskan setiap keputusan sistem kepada pengguna dalam bahasa yang mudah dipahami:

**Tiga Level Penjelasan (sesuai audience):**

| Level | Target Pengguna | Format Penjelasan |
|-------|----------------|------------------|
| **L1 — Consumer** | Pengguna umum / atlet | Kalimat sederhana + ikon visual |
| **L2 — Trainer/Coach** | Pelatih / sports scientist | Grafik kontribusi fitur + trend |
| **L3 — Clinician** | Dokter / tenaga medis | Feature importance scores + confidence interval |

**Metode XAI yang Diimplementasikan:**

1. **SHAP (SHapley Additive exPlanations)**
   - Menghitung kontribusi tiap sensor/fitur terhadap skor TEPRS atau AIRI
   - Output L1: *"Alert ini dipicu terutama karena: PM2.5 tinggi (45%) + HR di atas normal (35%) + suhu ekstrem (20%)"*
   - Output L2/L3: SHAP waterfall chart, beeswarm plot

2. **LIME (Local Interpretable Model-agnostic Explanations)**
   - Penjelasan lokal per prediksi — cocok untuk menjelaskan kasus individual atlet
   - Output: *"Pada sesi latihan hari ini, AIRI meningkat karena ACWR Anda mencapai 1.6 (zona berbahaya)"*

3. **Counterfactual Explanation**
   - *"Jika kelembaban turun 15% atau Anda mengurangi intensitas latihan, skor risiko akan turun dari MERAH ke KUNING"*
   - Langsung terhubung ke AARC untuk memberikan rekomendasi konkret

4. **Feature Importance Dashboard (Real-Time)**
   - Menampilkan kontribusi sensor secara live di smartwatch (mini bar chart)
   - Memungkinkan pengguna memahami *faktor mana* yang paling berkontribusi pada kondisi mereka

**Contoh Output XAI pada Berbagai Skenario:**

```
[Skenario: Alert Level MERAH saat lari sore]

L1 (User): "⚠️ Risiko Tinggi Terdeteksi
  Faktor utama:
  🌫️ Kualitas udara buruk (PM2.5: 89 µg/m³) — 42%
  ❤️ Detak jantung terlalu tinggi untuk intensitas ini — 35%
  🌡️ Heat index: 41°C, berbahaya untuk olahraga — 23%
  → Saran: Hentikan latihan outdoor sekarang"

L3 (Dokter): SHAP Score: PM2.5=+0.42, HR_deviation=+0.35, HeatIndex=+0.23
  Confidence: 87% | Model: LightGBM TEPRS v2.1
  Baseline HR personal: 68 bpm | Observed: 142 bpm (+109%)
```

### Library / Tools
- `shap` (Python) — SHAP values computation
- `lime` (Python) — LIME explanations
- `plotly` / `matplotlib` — visualization
- Model-agnostic: bekerja dengan XGBoost, LightGBM, Random Forest, LSTM

### Kaggle Datasets Relevan
- [WESAD](https://www.kaggle.com/datasets/orvile/wesad-wearable-stress-affect-detection-dataset) — untuk demonstrasi SHAP pada stress detection
- [Athlete Injury Dataset](https://www.kaggle.com/datasets/ziya07/athlete-injury-and-performance-dataset) — untuk LIME pada AIRI

---

## Fitur 13: AI Recommendation Engine (AIRE)

### Latar Belakang Gap
Sistem monitoring menghasilkan data dan alert, tapi tidak memberikan **rekomendasi yang dipersonalisasi, kontekstual, dan dapat ditindaklanjuti** secara otomatis. Pengguna dibiarkan menginterpretasikan data sendiri tanpa panduan spesifik.

### Rumusan Fitur
Engine rekomendasi berbasis AI yang menghasilkan saran personal, adaptif, dan dapat ditindaklanjuti berdasarkan kombinasi seluruh sensor dan histori pengguna:

**Arsitektur AIRE:**

```
┌─────────────────────────────────────────────────────────────┐
│                    AI RECOMMENDATION ENGINE                  │
├─────────────────┬───────────────────┬───────────────────────┤
│  INPUT LAYER    │  REASONING LAYER  │   OUTPUT LAYER        │
│                 │                   │                       │
│ • TEPRS score   │ Rule-Based Engine │ • Immediate Action    │
│ • AIRI score    │ +                 │ • Short-term Plan     │
│ • RRSS / DRS    │ ML Recommendation │ • Long-term Guidance  │
│ • EPO data      │ (Collaborative    │ • Alert to Contacts   │
│ • User history  │  Filtering +      │ • Clinical Referral   │
│ • XAI reasons   │  Content-Based)   │   Trigger             │
│ • User prefs    │                   │                       │
└─────────────────┴───────────────────┴───────────────────────┘
```

**Tiga Jenis Rekomendasi:**

1. **Immediate Action Recommendation (real-time, <30 detik)**
   - Dipicu saat TEPRS Level ≥ 2 atau AIRI ≥ 0.75
   - Contoh: *"Segera pindah ke dalam ruangan. Rute alternatif: 200m ke arah barat (AQI lebih rendah)"*
   - Kontekstual: berbeda rekomendasi untuk pelari vs. pekerja outdoor vs. lansia

2. **Daily Training Recommendation (setiap pagi)**
   - Berdasarkan DRS + prediksi kondisi lingkungan hari ini (API BMKG)
   - Contoh: *"DRS Anda 72 (Well Recovered). AQI prediksi pagi ini: 45 (Baik). Waktu terbaik latihan: 06.00–07.30. Target: Zone 3 tempo run, 45 menit"*

3. **Adaptive Training Plan Adjustment (mingguan)**
   - Berdasarkan tren AIRI + performance data 7 hari terakhir
   - Contoh: *"AIRI Anda rata-rata 0.72 minggu ini (Caution Zone). Saran: kurangi volume total minggu depan 15%, tambah satu sesi recovery"*
   - Bisa diintegrasikan dengan platform training (Garmin Connect, Strava, TrainingPeaks API)

**ML Model untuk AIRE:**
- **Collaborative Filtering** — rekomendasi berdasarkan pola pengguna serupa (profil: umur, olahraga, kondisi kesehatan)
- **Reinforcement Learning (opsional)** — model belajar dari feedback pengguna (apakah rekomendasi diikuti dan hasilnya baik)
- **LLM-based Explanation** (opsional) — Natural language generation untuk output rekomendasi yang lebih natural (menggunakan Claude API / GPT-4o)

**LLM Integration (Opsional — Advanced):**
```python
# Contoh prompt ke LLM berdasarkan data sensor
prompt = f"""
Pengguna: Atlet lari, 24 tahun, target maraton
TEPRS saat ini: 68 (Level Oranye)
Faktor utama (XAI): PM2.5=52µg/m³, HR=158bpm (Zone 4), HeatIndex=38°C
AIRI: 0.71 (Caution)
DRS pagi: 78 (Well Recovered)

Berikan rekomendasi dalam 3 kalimat singkat untuk pengguna awam.
"""
```

### Kaggle Datasets Relevan
- [Wearable Sports Health Monitoring](https://www.kaggle.com/datasets/ziya07/wearable-sports-health-monitoring-dataset) — training data AIRE
- [Athlete Performance Prediction](https://www.kaggle.com/datasets/zadafiyabhrami/athlete-performance-prediction-dataset) — collaborative filtering

---

## Ringkasan Matriks Novelty (Final — 13 Fitur)

| # | Nama Fitur | Kode | Kategori | Komponen AI |
|---|-----------|------|----------|------------|
| 1 | Dual-Layer Sensor Fusion Architecture | DLSFA | Hardware/Core | Signal processing |
| 2 | Tiered Environment-Physiological Risk Score | TEPRS | Core Algorithm | Supervised ML (XGBoost) |
| 3 | Automated Action Response Chain | AARC | System | Rule-based + ML |
| 4 | Tropical Urban Health Adaptation Module | TUHAM | Regional | Calibration + API |
| 5 | Adaptive Personal Risk Baseline | APRB | Personalization | Online learning (EWMA) |
| 6 | Multi-Context Discriminator | MCD | Filter | Random Forest / SVM |
| 7 | Composite Risk Analyzer Dashboard | CRAD | Analytics | LSTM time-series |
| 8 | Athlete Injury Risk Index | AIRI | Sport Science | Gradient Boosting |
| 9 | Real-Time Performance Analytics Engine | RPAE | Sport Tech | Regression + zone model |
| 10 | Recovery & Readiness Score System | RRSS | Sport Science | Ensemble model |
| 11 | Environmental Performance Optimizer | EPO | Sport+Env | Rule-based + Regression |
| 12 | Explainable AI Module | **XAI-M** | Transparency | SHAP + LIME + Counterfactual |
| 13 | AI Recommendation Engine | **AIRE** | Intelligence | Collab Filter + RL + LLM |

---

## Posisi Novelty Utama (Updated)

> **AERVINEX v2.0** adalah **platform smartwatch pertama** yang menyatukan tiga domain dalam satu ekosistem terintegrasi:
>
> 1. **Environmental Health Monitoring** — deteksi real-time paparan lingkungan berbahaya (PM2.5, VOC, CO, UV, suhu)
> 2. **Clinical Risk Analysis** — TEPRS + CRAD untuk quantifikasi dan visualisasi risiko holistik
> 3. **Sport Science Intelligence** — AIRI + RPAE + RRSS + EPO untuk pencegahan cedera dan optimasi performa atlet dalam konteks lingkungan

---

*Dokumen ini dihasilkan berdasarkan SLR PRISMA terhadap 50 paper dari PubMed (diakses 4 Mei 2026).*
*Diperkaya dengan riset dataset Kaggle dan domain sport science/sport technology.*
*Versi: 2.0 | Proyek: AERVINEX | Status: Draft untuk Review*
