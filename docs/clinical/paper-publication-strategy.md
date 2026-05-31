# Research Paper Publication Strategy — AERVINEX

**Versi**: 1.0 · Strategic plan
**Horizon**: 2026 → 2029 (3 paper output minimum)
**Status**: Pre-submission planning (saat ini Phase 1 validation belum mulai)

---

## Target Journals (Tier-Ranked)

### Tier 1 — Open Access mHealth
1. **JMIR mHealth and uHealth** (JMIR Publications)
   - IF ~ 5.0+ (2024), Q1 mHealth
   - Open access, fast review (median 6–12 minggu)
   - Strong fit untuk wearable + ML
   - APC ~ USD 2500

2. **npj Digital Medicine** (Nature Portfolio)
   - IF ~ 12+, Q1 Digital Health
   - High prestige, broad readership
   - Open access, kompetitif (rejection rate tinggi)
   - APC ~ USD 5000

### Tier 2 — Journals with mHealth focus
3. **JMIR Medical Informatics** — fokus methodology/informatics
4. **Sensors** (MDPI) — fast turnaround, sensor-focused
5. **IEEE Journal of Biomedical and Health Informatics** — engineering-heavy
6. **BMJ Open** — clinical research broad, open access

### Tier 3 — Indonesia/ASEAN regional
7. **Acta Medica Indonesiana** — Sinta-1, Q3 regional
8. **Medical Journal of Indonesia** — Q3 regional
9. **Acta Cardiologia Indonesiana** — specific cardiology

### Tier 4 — Conference (untuk pre-publication awareness)
10. **IEEE EMBC** (Engineering in Medicine & Biology Conference) — annually
11. **ACM CHI** — HCI angle untuk UX paper
12. **AMIA Annual Symposium** — informatics

---

## 3 Paper Pipeline

### Paper 1 — Phase 1 Calibration & Methodology
**Judul kerja**:
*"Multi-Source Sensor Fusion for Environment-Induced Health Risk Detection in
Tropical Urban Populations: A Calibration Methodology for AERVINEX Wearable System"*

**Target journal**: JMIR mHealth uHealth atau Sensors (Tier 1–2)
**Timeline**:
- Draft: M6 (saat data calibration sudah collected dari Phase 1 baseline)
- Submission: M9
- Acceptance target: M12–M15

**Authorship**:
- First author: [Nama PI AERVINEX]
- Co-authors: pembimbing skripsi, 1 sensor engineer, 1 statistician
- Corresponding: PI

**Key contributions**:
- DLSFA geospatial fusion methodology (novel)
- TEPRS composite score derivation
- Calibration framework for tropical populations
- Open dataset (n ≥ 50 pilot subjects) di Zenodo

**Estimated word count**: 4000–6000 words + figures
**Difficulty**: Medium (methodology, less risky than clinical claims)

---

### Paper 2 — Phase 2 ONNX Deployment + ML Architecture
**Judul kerja**:
*"On-Device Machine Learning for Wearable Health Monitoring: ONNX Deployment of
XGBoost and LightGBM Risk Models with In-Browser Inference"*

**Target journal**: IEEE Journal of Biomedical and Health Informatics atau Sensors
**Timeline**:
- Draft: M9–M12 (saat ML pipeline mature)
- Submission: M15
- Acceptance target: M18–M21

**Authorship**:
- First: ML engineer (atau PI kalau solo)
- Co-authors: pembimbing + 1 software engineer

**Key contributions**:
- Architecture: XGBoost (TEPRS, RRSS) + LightGBM (MCD, APRB) → ONNX Runtime Web
- Benchmark: latency, accuracy preservation, model size compression
- In-browser inference for low-resource clinical settings
- XAI integration (SHAP-equivalent via XAI-M feature)

**Estimated word count**: 5000–8000 words + benchmark tables
**Difficulty**: Medium-High (engineering-heavy)

---

### Paper 3 — Phase 3 Clinical Validation
**Judul kerja**:
*"Validation of a Wearable Sensor-Driven Atrial Fibrillation Screening System in
a Multi-Cohort Indonesian Population: Results of the AERVINEX-VAL Phase 1 Study"*

**Target journal**: npj Digital Medicine, BMJ Open, atau Lancet Digital Health
**Timeline**:
- Database lock: M13 (dari study timeline IRB protocol)
- Draft: M15–M17
- Submission: M18
- Acceptance target: M21–M24

**Authorship**:
- First: PI AERVINEX
- Co-first: clinician investigator dari RS partner
- Co-authors: full investigator team (kardiolog, paru, statistician, sensor engineer)
- Corresponding: PI + clinician investigator senior

**Key contributions**:
- Primary endpoint: sensitivity, specificity AFib detection vs 12-lead ECG
- Subgroup analysis by cohort, age, BMI, skin type
- Real-world AE rate
- Open dataset (de-identified) di Zenodo / Figshare

**Estimated word count**: 6000–8000 words + extensive supplementary
**Difficulty**: High (clinical claims, IRB review, regulatory implications)
**Risk**: Negative results scenario — pre-register at ClinicalTrials.gov atau INA-Registry
untuk transparansi.

---

## Pre-Publication Checklist (untuk setiap paper)

- [ ] Pre-print upload (bioRxiv / arXiv / medRxiv) sebelum submission journal
- [ ] Pre-registration di protocols.io atau OSF
- [ ] CONSORT-AI / SPIRIT-AI / STROBE checklist sesuai design
- [ ] Code archive di GitHub dengan tag release
- [ ] Dataset archive di Zenodo dengan DOI
- [ ] Conflict of interest disclosure
- [ ] Funding statement
- [ ] Author contribution statement (CRediT taxonomy)
- [ ] Data availability statement
- [ ] Cover letter highlighting novelty

---

## Co-author Strategy

### Untuk Paper 1 (Methodology)
- Minimum 3–4 authors (lean team), PI utama
- Tambahan: pembimbing + 1 sensor expert

### Untuk Paper 2 (Engineering/ML)
- Lean engineering team (3–5 authors)
- Add: ML reviewer / advisor untuk peer review internal

### Untuk Paper 3 (Clinical)
- Multi-author wajib (ICMJE compliance)
- Include: PI, 2 site clinician PIs (kardiologi + paru), statistician, sensor engineer, software lead
- 6–10 authors realistic

---

## Reviewer Strategy

### Suggested Reviewers (saat submission)
- Untuk wearable: cek author list pivotal wearable AFib paper (mis. Apple Heart Study)
- Untuk Indonesia context: Sinta-2/Sinta-1 reviewer dari FKUI, FK Unpad, FK Unair
- Untuk ML: reviewer dari conference TBME / EMBC track relevan

### Reviewer to Exclude
- Researcher dengan COI komersial di kompetitor wearable
- Reviewer yang sudah pernah reject paper PI dengan rationale yang tidak konstruktif

---

## Funding & APC Budget

| Paper       | Target Journal             | APC Estimate    | Notes                  |
|-------------|----------------------------|-----------------|------------------------|
| Paper 1     | JMIR mHealth uHealth       | USD 2500        | Open access mandatory  |
| Paper 2     | Sensors (MDPI)             | USD 2200        | Open access            |
| Paper 3     | npj Digital Medicine       | USD 5000        | Premium open access    |
| **Total**   |                            | **USD 9700**    | ~ Rp 155 jt            |

**Funding source target**:
- LPDP — riset grant untuk paper publication
- Kemendikbud — hibah PT untuk APC subsidi
- Crowdfunding via koneksi Universitas

---

## Beyond First Round — Long-Term Output

### Conference presentations
- IEEE EMBC 2027 (international)
- AsiaPCO 2027 (regional)
- KONAS Kardiologi (national)
- AMIA atau MIE (informatics)

### Book chapter
- Buku ajar: "Wearable Health Monitoring in Tropical Climates" — possible compilation
  chapter di textbook edited oleh group dengan reputasi.

### Thesis/Dissertation
- Skripsi (S1): paper 1 + paper 2 sebagai content utama
- Tesis (S2 future): paper 3 + extension
- Disertasi (S3 future): full longitudinal cohort + multi-site

### Patent
- Filing patent untuk DLSFA + TEPRS sebagai inovasi defendable
- Konsultasi dengan Ditjen KI (Direktorat Jenderal Kekayaan Intelektual)

---

## Risk & Mitigasi

| Risiko                                  | Mitigasi                                                       |
|-----------------------------------------|----------------------------------------------------------------|
| Paper 3 negative results                | Pre-register; publikasi tetap penting untuk literature         |
| Reviewer reject berkali-kali            | Down-tier journal target; iterate dengan feedback              |
| Tim co-author keluar mid-project        | Authorship contract written sejak awal                         |
| Data privacy issue muncul saat publish  | Anonymization extra-strict; IRB consultation                   |
| Plagiarism concern dari work serupa     | Thorough literature review; novelty articulation clear         |
| APC tidak ada budget                    | Pre-apply waiver dari journal; cari grant khusus               |

---

## Catatan Final
- **Pace realistic**: 1 paper per 12–18 bulan untuk lean team.
- **Quality > quantity**: better 1 paper di Nature/JAMA bracket dari 5 paper di predator journal.
- **Indonesia open access ecosystem berkembang**: leverage SINTA + Garuda untuk visibility lokal.
- **Reproducibility**: code + dataset open dari awal — bukan beban tapi credibility booster.
