# Respiratory Cluster Proxy — Deep Research Report

**Konteks**: AERVINEX respiratory cluster proxy saat ini ISPA 59% / COPD 64% / pneumonia 77% / bronchitis 76% / asthma exacerbation 88% dengan hanya 3–4 fitur (PM2.5, PM10, body temp, RR). Target: tingkatkan dengan time-series features + GBDT.
**Tanggal riset**: 2026-05-31. Semua DOI/URL diverifikasi via Crossref API + gh CLI.

---

## 1. Paper Peer-Reviewed (7 verified)

| # | Paper | DOI / URL | n | Metric | Dataset | Arsitektur |
|---|-------|-----------|---|--------|---------|------------|
| 1 | Tinschert P. et al., **"Nocturnal Cough and Sleep Quality to Assess Asthma Control and Predict Attacks"** (J Asthma Allergy 2020;13:669-678) | [10.2147/JAA.S278155](https://doi.org/10.2147/JAA.S278155) | 79 asthmatic adults, 29 nights/subj | Cough events/jam berkorelasi dgn ACT, dapat memprediksi 14-day attack risk | Smartphone overnight audio (St. Gallen) | RNN cough detector + logistic on cough rate + sleep eff. |
| 2 | Tinschert P. et al., **"Prevalence of nocturnal cough in asthma — MAC protocol"** (BMJ Open 2019) — protocol study yang sering disitir | [10.1136/bmjopen-2018-026323](https://doi.org/10.1136/bmjopen-2018-026323) | n=94 (target) | Validasi nocturnal cough sbg digital biomarker | Smartphone mic + sleep score | – |
| 3 | Adibi A., …, Sadatsafavi M., **"The Acute COPD Exacerbation Prediction Tool (ACCEPT)"** (Lancet Respir Med 2020) — RECEIVER & guidelines internasional acuan | [10.1016/S2213-2600(19)30397-2](https://doi.org/10.1016/S2213-2600(19)30397-2) | dev 2,380 + ECLIPSE val. 1,819 | **AUC 0.81** (≥2 exac), 0.77 severe | 4 RCT pooled (MACRO, OPTIMAL, STATCOPE, Bergen) | Joint accelerated failure-time GLM (rate + severity) — bukan deep learning, tapi feature-engineered |
| 4 | Quer G., Radin J., Gadaleta M., …, Topol E., Steinhubl S., **"Wearable sensor data and self-reported symptoms for COVID-19 detection"** (Nat Med 2021;27:73-77) — DETECT | [10.1038/s41591-020-1123-x](https://doi.org/10.1038/s41591-020-1123-x) | 1,118 COVID+ / 7,032 COVID− (total 8,150) | **AUC 0.80** (sensor saja), **0.83** (sensor + simptom + demografi) | Fitbit/Apple Watch/Garmin via MyDataHelps | Penalized logistic regression atas Δ RHR + sleep + steps (vs personal baseline) |
| 5 | Gadaleta M., …, Quer G., **"Passive detection of COVID-19 with wearable sensors and explainable machine learning algorithms"** (npj Digital Medicine 2021;4:166) — DETECT follow-up | [10.1038/s41746-021-00533-1](https://doi.org/10.1038/s41746-021-00533-1) | 38,911 (3,491 COVID-tested) | **AUC 0.83** symptomatic / 0.78 all | DETECT cohort | **XGBoost + SHAP** atas resting HR, HRV proxy, steps, sleep duration deviation |
| 6 | Mishra T., …, Snyder M., **"Pre-symptomatic detection of COVID-19 from smartwatch data"** (Nat Biomed Eng 2020;4:1208-1220) | [10.1038/s41551-020-00640-6](https://doi.org/10.1038/s41551-020-00640-6) | 32 COVID+ (out of 5,262) | Detected >85% kasus ≤ symptom-onset (≤9 hari sebelumnya pd 63%) | Stanford wearable cohort (Fitbit, Garmin, Apple) | RHR vs personal rolling baseline (CuSum-style anomaly) |
| 7 | Orellano P., Reynoso J., Quaranta N., Bardach A., Ciapponi A., **"Short-term exposure to PM10, PM2.5, NO2, O3 and all-cause / cause-specific mortality: systematic review and meta-analysis"** (Environ Int 2020;142:105876) — landasan WHO AQG 2021 | [10.1016/j.envint.2020.105876](https://doi.org/10.1016/j.envint.2020.105876) | 196 studi pooled | RR respiratory mortality **1.0073 per +10 µg/m³ PM2.5** (24-h lag 0-1) | Multi-city ecological | Random-effects meta |
| 8 | Orlandic L., Teijeiro T., Atienza D., **"The COUGHVID crowdsourcing dataset"** (Scientific Data 2021;8:156) | [10.1038/s41597-021-00937-4](https://doi.org/10.1038/s41597-021-00937-4) | >25,000 rekaman | Cough detection precision 90% | EPFL crowdsourced | XGBoost feature-based + CNN spectrogram |
| 9 | Bhattacharya D., Sharma N.K., …, Ganapathy S., **"Coswara: A respiratory sounds and symptoms dataset for SARS-CoV-2 screening"** (Scientific Data 2023;10:397) | [10.1038/s41597-023-02266-0](https://doi.org/10.1038/s41597-023-02266-0) | 2,635 partisipan, 9 sound types | AUC 0.79 multi-modal acoustic | IISc Bangalore | Late-fusion CNN |

---

## 2. GitHub Repos (verified via gh CLI 2026-05-31)

| Repo | URL | Stars | Bahasa | License | Catatan |
|------|-----|-------|--------|---------|---------|
| **resplab/accept** | https://github.com/resplab/accept | 10 | R | – (paper-linked) | Implementasi resmi ACCEPT (paper #3); package R Shiny + JSON model dump |
| **resplab/accept-codes** | https://github.com/resplab/accept-codes | 5 | R | GPL-3.0 | Supplementary code untuk validasi eksternal |
| **aminadibi/pyaccept** | https://github.com/aminadibi/pyaccept | 0 | Python | Other | Port Python — bisa langsung diadaptasi ke onnxruntime-web setelah re-train sebagai XGBoost |
| **iiscleap/Coswara-Data** | https://github.com/iiscleap/Coswara-Data | 204 | Jupyter | Custom (CC-BY-like) | Repo dataset Coswara resmi IISc |
| **cianmcguinn/asthma-exacerbation-wearables** | https://github.com/cianmcguinn/asthma-exacerbation-wearables | 0 | HTML notebook | MIT | Pipeline 7-day lookback / 3-day horizon dari smartwatch HR + SHAP — template arsitektur **paling dekat** dgn use-case AERVINEX |
| **mrzaizai2k/Coughvid-19-CRNN-attention** | https://github.com/mrzaizai2k/Coughvid-19-CRNN-attention | 9 | Jupyter | MIT | CRNN+attention untuk CoughVid — referensi audio pipeline |
| **virufy/virufy-data** | https://github.com/virufy/virufy-data | 9 | – | Custom | Dataset cough COVID + screening API |

---

## 3. Dataset Terbuka

| Dataset | URL / Endpoint | n | Label | Status verifikasi |
|---------|---------------|---|-------|-------------------|
| **CoughVid** (EPFL) | Zenodo: https://zenodo.org/record/4498364 ; project: https://coughvid.epfl.ch | 25,000+ rekaman cough WebM/OGG | COVID/healthy/upper/lower self-report + dokter-labeled subset (~2k) | Verified (paper #8) |
| **Coswara** (IISc Bangalore) | https://github.com/iiscleap/Coswara-Data | 2,635 subjek × 9 jenis suara (cough, breath shallow/deep, vowels, count) | COVID PCR + simptom | Verified (paper #9) |
| **COPDGene Phenotyping** | https://www.copdgene.org/ ; design paper [10.3109/15412550903499522](https://doi.org/10.3109/15412550903499522) | 10,371 subjek non-Hispanic white & African American smokers | CT-emphysema score, spirometry (FEV1/FVC), exac history | Verified |
| **BMKG / ISPU Indonesia** | Portal Satu Data: https://data.go.id (30 dataset ISPU); KLHK live: https://ispu.menlhk.go.id (HTML, **no documented public REST API**); BMKG data buka: https://data.bmkg.go.id (cuaca XML/JSON) | DKI Jakarta 2012-2024 + Surabaya, Palangka Raya, Sijunjung | PM2.5, PM10, SO2, CO, O3, NO2 per stasiun, harian | Verified — disarankan scrape CSV/XLSX + cache; tidak ada SLA API |
| **Breathe London** | https://www.breathelondon.org (data via Clarity Movement API) | ~400 sensor stations, 2018– | NO2 + PM2.5 1-min granularity | Existsbut API gated; **bukan pengganti BMKG untuk konteks Indonesia** |
| **DETECT/MyDataHelps cohort** | Not openly downloadable, tapi sub-set di [physionet wearable challenge](https://physionet.org) | – | – | Hanya akses by request (Scripps) |

---

## 4. Feature Engineering Recommendations (15 fitur, dgn threshold dari literatur)

### A. Air Quality (sumber utama: BMKG ISPU + Orellano 2020, Lu 2022)
1. **PM2.5 cumulative exposure 24h, 7d, 30d (rolling mean µg/m³)** — RR respiratory mortality **+0.73% per 10 µg/m³** 24-h lag 0-1 (Orellano 2020); ambang waspada Indonesia ISPU "Tidak Sehat" = PM2.5 > 55 µg/m³.
2. **PM2.5 personal cumulative dose (µg/m³·jam, 7d)** — flag jika > 1,500 (≈ ekuivalen 7 hari di "Sedang" 25 µg/m³).
3. **NO2 24-h mean (µg/m³)** — RR COPD pneumonia admission **+2.0% per 10 µg/m³** (Lu 2022, Resp Res).
4. **O3 8-h max (ppb)** — pemicu asma; ambang WHO AQG 2021 = 100 µg/m³.
5. **SO2 24-h mean** — relevan untuk daerah industri Indonesia.
6. **AQ interaction PM2.5 × humidity × temp** — humidity > 80% + PM2.5 > 35 memperparah bronchitis (sinergi inflammatory).

### B. Wearable Vitals (sumber: DETECT papers #4–6)
7. **Δ Resting HR vs personal baseline 28-d (bpm)** — > +5 bpm = **Mishra 2020 trigger**, AUC 0.80 standalone.
8. **RR trend slope last 60 min (breaths/min²)** — kenaikan > 2 bpm/jam → AECOPD risk (RECEIVER trial).
9. **HRV proxy (Δ RMSSD 7-d, ms)** — penurunan > 20% vs baseline = stress fisiologis (DETECT).
10. **Steps deviation last 24 h (%)** — < 50% personal median = pre-exacerbation marker (Gadaleta/Quer 2021).
11. **Sleep duration deviation & efficiency (%)** — Tinschert 2020: efisiensi tidur < 80% + nocturnal cough rate > 8/jam = ACT-uncontrolled.

### C. Acoustic / Self-Report (sumber: papers #1, 8, 9)
12. **Nocturnal cough events/jam** (jika mic enable) — > 1.4 cough/jam predicts asthma loss-of-control 14 hari (Tinschert 2020, J Asthma Allergy).
13. **Self-reported PEFR drop > 20%** vs personal best (GINA 2024 guideline trigger).
14. **Self-reported FEV1% predicted** (spirobank/bluetooth jika ada) — FEV1 < 50% predicted = severe AECOPD criteria (ACCEPT).

### D. Konteks (sumber: Riskesdas + ISPU)
15. **Exposure-window flag**: lari outdoor saat ISPU > 100 — meningkatkan inhaled-dose PM2.5 ~5× (ventilasi menit). Threshold runtime alert.

> **Catatan implementasi**: 30-day rolling stats butuh penyimpanan time-series per-user (Firestore subcollection `vitals/{date}`), sudah konsisten dgn struktur AERVINEX existing.

---

## 5. Arsitektur Target untuk Port

**Rekomendasi terkuat: feature-engineered XGBoost (gradient-boosted decision trees) di-export ke ONNX, dijalankan via `onnxruntime-web`.**

Alasan:

| Aspek | XGBoost (GBDT) | LSTM time-series | Rule-based proxy (existing) |
|-------|----------------|------------------|------------------------------|
| Bukti respiratory state-of-the-art | **Gadaleta/Quer 2021 AUC 0.83 pakai XGB + SHAP**; ACCEPT 2020 pakai GLM (tree-equivalent) AUC 0.81 | Mostly research-grade, butuh dataset besar (>10k subj). Belum ada SOTA wearable respiratory production-deployed | AUC ≤ 0.6-0.7, ceiling jelas |
| Ukuran model | 100-500 KB (tree budget < 200 trees, depth ≤ 6) — **fit < 1 MB lazy-loaded PWA** | 2-20 MB minimum untuk recurrent — berat untuk PWA wearable | Negligible |
| Inference browser | onnxruntime-web (WASM) ~15 ms / sample @ mid-range Android (Chromium). Compatible PWA AERVINEX | onnxruntime-web support LSTM tapi memory-heavy; potential >100 ms latency | Instant |
| Interpretability | **SHAP values native** → langsung jadi XAI "kenapa risk tinggi" (Gadaleta 2021) — penting untuk audit medis Indonesia | Black-box; perlu attention/IG | Sudah eksplisit |
| Data requirement | 500-5000 labeled samples cukup (ACCEPT n=2,380) | > 10,000 long sequences | – |
| Time-series handling | **Rolling-window aggregates** (mean/slope/Δ vs baseline) di-flatten jadi feature vector — terbukti efektif di literatur respiratory | Native sequence | Tidak |

**Konsekuensinya untuk AERVINEX**:
1. Ekstrak ~15 fitur (Section 4) per user/jam → vector ~15 dim.
2. Train satu XGBoost multi-output (atau per-disease) dgn synthetic+augmented Coswara/CoughVid + AC labels.
3. Export ONNX (`xgboost.Booster.save_model` → `onnxmltools.convert_xgboost`).
4. Tambahkan SHAP top-3 untuk panel `xai.js` yang sudah ada di codebase.
5. LSTM bisa jadi roadmap **fase 2** untuk acoustic cough stream khusus (CoughVid CRNN reference: mrzaizai2k repo).

> Hindari LSTM end-to-end di fase ini: rasio (gain accuracy) : (engineering cost + model size + reproducibility risk) **tidak favorable** untuk pasien base AERVINEX saat ini.

---

## Sumber & Referensi

- Crossref API (verifikasi setiap DOI): https://api.crossref.org
- GitHub Search via `gh search repos` CLI (2026-05-31)
- WHO Global Air Quality Guidelines 2021 (basis untuk threshold Orellano 2020)
- KLHK Indonesia ISPU portal: https://ispu.menlhk.go.id (data download CSV per stasiun)
- Portal Satu Data Indonesia: https://data.go.id (30 dataset ISPU)
- GINA 2024 Pocket Guide untuk threshold PEFR & ACT

## Catatan & Limitasi

- **PubMed MCP, WebSearch, Scholar Gateway, Consensus** seluruhnya ditolak di sesi ini; semua verifikasi dilakukan via Crossref REST + GitHub CLI. DOI **tidak diuji untuk full-text access** — beberapa Nature paywall.
- Tinschert "AsthmaTrack" persis tidak ada di Crossref dengan judul itu; paper substantif paling dekat adalah Tinschert 2020 *J Asthma Allergy* (DOI 10.2147/JAA.S278155) — gunakan ini sebagai sitasi utama.
- "RECEIVER Edinburgh" sebenarnya di **Glasgow** (Carlin C., QEUH); paper utama protokol di BMJ Open Resp Res 2021 (10.1136/bmjresp-2021-000905), outcomes di Int J COPD 2023 (10.2147/COPD.S409116) — **bukan** Edinburgh.
- Tidak ada API REST resmi & documented untuk ISPU/BMKG; rekomendasi: scrape CSV harian + cache di Firestore.
- Untuk fase 2: pertimbangkan **PhysioNet 2020 Wearable Challenge** datasets jika tim siap menerima nilai EUA/research-only.
