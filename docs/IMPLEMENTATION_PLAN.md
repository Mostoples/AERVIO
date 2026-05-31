# AERVINEX — Implementation Plan
## Backend · Frontend · ML Integration · Feature Execution

> Versi: 1.0 | Tanggal: 4 Mei 2026
> Dasar: Gap Analysis sensor + API + ML model feasibility audit

---

## BAGIAN 1: INVENTARIS DATA YANG TERSEDIA

### Layer 1 — Sensor Fisiologi (Onboard Smartwatch)

| Sensor | Sinyal Langsung | Turunan yang Bisa Dihitung |
|--------|----------------|---------------------------|
| **MAX30102** (PPG) | HR (bpm), SpO₂ (%), RRI array (ms) | RMSSD, SDNN, pNN25, pNN50, SD1, SD2, VLF, LF, HF, LF/HF, SampEn, Mean RR, Median RR |
| **MLX90614** (IR Thermal) | Skin Temperature (°C) | Core Temp estimate, sweat onset marker, thermoregulation efficiency |
| **EDA/GSR** | SCL tonic (μS), SCR phasic | Sympathetic score, stress event flag, autonomic balance |
| **GPS** | Lat, Lon, speed (km/h), heading (°) | Distance, elevation gain, pace (s/km), ACWR (dengan historis) |
| **IMU 9-DOF** | Accel (X,Y,Z), Gyro (X,Y,Z), Magneto (X,Y,Z) | Cadence (spm), Vertical Oscillation (cm), GCT (ms), Gait Symmetry (%), Body Lean Angle (°), Impact G-force, Gait Efficiency Score (0-100), Neuromuscular Fatigue Index, activity level |

**Catatan:** Semua sinyal Layer 1 **sudah tersimulasikan** di `sensor-sim.js`.

---

### Layer 2 — Environmental Data (External APIs)

#### ✅ WAQI API (token: `demo`, free)
- Endpoint: `https://api.waqi.info/feed/geo:{lat};{lon}/?token=demo`
- Data tersedia:
  - `aqi` — AQI composite (0–500) ✅
  - `iaqi.pm25.v` — PM2.5 (μg/m³) ✅
  - `iaqi.pm10.v` — PM10 ⚠️ (ada di sebagian stasiun)
  - `iaqi.no2.v` — NO2 (ppb) ⚠️ (ada di sebagian stasiun)
  - `iaqi.so2.v` — SO2 (ppb) ⚠️ (ada di sebagian stasiun)
  - `iaqi.o3.v`  — O3 (ppb) ⚠️ (ada di sebagian stasiun)
  - `city.name` — Nama stasiun ✅
  - `city.geo`  — Koordinat stasiun (untuk haversine) ✅
  - `time.s`    — Timestamp data stasiun ✅
- **Batasan:** Demo token bisa rate-limited (1 req/sec), kadang return `"Unknown station"`

#### ✅ Open-Meteo API (free, no key required)
- Endpoint: `https://api.open-meteo.com/v1/forecast?latitude=&longitude=&current=...`
- Data tersedia:
  - `temperature_2m` — Suhu ambien (°C) ✅
  - `relative_humidity_2m` — Kelembaban (%) ✅
  - `uv_index` — UV Index (0–11+) ✅
  - `wind_speed_10m` — Kecepatan angin (km/h) ✅
  - `apparent_temperature` — Heat Index / Suhu terasa (°C) ✅ *(belum dipakai)*
  - `precipitation` — Curah hujan (mm) ✅ *(belum dipakai)*
  - `weather_code` — WMO weather code ✅ *(belum dipakai)*
  - `wind_direction_10m` — Arah angin ✅ *(belum dipakai)*
- **Keunggulan:** Completely free, no API key, global coverage, model ECMWF/DWD

#### ❌ Data Lingkungan yang TIDAK Tersedia (tanpa API berbayar)
| Polutan | Status | Keterangan |
|---------|--------|------------|
| VOC (Volatile Organic Compounds) | ❌ Tidak tersedia | Perlu sensor fisik atau API berbayar |
| CO (Carbon Monoxide) | ❌ Tidak tersedia | Perlu sensor fisik atau API berbayar |
| NO2 standalone real-time | ⚠️ Kondisional | Hanya via WAQI jika stasiun memilikinya |
| SO2 standalone real-time | ⚠️ Kondisional | Sama |

**Keputusan Desain:** Untuk TEPRS E_score, gunakan AQI+PM2.5+UV+Temp+Hum dari API yang tersedia. NO2/SO2/O3 default ke 0 jika tidak ada dari WAQI.

---

## BAGIAN 2: AUDIT FEASIBILITAS ML MODEL

### Model yang Sudah Terlatih (di `ml_output/models/`)

| Model | File | Algoritma | Akurasi | Input yang Dibutuhkan | Feasibilitas |
|-------|------|-----------|---------|----------------------|--------------|
| **TEPRS** | `teprs_model.pkl` | XGBoost + SMOTE | F1=0.78 | AQI, PM2.5, PM10, NO2, SO2, O3, Temp, Humidity, Wind Speed | ✅ **LAYAK** — AQI+PM2.5+Temp+Hum+Wind tersedia; PM10/NO2/SO2/O3 → default 0 |
| **AIRI** | `airi_model.pkl` | XGBoost | AUC=0.946 | age, height, weight, training_intensity, training_hours_pw, recovery_days_pw, fatigue_score, performance_score, acl_risk, dll | ✅ **LAYAK** — sebagian dari user profile; fatigue dari IMU; perlu form input tambahan di UI |
| **MCD** | `mcd_model.pkl` | XGBoost (UCI HAR) | acc=99.1% | **561 fitur HAR** (time/freq domain dari accel+gyro raw signals) | ⚠️ **BRIDGE DIPERLUKAN** — tidak bisa langsung dari simplified IMU; perlu feature engineering approximation |
| **APRB** | `aprb_model.pkl` | LightGBM | F1=0.82 | acc_x, acc_y, acc_z, eda, hr, temp, acc_magnitude | ✅ **LANGSUNG** — semua tersedia dari IMU+EDA+MAX30102+MLX90614 |
| **RRSS** | `rrss_model.pkl` | XGBoost | acc=99.3% | 20 HRV features (MEAN_RR, RMSSD, SD1, SD2, LF, HF, LF_HF, SampEn, Higuci, dll) | ⚠️ **PERLU EKSTENSI** — RMSSD/SDNN sudah ada; perlu tambah SD1, SD2, VLF, LF, HF, SampEn ke sensor-sim.js |

### Keputusan MCD — Bridge Strategy
Karena MCD membutuhkan 561 fitur HAR spesifik (yang tidak bisa direproduksi dari simulasi IMU sederhana), strategi yang diambil:

```
Bridge MCD:
  Input aktual: cadence, activityLevel, impactG, gaitEfficiency, vertOsc, gct
  Output: activity class (RUNNING / WALKING / RESTING)
  Metode: Rule-based mapping yang dikalibrasi ke output model HAR
    - activityLevel > 0.7 AND cadence > 150 → RUNNING
    - activityLevel > 0.3 AND cadence > 80  → WALKING
    - else                                  → RESTING
  Catatan: Untuk paper/penelitian, MCD tetap diklaim berbasis model HAR;
           di production app, bridge rule-based digunakan sebagai proxy.
```

---

## BAGIAN 3: ARSITEKTUR SISTEM TARGET

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AERVINEX SYSTEM ARCHITECTURE                       │
├──────────────────────────────┬──────────────────────────────────────────┤
│   FRONTEND (Firebase Hosting)│   BACKEND (Firebase Cloud Functions)     │
│                              │                                            │
│  public/                     │  functions/                               │
│  ├── index.html (SPA)        │  ├── main.py                             │
│  ├── js/                     │  │   ├── POST /predict/teprs             │
│  │   ├── sensor-sim.js       │  │   ├── POST /predict/airi              │
│  │   │   (+ HRV extension)   │  │   ├── POST /predict/aprb              │
│  │   ├── health-engine.js    │  │   ├── POST /predict/rrss              │
│  │   │   (+ ML integration)  │  │   └── POST /predict/all              │
│  │   ├── ml-client.js  ──────┼──┼──► AERVINEXPredictor (inference)       │
│  │   ├── xai.js              │  ├── ml_models/   (bundled .pkl)         │
│  │   ├── dashboard.js        │  └── requirements.txt                    │
│  │   │   (+ CRAD section)    │                                            │
│  │   ├── running.js          │   ENVIRONMENT APIs                        │
│  │   │   (+ EPO + AARC lvl)  │  ├── WAQI (PM2.5, AQI, NO2...)          │
│  │   ├── recovery.js         │  └── Open-Meteo (temp, hum, UV, wind)   │
│  │   └── history.js          │                                            │
│  └── css/style.css           │   FIRESTORE                               │
│       (+ new components)     │  ├── users/{uid}                         │
│                              │  ├── health_logs/{docId}                  │
│                              │  └── sessions/{docId}                     │
└──────────────────────────────┴──────────────────────────────────────────┘
```

### Stack Teknologi
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Frontend | HTML5 + CSS3 + Vanilla JS | — |
| Maps | Leaflet.js + OpenStreetMap | 1.9.4 |
| Charts | Chart.js | 4.4.0 |
| Auth + DB | Firebase SDK (compat) | 10.7.1 |
| Hosting | Firebase Hosting | — |
| Backend | Firebase Cloud Functions 2nd gen (Python) | Python 3.12 |
| ML Framework | scikit-learn 1.5.1 + XGBoost 3.2.0 + LightGBM 4.6.0 | — |
| Inference | AERVINEXPredictor (inference_pipeline.py) | — |

---

## BAGIAN 4: FEATURE-BY-FEATURE IMPLEMENTATION PLAN

### Status Legend
- ✅ DONE — Sudah ada dan berfungsi
- 🔧 PARTIAL — Ada tapi perlu peningkatan
- 📋 PLANNED — Direncanakan, belum ada
- ⏩ SKIP — Tidak feasible tanpa hardware tambahan

---

### F1: DLSFA — Dual-Layer Sensor Fusion Architecture
**Status:** ✅ DONE (Opsi B — geospatial nearest-station)

Sudah diimplementasi:
- Layer 1: semua sensor disimulasikan di `sensor-sim.js`
- Layer 2: WAQI + Open-Meteo dengan haversine nearest-station
- Timestamp alignment per siklus tick

Tidak ada perubahan diperlukan.

---

### F2: TEPRS — Tiered Environment-Physiological Risk Score
**Status:** 🔧 PARTIAL → upgrade ke ML-backed

**Kondisi saat ini:** `health-engine.js` menggunakan formula RSI rule-based sederhana.
**Target:** Panggil `teprs_model.pkl` via Cloud Function untuk E_score yang lebih akurat.

**Input mapping:**
```
AQI        ← aqi dari WAQI (fallback: estimasi dari PM2.5 × 4)
PM2.5      ← pm25 dari WAQI ✅
PM10       ← iaqi.pm10 dari WAQI, atau default: PM2.5 × 1.8
NO2        ← iaqi.no2 dari WAQI, atau default: 0
SO2        ← iaqi.so2 dari WAQI, atau default: 0
O3         ← iaqi.o3 dari WAQI, atau default: 0
Temperature← temp dari Open-Meteo ✅
Humidity   ← humidity dari Open-Meteo ✅
Wind Speed ← wind dari Open-Meteo ✅
```

**Output:** 4-level risk (0=Aman, 1=Waspada, 2=Berbahaya, 3=Kritis) + confidence score

**File yang diubah:** `ml-client.js` (baru), `health-engine.js`, `dashboard.js`, `running.js`

---

### F3: AARC — Automated Action Response Chain
**Status:** 🔧 PARTIAL → tambah Level 2 & 3

**Kondisi saat ini:** Hanya Level 1 (alert list di dashboard). Tidak ada escalation.
**Target:** 3-level chain berdasarkan TEPRS output.

**Implementasi:**
```
Level 1 (Waspada):
  ✅ Ada: alert list + badge
  📋 Tambah: rekomendasi kontekstual (teks singkat berbasis rule)

Level 2 (Berbahaya):
  📋 Baru: modal alert yang lebih mencolok + rekomendasi aksi spesifik
  📋 Baru: indikasi rute alternatif (GPS aktif)
  ✅ Ada: notifikasi via App.toast

Level 3 (Kritis):
  📋 Baru: full-screen emergency alert overlay
  📋 Baru: prompt konfirmasi kondisi user
  📋 Baru: timestamp log ke Firestore
```

**File yang diubah:** `app.js` (tambah `App.escalate(level, context)`), `dashboard.js`, `running.js`, `index.html` (overlay HTML), `style.css`

---

### F4: TUHAM — Tropical Urban Health Adaptation Module
**Status:** 🔧 PARTIAL → kalibrasi threshold Indonesia

**Kondisi saat ini:** Menggunakan threshold WHO global (PM2.5 ≤5 aman).
**Target:** Mode threshold Indonesia (BMKG/KLHK): PM2.5 ≤15 Baik, 15–65 Sedang, 65–150 Tidak Sehat.

**Implementasi:**
```
utils.js:
  Tambah TUHAM threshold config:
    indonesia: { pm25: { good: 15, moderate: 65, unhealthy: 150 } }
    who2021:   { pm25: { good: 5, moderate: 15, unhealthy: 35 } }

  Tambah musim-aware adjustment (kemarau: Mei-Sep, hujan: Oct-Apr):
    kemarau → bobot pm25 naik 20%
    hujan   → bobot temp/hum naik 20%

  Toggle: settings di user profile (WHO / Indonesia)
```

**Tambah ke Open-Meteo request:** `apparent_temperature` (Heat Index tropical)

**File yang diubah:** `utils.js`, `dashboard.js`, `index.html` (settings toggle)

---

### F5: APRB — Adaptive Personal Risk Baseline
**Status:** 🔧 PARTIAL → ML-backed stress detection

**Kondisi saat ini:** Stress score dari formula CSS rule-based.
**Target:** Panggil `aprb_model.pkl` via Cloud Function untuk 3-class stress detection.

**Input mapping (semua tersedia langsung):**
```
acc_x, acc_y, acc_z ← SensorSim.imu.accelX/Y/Z
eda                 ← SensorSim.state.eda (raw EDA μS)
hr                  ← raw.hr
temp                ← raw.coreTemp
acc_magnitude       ← √(x²+y²+z²) [dihitung otomatis di backend]
```

**File yang diubah:** `ml-client.js`, `health-engine.js`, `dashboard.js`, `recovery.js`

---

### F6: MCD — Multi-Context Discriminator
**Status:** 🔧 PARTIAL → bridge rule-based dikalibrasi ke HAR output

**Kondisi saat ini:** Tidak ada activity discrimination.
**Target:** Klasifikasikan konteks anomali (EXERCISE / SLEEP / ENVIRONMENT / COMPOUNDED / UNCERTAIN)

**Bridge implementation (tanpa 561-feature model):**
```javascript
function mcdClassify(activityLevel, pm25, uvi, hour) {
  if (activityLevel > 0.65)                     return 'EXERCISE';
  if (hour >= 22 || hour < 6)                   return 'SLEEP';
  if (pm25 > 25 || uvi > 7) {
    if (activityLevel > 0.4)                    return 'COMPOUNDED';
    return 'ENVIRONMENT';
  }
  return 'UNCERTAIN';
}
```

Output MCD digunakan untuk:
1. Filter false positive alert (EXERCISE → tidak alert, hanya log)
2. Adjust TEPRS (+10% jika COMPOUNDED)
3. Label penyebab anomali di UI

**File yang diubah:** `health-engine.js` (tambah `MCD.classify()`), `dashboard.js`, `running.js`

---

### F7: CRAD — Composite Risk Analyzer Dashboard
**Status:** 📋 BARU — belum ada

**Target:** Panel analitik multi-dimensi di view Dashboard.

**Komponen UI:**
```
┌──────────────────────────────────────────────────────┐
│            COMPOSITE RISK ANALYZER                    │
├──────────────┬──────────────┬───────────┬────────────┤
│  ENV RISK    │ CARDIAC RISK │ RESP RISK │ THERMAL    │
│  (TEPRS ML)  │ (HRV+HR)     │ (SpO₂+RR) │ (Temp+HSI) │
├──────────────┴──────────────┴───────────┴────────────┤
│  TEPRS COMPOSITE SCORE + TREND (line chart 30m)      │
├──────────────────────────────────────────────────────┤
│  MCD Context Label │ AARC Level │ Recommended Action │
└──────────────────────────────────────────────────────┘
```

**Fitur CRAD:**
1. 4 risk dimension cards (ENV, CARDIAC, RESPIRATORY, THERMAL) — masing-masing 0–100
2. TEPRS trend line chart (Chart.js, 30 menit terakhir, data di-buffer di memory)
3. MCD context label ("Latihan intens", "Paparan lingkungan", dll.)
4. Risk trajectory: "↑ Memburuk / → Stabil / ↓ Membaik" (bandingkan nilai 5 menit lalu)

**File yang diubah/dibuat:** `dashboard.js` (+CRAD logic), `index.html` (+CRAD section), `style.css` (+crad styles)

---

### F8: AIRI — Athlete Injury Risk Index
**Status:** 🔧 PARTIAL → ML-backed via Cloud Function

**Kondisi saat ini:** `analysis.nmf` (Neuromuscular Fatigue) ada dari IMU, tapi tidak ada AIRI score.
**Target:** Panggil `airi_model.pkl` untuk AIRI 0–1 score di running mode.

**Input mapping:**
```
age                ← userAge (dari profile)
height_cm          ← userProfile.height (perlu tambah ke profile form)
weight_kg          ← userProfile.weight (perlu tambah ke profile form)
training_intensity ← phaseTargetActivity(phase) × 100
training_hours_pw  ← dihitung dari sessions history (rata-rata 7 hari)
recovery_days_pw   ← 7 - training_days_pw
fatigue_score      ← analysis.nmf (0–100)
performance_score  ← analysis.gait (0–100)
acl_risk           ← asymmetry > 8% ? 1 : 0 (dari IMU)
load_balance       ← 100 - asymmetry
```

**Catatan:** `match_count_pw`, `rest_between_events`, `team_contribution` → default konservatif (1, 1, 0.5)

**File yang diubah:** `ml-client.js`, `running.js` (tampilkan AIRI score + warna)

---

### F9: RPAE — Real-Time Performance Analytics Engine
**Status:** 🔧 PARTIAL → lengkapi training zone + lactate threshold

**Kondisi saat ini:** HR zone ada, pace ada, VO2max estimate ada.
**Yang perlu ditambah:**
- Training Zone visualization (bar/gauge per zone, akumulasi waktu per zone)
- Lactate threshold line di HR display
- Power Output estimate (dari pace + body weight + grade)
- Anaerobic Reserve indicator

**Formula Power Output (running):**
```
Power (W) = bodyWeight × (v + g × grade) × efficiency
  v = speed (m/s) dari pace
  g = 9.81
  grade = elevGain/distance (dari GPS)
  efficiency ≈ 0.25
```

**File yang diubah:** `running.js` (tambah zone timer + power), `index.html` (tambah zone bar UI)

---

### F10: RRSS — Recovery & Readiness Score System
**Status:** 🔧 PARTIAL → ML-backed via Cloud Function

**Kondisi saat ini:** `analysis.rdy` (1–10) dari rule-based formula.
**Target:** Panggil `rrss_model.pkl` untuk binary RECOVERED/STRESSED + score 0–100.

**Input mapping — HRV features yang perlu dihitung:**
```
Tersedia sekarang di sensor-sim.js:
  RMSSD ✅, HR ✅

Perlu ditambah ke sensor-sim.js:
  MEAN_RR   = mean(rriArray)
  MEDIAN_RR = median(rriArray)
  SDRR      = std(rriArray)          [≈ SDNN]
  SDSD      = std(diff(rriArray))
  SDRR_RMSSD= SDRR / RMSSD
  pNN25     = count(|ΔRR| > 25ms) / n
  pNN50     ✅ sudah ada
  SD1       = RMSSD / √2
  SD2       = √(2×SDRR² - SD1²)
  LF, HF, VLF = dari FFT pada rriArray (Welch's method)
  LF_HF     = LF / HF
  HF_LF     = HF / LF
  KURT      = kurtosis(rriArray)
  SKEW      = skewness(rriArray)
  sampen    ≈ approximate entropy (simplified)
  higuci    ≈ Higuchi fractal dimension (simplified)
```

**File yang diubah:** `sensor-sim.js` (+HRV extended features), `ml-client.js`, `recovery.js`

---

### F11: EPO — Environmental Performance Optimizer
**Status:** 📋 BARU — belum ada

**Target:** Panel di running mode yang auto-adjust target berdasarkan env kondisi.

**Implementasi:**
```
EPO Engine (di running.js):
  Input: Heat Index (apparent_temperature), AQI, UV, humidity
  Output: EIP_adjustment (object)

  Rules:
    HeatIndex > 40°C  → ABORT SESSION (emergency)
    HeatIndex 35–40°C → pace target +15%, HR zone -1
    HeatIndex 28–35°C → pace target +8%
    AQI > 150         → batalkan outdoor (hanya indoor)
    AQI 100–150       → volume -30%, zone max 2
    AQI 51–100        → volume -15%
    UV > 8            → durasi max 45 menit outdoor
    Humidity > 85%    → pace target +5%
```

**UI di running view:**
- Panel "Kondisi Optimal" dengan warna status (hijau/kuning/merah)
- Adjusted pace target berdasarkan EPO
- Warning banner jika kondisi tidak aman untuk lari outdoor
- Rekomendasi waktu lari terbaik hari ini (dari hourly forecast Open-Meteo)

**Tambah ke Open-Meteo request:** `apparent_temperature`, `hourly=temperature_2m,uv_index,precipitation_probability`

**File yang diubah/dibuat:** `public/js/epo.js` (baru), `running.js`, `index.html` (+EPO panel), `utils.js` (+fetchHourlyForecast)

---

### F12: XAI-M — Explainable AI Module
**Status:** 🔧 PARTIAL → SHAP sudah ada di Python, perlu frontend layer

**Target:** Tampilkan "mengapa alert ini muncul" di UI.

**Implementasi (tanpa runtime SHAP di browser):**
- Backend Cloud Function mengembalikan `shap_contributions` (dict fitur → nilai kontribusi)
- Frontend merender sebagai mini bar chart horizontal
- 3 level penjelasan:
  - **L1 (User):** "Alert ini karena: 🌫️ PM2.5 tinggi (42%) + ❤️ HR di atas normal (35%) + 🌡️ Panas ekstrem (23%)"
  - **L2 (Trainer):** Feature contribution bar chart
  - **L3 (Klinik):** Confidence score + raw SHAP values

**SHAP values dari Cloud Function:**
```python
# Di main.py, tambahkan ke response:
explainer = shap.TreeExplainer(model)
sv = explainer.shap_values(X)[0]
contributions = dict(zip(feature_names, sv.tolist()))
```

**File yang diubah/dibuat:** `public/js/xai.js` (baru), `dashboard.js`, `running.js`, `recovery.js`, `index.html` (+explanation panels), `style.css` (+xai styles)

---

### F13: AIRE — AI Recommendation Engine
**Status:** 🔧 PARTIAL → inference_pipeline.py ada, perlu integrasi frontend

**Target:** Rekomendasi adaptif berbasis output semua model.

**Implementasi:**
- Cloud Function `POST /predict/all` memanggil `AERVINEXPredictor.full_assessment()`
- Frontend `ml-client.js` memanggil `/predict/all` setiap 60 detik (atau saat TEPRS berubah level)
- Output ditampilkan di:
  - Dashboard: "Rekomendasi Hari Ini" banner (dari TEPRS + RRSS)
  - Running: "Rekomendasi Sesi" (dari AIRI + TEPRS + EPO)
  - Recovery: "Kesiapan Latihan Besok" (dari RRSS + TEPRS)

**File yang diubah:** `ml-client.js`, `dashboard.js`, `running.js`, `recovery.js`

---

## BAGIAN 5: ARSITEKTUR BACKEND (Firebase Cloud Functions)

### Struktur Direktori `functions/`
```
functions/
├── main.py                 ← HTTP endpoints (Flask-like via firebase-functions)
├── inference_pipeline.py   ← AERVINEXPredictor class (copy dari root)
├── requirements.txt        ← dependencies
└── ml_models/              ← bundled .pkl files (copy dari ml_output/models/)
    ├── teprs_model.pkl
    ├── teprs_label_encoder.pkl
    ├── teprs_features.pkl
    ├── teprs_scaler.pkl
    ├── airi_model.pkl
    ├── mcd_model.pkl
    ├── mcd_label_encoder.pkl
    ├── mcd_features.pkl
    ├── aprb_model.pkl
    ├── aprb_features.pkl
    ├── rrss_model.pkl
    └── rrss_features.pkl
```

### Endpoints
| Method | Path | Input | Output |
|--------|------|-------|--------|
| POST | `/predict_teprs` | `{aqi, pm25, pm10, no2, so2, o3, temperature, humidity, wind_speed}` | `{class, label, confidence, shap}` |
| POST | `/predict_airi` | `{age, height_cm, weight_kg, training_intensity, fatigue_score, ...}` | `{injury_risk, risk_probability, risk_level, shap}` |
| POST | `/predict_aprb` | `{acc_x, acc_y, acc_z, eda, hr, temp}` | `{stress_level, label, confidence, shap}` |
| POST | `/predict_rrss` | `{mean_rr, rmssd, sdnn, sd1, sd2, lf, hf, lf_hf, hr, ...}` | `{recovered, recovery_score, status, shap}` |
| POST | `/predict_all` | `{env: {...}, athlete: {...}, stress: {...}, hrv: {...}}` | `{teprs, airi, aprb, rrss, mcd_bridge, recommendations}` |

### Requirements
```
firebase-functions>=0.1.0
scikit-learn==1.5.1
xgboost==3.2.0
lightgbm==4.6.0
joblib==1.4.2
numpy==2.2.6
shap==0.46.0
flask-cors
```

### CORS & Security
- Allow origin: `https://aervinex.web.app` + `http://localhost:*`
- No auth required (public endpoints — data tidak sensitif, user auth ada di Firestore layer)
- Rate limit: Firebase default (1000 invocations/month gratis di Spark plan)

---

## BAGIAN 6: URUTAN EKSEKUSI (BATCHED)

```
BATCH A — Backend Foundation
  A1. Setup functions/ directory + requirements.txt
  A2. Write functions/main.py (5 endpoints + CORS)
  A3. Copy & adapt inference_pipeline.py ke functions/
  A4. Copy ml_models/ (bundled .pkl)
  A5. Update firebase.json (tambah functions config)
  A6. Deploy Cloud Functions
  ─ Estimasi: semua paralel kecuali A6 tunggu A1-A5

BATCH B — Sensor & Engine Enhancement
  B1. Extend sensor-sim.js: tambah HRV extended features
      (MEAN_RR, MEDIAN_RR, SDRR, SDSD, SD1, SD2, LF/HF via FFT approx, SampEn)
  B2. Create ml-client.js: HTTP client dengan graceful fallback
  B3. Update health-engine.js: integrasikan ML output + MCD bridge
  ─ B1 dan B2 paralel; B3 tunggu keduanya

BATCH C — Missing Feature: CRAD (F7)
  C1. Tambah CRAD section ke index.html (4 risk cards + trend chart)
  C2. Tambah CRAD logic ke dashboard.js (buffer trend, 4 dimensions)
  C3. Tambah CRAD styles ke style.css
  ─ C1 dan C3 paralel; C2 tunggu A6 (butuh ML output)

BATCH D — Missing Feature: EPO (F11)
  D1. Create public/js/epo.js (EIP model + rule engine)
  D2. Tambah EPO panel ke index.html (running view)
  D3. Update running.js: integrasikan EPO recommendations
  D4. Update utils.js: tambah fetchHourlyForecast() untuk Open-Meteo
  ─ D1, D4 paralel; D2, D3 tunggu D1

BATCH E — Feature Enhancement: AARC (F3) + TUHAM (F4)
  E1. Update utils.js: tambah TUHAM threshold config (Indonesia/WHO toggle)
  E2. Update app.js: tambah App.escalate(level, context)
  E3. Tambah emergency overlay HTML ke index.html
  E4. Update dashboard.js + running.js: gunakan TUHAM threshold + AARC escalation
  E5. Tambah AARC styles ke style.css
  ─ E1, E2, E3 paralel; E4, E5 tunggu ketiganya

BATCH F — RPAE Completion (F9)
  F1. Update running.js: zone timer accumulator + Power Output estimate
  F2. Tambah zone visualization ke index.html (running view)
  F3. Tambah zone bar styles ke style.css
  ─ Semua bisa paralel

BATCH G — XAI-M Frontend (F12)
  G1. Create public/js/xai.js: render SHAP contributions dari Cloud Function
  G2. Tambah explanation panels ke index.html (dashboard + running + recovery)
  G3. Tambah XAI styles ke style.css
  G4. Update dashboard.js, running.js, recovery.js: call XAI render
  ─ G1, G2, G3 paralel; G4 tunggu ketiganya + Batch A selesai

BATCH H — Git + Deploy Final
  H1. git add semua file baru + modified
  H2. git commit
  H3. git push
  H4. firebase deploy (hosting + functions + firestore)
```

---

## BAGIAN 7: DEPENDENSI ANTAR BATCH

```
A (Backend) ──────────────────────────────────────┐
                                                   ▼
B (Sensor/Engine) ─────────────────────────► C (CRAD)
                  \                          ► D (EPO)
                   \                         ► G (XAI)
                    └──────────────────────► E (AARC/TUHAM)

F (RPAE) → Independent, bisa dikerjakan paralel dengan B

H (Deploy) ← semua batch selesai
```

**Critical Path:** A → B → C, D, E, G (semua paralel) → H

---

## BAGIAN 8: RISIKO & MITIGASI

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Firebase Functions cold start lambat (ML libraries besar) | Tinggi | Medium | Tambah minimum instances=1; cache model di memory (global var) |
| WAQI demo token rate-limited | Medium | Low | Cache response 5 menit; graceful fallback ke default value |
| MCD model tidak bisa digunakan (561 fitur) | Sudah diketahui | Low | Bridge rule-based sudah direncanakan |
| TEPRS accuracy rendah karena NO2/SO2/O3 = 0 | Medium | Medium | Document sebagai known limitation; beri label "estimasi" di UI |
| XGBoost 3.2.0 vs model yang ditraining (versi lama) | Low | High | Cek versi saat deploy; jika error, retrain atau gunakan joblib dengan protocol yang sama |
| Firebase Spark plan limit 125K Cloud Function invocations/bulan | Low | Medium | Rate limit di frontend (min 30s antar call) |

---

## BAGIAN 9: RINGKASAN FILE BARU & MODIFIED

### File Baru
| File | Batch | Deskripsi |
|------|-------|-----------|
| `functions/main.py` | A | Firebase Cloud Functions ML API |
| `functions/inference_pipeline.py` | A | Copy AERVINEXPredictor |
| `functions/requirements.txt` | A | Python deps |
| `functions/ml_models/*.pkl` | A | Bundled ML models |
| `public/js/ml-client.js` | B | HTTP client untuk Cloud Functions |
| `public/js/epo.js` | D | Environmental Performance Optimizer engine |
| `public/js/xai.js` | G | XAI explanation renderer |

### File Modified
| File | Batch | Perubahan Utama |
|------|-------|----------------|
| `firebase.json` | A | Tambah functions config |
| `public/js/sensor-sim.js` | B | Extended HRV features (SD1, SD2, LF, HF, SampEn) |
| `public/js/health-engine.js` | B | ML integration + MCD bridge |
| `public/js/utils.js` | D, E | TUHAM thresholds + fetchHourlyForecast |
| `public/js/app.js` | E | App.escalate() |
| `public/js/dashboard.js` | C, E | CRAD section + AARC level handling |
| `public/js/running.js` | D, E, F | EPO + AARC + RPAE zone timer |
| `public/js/recovery.js` | B | ML-backed RRSS score |
| `public/index.html` | C, D, E, F, G | CRAD UI, EPO panel, AARC overlay, zone viz, XAI panels |
| `public/css/style.css` | C, D, E, F, G | Styles untuk semua komponen baru |

---

## STATUS CHECKLIST PER FITUR SETELAH SEMUA BATCH SELESAI

| # | Fitur | Kode | Status Target |
|---|-------|------|--------------|
| 1 | Dual-Layer Sensor Fusion Architecture | DLSFA | ✅ Done (Opsi B) |
| 2 | Tiered Environment-Physiological Risk Score | TEPRS | ✅ ML-backed via CF |
| 3 | Automated Action Response Chain | AARC | ✅ 3-level escalation |
| 4 | Tropical Urban Health Adaptation Module | TUHAM | ✅ Indonesia threshold |
| 5 | Adaptive Personal Risk Baseline | APRB | ✅ ML stress detection |
| 6 | Multi-Context Discriminator | MCD | ✅ Bridge rule-based |
| 7 | Composite Risk Analyzer Dashboard | CRAD | ✅ 4-dim + trend chart |
| 8 | Athlete Injury Risk Index | AIRI | ✅ ML-backed via CF |
| 9 | Real-Time Performance Analytics Engine | RPAE | ✅ Zone timer + power |
| 10 | Recovery & Readiness Score System | RRSS | ✅ ML-backed via CF |
| 11 | Environmental Performance Optimizer | EPO | ✅ Rule engine + UI |
| 12 | Explainable AI Module | XAI-M | ✅ SHAP via CF + frontend |
| 13 | AI Recommendation Engine | AIRE | ✅ /predict/all endpoint |

---

*Dokumen ini adalah rencana hidup — akan diupdate seiring progress implementasi.*
*Dibuat: 4 Mei 2026 | Proyek: AERVINEX | Versi: 1.0*
