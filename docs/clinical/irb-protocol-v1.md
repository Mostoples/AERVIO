# IRB Protocol — AERVINEX Wearable Health Monitoring Validation Study

**Version**: 1.0 (Draft for IRB submission)
**Sponsor**: AERVINEX Research (Mostoples / Universitas)
**Principal Investigator**: TBD (target: pembimbing skripsi + 1 dokter spesialis kardiologi/respirologi)
**Format**: ICH-GCP E6(R2) — adapted for digital health wearables
**Last Updated**: 2026-05-31

---

## 1. Study Title
**AERVINEX Wearable Health Monitoring: A Validation Study of Sensor-Driven Risk Detection in Tropical Urban Populations**

Short title: *AERVINEX-VAL Phase 1*

---

## 2. Background & Rationale

### 2.1 Public Health Burden
Indonesia faces rising burden from environment-induced health conditions:
- Air pollution (PM2.5 melebihi WHO guideline 5x lipat di kota besar)
- Heat exposure (Heat Index sering > 35°C apparent)
- Cardiovascular mortality #1 (SKI 2018)
- ISPA #1 penyebab rawat jalan (Riskesdas)

Wearable continuous monitoring berpotensi memberi early warning — tapi mayoritas device
divalidasi di populasi Kaukasian (Apple Watch, Fitbit, Garmin) dan belum ada cohort
validation untuk populasi Asia Tenggara dengan exposure khas (motor commuter, outdoor
labor, kawasan industri).

### 2.2 AERVINEX Solution
AERVINEX adalah sistem wearable closed-loop dengan:
- PPG (HR, HRV, SpO₂), skin temperature, UV index, particulate matter (onboard SDS011)
- Geospatial fusion dengan stasiun BMKG / IQAir nearest-station (DLSFA)
- 13 fitur novelty (TEPRS, AARC, TUHAM, APRB, MCD, CRAD, AIRI, RPAE, RRSS, EPO, XAI-M, AIRE)
- ML model: XGBoost (TEPRS, RRSS) + LightGBM (MCD, APRB) — accuracy ~86% di synthetic data
- 35 health conditions classified
- 33 verified peer-reviewed references

### 2.3 Validation Gap
Internal accuracy 86% adalah metrik dataset (synthetic + transfer learning). Belum ada
validasi vs gold-standard clinical reference. Studi ini adalah Phase 1 pilot validation.

---

## 3. Objectives

### 3.1 Primary Objective
Mengukur sensitivity, specificity, PPV, NPV, dan F1-score AERVINEX AFib screening module
dibandingkan terhadap **12-lead ECG diagnosis (gold standard)** pada partisipan
risiko-tinggi (usia > 45 tahun, hipertensi, atau riwayat keluarga AFib).

### 3.2 Secondary Objectives
- (a) Validasi respiratory cluster (asma + ISPA + COPD) AERVINEX vs **spirometry FEV1/FVC** + chest auskultasi dokter.
- (b) Validasi TEPRS environmental score vs **subjective heat strain index (Borg scale + symptom diary)**.
- (c) Mengukur false-positive rate alert critical pada populasi sehat.
- (d) Mengukur user acceptance (System Usability Scale SUS, NPS).
- (e) Energy harvesting yield (thermoelectric + biofuel cell) dalam kondisi nyata.

### 3.3 Exploratory
- (a) Drift sensor optical setelah 90 hari pemakaian harian.
- (b) Korelasi antara skor AERVINEX dan kunjungan UGD dalam 90 hari follow-up.

---

## 4. Study Design

**Type**: Prospective observational cohort, single-arm, multi-site.
**Setting**: Jakarta (2 site) + Surabaya (1 site).
**Blinding**: Tidak dapat di-blind (wearable visible). Clinician evaluator di-blind terhadap data AERVINEX.
**Duration per subject**: 90 hari wearable + 3 hari intensif visit (D0, D45, D90).

---

## 5. Sample Size Justification

**Primary endpoint**: AFib detection sensitivity vs 12-lead ECG.
- Expected sensitivity AERVINEX: 80% (literature wearable AFib: 70–95%)
- Target precision: ±7% (95% CI)
- Formula Buderer: n = (Z²·Se·(1−Se)) / (d²·prevalence)
- Prevalence AFib di cohort risiko-tinggi: ~3% (estimate Indonesia umur >45)
- n hitung ≈ 290 → bulatkan ke **n = 300**
- 10% drop-out buffer sudah included.

**Stratifikasi**:
- Cohort A — Jakarta marathon community (n=100): aktif, usia 25-50
- Cohort B — Surabaya komuter motor (n=100): exposure tinggi, usia 25-50
- Cohort C — Cardiac risk umum (n=100): usia > 45, riwayat hipertensi/keluarga AFib

---

## 6. Inclusion / Exclusion Criteria

### Inclusion
- Usia 18–70 tahun.
- Mampu memberikan informed consent (atau diwakili wali sah).
- WhatsApp / smartphone Android (Chrome / Edge) atau iPhone (untuk Phase 2 testing).
- Mau memakai AERVINEX 90 hari berturut-turut (≥ 16 jam/hari).
- Bersedia kunjungan klinik D0, D45, D90.

### Exclusion
- Implantable cardiac device (pacemaker, ICD) — interferes with PPG.
- Kehamilan trimester 3 (kontraindikasi some sensors).
- Penyakit kulit aktif di pergelangan tangan.
- Sedang dalam pengobatan antiaritmia (mengaburkan validasi AFib).
- Diagnosa kanker stadium IV atau kondisi terminal.
- Sedang ikut clinical trial lain.

---

## 7. Recruitment Plan

### Channels
1. **Jakarta marathon community** — kerja sama Race Indonesia / Jakarta Marathon organizer; rekrut saat race expo.
2. **Surabaya komuter motor cohort** — kerja sama Gojek / komunitas ojol; rekrut di pos mangkal.
3. **Cardiac risk** — kerja sama RSCM / RSPI Sulianti Saroso / RSUP Fatmawati cardiac clinic outpatient.

Target: 100/site/cohort over 6 bulan recruitment window.

### Compensation
- Pinjam wearable gratis 90 hari.
- Voucher Rp 250.000 per visit (3 visit = Rp 750.000 total).
- Transport reimbursement kunjungan.

---

## 8. Data Collection Protocol

### 8.1 Wearable Data (continuous, 90 hari)
- HR, HRV (RMSSD, SDNN, pNN50), SpO₂, skin temp — 1 Hz aggregate
- PPG raw — 25 Hz, downsampled
- PM2.5, PM10 (onboard SDS011) — 60 s interval
- UV index — 30 s interval
- GPS — 1 menit interval (consent required)
- Battery, RSSI — telemetry only

### 8.2 Reference Devices (visit-based)
- **D0 + D45 + D90**:
  - 12-lead ECG (10 menit) — Mortara Eli 250c atau setara
  - Spirometry (FEV1/FVC/PEF) — Vitalograph Pneumotrac
  - Manual BP cuff (Omron HEM-7156T)
  - Pulse oximeter clinical (Masimo Radical-7) untuk SpO₂ cross-check
- **D0 only**:
  - Lipid panel, HbA1c, CRP (lab baseline)

### 8.3 Symptom Diary (90 hari)
- Daily ePRO via in-app form: chest discomfort, dyspnea, fatigue, headache, dizziness (0-10 scale)
- AE checkbox: weekly
- Activity diary: workouts logged

### 8.4 Environmental Reference
- BMKG hourly data + IQAir API per district untuk cross-validation DLSFA.

---

## 9. Statistical Analysis Plan

### 9.1 Primary
- Confusion matrix AERVINEX AFib alert vs 12-lead ECG diagnosis.
- Sensitivity, Specificity, PPV, NPV with 95% Wilson CI.
- ROC AUC for continuous risk score.

### 9.2 Secondary
- Bland-Altman plot: AERVINEX SpO₂ vs Masimo gold standard.
- Cohen's κ untuk respiratory cluster (asma/ISPA/COPD).
- Pearson correlation TEPRS vs subjective Borg + symptom diary.

### 9.3 Subgroup Analysis
- Stratified by cohort (marathon / motor / cardiac).
- Stratified by age, BMI, Fitzpatrick skin type (PPG accuracy varies by melanin).

### 9.4 Missing Data
- Multiple imputation jika < 20%.
- Sensitivity analysis dengan complete-case bila > 20%.

### 9.5 Software
- R 4.3+ (pROC, caret, irr packages) + Python 3.11 (scikit-learn) — code di-archive di Zenodo.

---

## 10. Informed Consent
- Template di file sibling: `informed-consent-id.md` (Bahasa Indonesia, reading level SD-SMP).
- Versi English untuk publikasi internasional: `informed-consent-en.md` (TBD).
- Pre-screening: 1 lembar info simpel + verbal Q&A.
- Konsultasi mahasiswa Hukum Kesehatan untuk review kepatuhan UU PDP & UU Kesehatan.

---

## 11. Adverse Event Reporting

### Definisi AE dalam konteks wearable
- **Mild**: iritasi kulit lokal, false alarm tanpa konsekuensi tindakan
- **Moderate**: kecemasan signifikan dari false alarm, kunjungan dokter tidak perlu
- **Severe**: ER visit / rawat inap dipicu false alarm, missed alarm pada kondisi nyata
- **Life-threatening / Death**: rare but mandatory report — investigation root cause + paused enrollment

### Mekanisme
- In-app form (`/ae-report.html`) langsung tersimpan di Firestore `adverse_events/{ts}`.
- Mandatory report ke IRB dalam 7 hari untuk Severe; 24 jam untuk Life-threatening.
- Bulanan: aggregate AE report ke DSMB (Data Safety Monitoring Board).

---

## 12. Data Security & Privacy

### Compliance
- UU 27/2022 (Pelindungan Data Pribadi / UU PDP) — Indonesia
- WHO ethics guideline mHealth research
- Roadmap ke GDPR-equivalent (untuk publikasi internasional)

### Technical
- Firebase Firestore — encryption at rest (AES-256) + in transit (TLS 1.3).
- Firestore rules: per-uid scoping (lihat `firestore.rules`).
- Audit log untuk akses peneliti.
- De-identification: study ID, bukan nama / NIK.
- Bridge file (study ID ↔ identitas) disimpan terpisah, akses 2-factor.

### Data Retention
- Raw data: 10 tahun (sesuai standar archival riset Indonesia).
- De-identified untuk publikasi: indefinite.
- Hak penarikan data (right to be forgotten) tersedia kapan saja — kecuali data sudah di-aggregate published.

---

## 13. Timeline

| Phase                              | Bulan        |
|------------------------------------|--------------|
| IRB submission + ethics approval   | 0–2          |
| Site setup + staff training        | 2–3          |
| Recruitment (rolling)              | 3–9          |
| Follow-up (90 hari per subject)    | 3–12         |
| Database lock                      | 13           |
| Analysis                           | 13–15        |
| Manuscript drafting                | 15–18        |
| Total                              | **18 bulan** |

---

## 14. Funding & Conflict of Interest

### Funding (target)
- Indonesia Endowment Fund for Education (LPDP) — grant riset
- Kemendikbud — Hibah Penelitian Kompetitif
- Industri sponsor: TBD (avoid medical device manufacturer dengan competing interest)

### Conflict of Interest Disclosure
- PI: pengembang AERVINEX → COI declared. Mitigasi: clinician evaluator independen + statistician independen.
- Tidak ada saham di vendor sensor (SparkFun, Adafruit, Nova Fitness Sds).

---

## 15. Publication & Data Sharing
- Pre-registration: ClinicalTrials.gov (US) atau INA-Registry.
- Open access target journal (JMIR mHealth uHealth atau npj Digital Medicine).
- Data sharing: de-identified dataset → Zenodo / Figshare 12 bulan setelah publikasi primer.
- Code: GitHub public after publication.

---

## 16. Approval Trail
- [ ] PI signature
- [ ] Co-investigator signatures
- [ ] IRB submission
- [ ] IRB approval received (date: ___)
- [ ] Annual renewal (date: ___)

---

## Appendices
- A. Case Report Form (CRF) — TBD
- B. Informed Consent Form — `informed-consent-id.md`
- C. Symptom Diary template
- D. Statistical Analysis Plan (full version)
- E. CONSORT-AI / SPIRIT-AI extension checklist (for AI-driven wearable)

---

**Catatan**: Protocol ini adalah skeleton draft. Sebelum submit ke IRB sebenarnya, perlu:
1. Konsultasi dengan IRB officer di institusi sponsor.
2. Review oleh statistician berpengalaman cohort studies.
3. Pilot test CRF dengan ≥ 10 partisipan dummy.
4. Update sesuai feedback DSMB.
