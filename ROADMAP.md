# AERVINEX Public Roadmap

> Quarterly milestone view. Detail per-item ada di [public/aervinex-roadmap.html](public/aervinex-roadmap.html) — 90 action items, 12 kategori.

## Status: Q3 2026 (Current)

### Phase 0 — Foundation (✅ COMPLETE)
- ✅ 35 calibrated ML proxies (avg accuracy 86%, F1 73.5% verified)
- ✅ 33 paper peer-reviewed verified via PubMed/Crossref
- ✅ Bilingual ID/EN + 2 bahasa daerah (Jawa, Sunda) stub
- ✅ Onboarding wizard 7-step
- ✅ Calibration v2 dengan Platt scaling
- ✅ ESP32 firmware production-ready (BLE GATT + NimBLE)
- ✅ Recalibration verified: 43.2% → 86.4% accuracy uplift

### Phase 1 — Production Hardening (🔧 IN PROGRESS)
- 🔧 Security: CSP headers, Firestore rules hardening, App Check (scaffolded)
- 🔧 Performance: SW SWR strategy, critical CSS extractor, web vitals reporter
- 🔧 Accessibility: WCAG 2.1 AA tokens, skip-link, focus-visible
- 🔧 SEO: sitemap.xml, robots.txt, Schema.org WebApplication + MedicalCondition
- 🔧 Cloud Functions: ingestSensor, computeRisk, FCM push, aggregateDaily
- 🔧 Monetization: Midtrans scaffold (sandbox ready, merchant KYC pending)
- 🔧 Open Source: AGPL-3.0 LICENSE, CONTRIBUTING, CoC, GitHub templates

## Q4 2026

### Phase 2 — Real ML Pipeline
- Train XGBoost AFib model on PhysioNet AF Challenge 2017 (8,528 records)
- Export to ONNX, deploy via `onnxruntime-web`
- Train respiratory cluster (ISPA/COPD/Pneumonia/Bronchitis) dengan ACCEPT-style features
- A/B testing infra ML proxy vs ONNX live
- MLflow tracking + model versioning
- Target: ≥3 production ONNX models, avg AUC > 0.90

### Phase 2b — Hardware Integration
- Web Bluetooth pairing flow live
- OTA update via Firebase Storage
- Real-time sensor streaming (4-chart live page)
- Multi-device sync UI
- 100 beta users dengan ESP32 dev kit

## Q1 2027

### Phase 3 — Clinical Validation
- IRB submission ke RSUP/RSCM partner
- n=300 prospective cohort (90 hari)
- Compare AFib detection vs 12-lead ECG gold standard
- Respiratory cluster vs spirometry validation
- Adverse event reporting system live
- Kemenkes wellness device classification consultation

### Phase 3b — Engagement Loops
- Social challenges feature live (weekly running, streak leaderboard)
- Family plan multi-account dashboard
- Push notification strategy optimized
- Pricing A/B test conclusive results
- Target: 10,000 active users, DAU/MAU > 0.4

## Q2 2027

### Phase 4 — Scale & Publication
- Public GitHub repo with full source
- First paper submission target: JMIR mHealth uHealth atau npj Digital Medicine
- Hugging Face model hub: `aervinex/afib-detection-v1`
- Federated learning pilot (10 institutions)
- Regional expansion: Bahasa daerah komplit (Jawa, Sunda, Batak, Minang, Bali)
- BPOM SaMD Class IIa consultation
- Target: 50,000 users, 3 hospital partners

## Q3-Q4 2027 (Stretch Goals)

### Phase 5 — Medical Device Track (Conditional)
- Class IIa MDR equivalent submission
- ISO 13485 quality management system
- Clinical evidence dossier (3+ published papers)
- Active Surveillance Plan
- Regulatory clearance untuk diagnostic claims (selective)

### Phase 5 — Platform Expansion
- iOS native wrapper via Capacitor
- Android native wrapper
- Apple HealthKit + Google Fit integration
- Garmin Health API official partnership
- B2B dashboard untuk corporate wellness

## Realistic vs Stretch

**Realistic (committed)**:
- Phase 1 completion by Q4 2026
- Phase 2 real ML by Q4 2026
- Phase 3 clinical pilot by Q1 2027 (assumes 1 hospital partner secured)

**Stretch (depends on funding/partnership)**:
- Phase 4 paper publication
- Phase 5 medical device classification
- Phase 5 platform native apps

**Risks acknowledged**:
- Kemenkes/BPOM regulatory scope creep
- iOS Web Bluetooth limitations
- PhysioNet dataset access friction
- Founder burnout

## How to Contribute

Lihat [CONTRIBUTING.md](CONTRIBUTING.md). Issue templates: [`.github/ISSUE_TEMPLATE/`](/.github/ISSUE_TEMPLATE/).

Track real-time: [public/aervinex-roadmap.html](public/aervinex-roadmap.html) — interactive checklist dengan filter P0/P1/P2 + Effort×Impact matrix + 18-month Gantt.

---

*Last updated: 2026-06-01. Reviewed quarterly. Status badges auto-update dari Firestore `roadmap_status` collection (when feature deployed).*
