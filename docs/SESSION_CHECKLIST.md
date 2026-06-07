# AERVINEX Session Checklist — All User Requests

**Session period**: 2026-05-30 → 2026-06-07
**Total commits**: 10+
**Live URL**: https://aervinex.web.app
**Repo**: https://github.com/Mostoples/AERVIO

---

## ✅ COMPLETED (deployed live + pushed)

### Phase A — Initial ML Audit
- [x] Bangun rigorous accuracy testing system (35 model, 1000 cases each)
- [x] Buat halaman test report transparan (`ml-results-report.html`)
- [x] Mekanisme testing dijelaskan untuk akuntabilitas (6 langkah flow + 7 formula)
- [x] Wilson 95% CI per metric

### Phase B — ML Improvement Plan
- [x] Identifikasi model lemah via local Node test (Avg 43.2% → diagnostic)
- [x] Phase 1: Recalibration (Platt + threshold) → 86.4% accuracy (+43pp uplift)
- [x] Phase 2: Plan + feature engineering corrections (AFib, Heatstroke, CV-Fit, Sleep-Apnea)
- [x] Rencana kerja mendalam dengan eksplorasi (`ml-improvement-plan.html`)
- [x] Tingkatkan akurasi model secara ketat dari GitHub/Kaggle/Scopus sources

### Phase C — Research Verification
- [x] Install `deep-research-skills` repo (Weizhena)
- [x] Setup `~/.claude/skills` + `~/.claude/agents`
- [x] Enable WebSearch (user-side)
- [x] 4 parallel research agents launched (cardiac/respiratory/sleep/sport)
- [x] **33 papers verified** via PubMed/Crossref DOI
- [x] **24 GitHub repos verified** dengan star counts
- [x] **18 open datasets verified**
- [x] 7 koreksi penting (Uth journal, Buller journal, Gabbett ACWR range, Tinschert title, RECEIVER location, Bumgarner PMID, Cooper Cohort)
- [x] Output: `docs/research/{afib,respiratory,sleep-mental,sport-fitness}-research.md`
- [x] v2 `ml-improvement-plan.html` dengan citation lengkap

### Phase D — Onboarding & Landing
- [x] Bangun onboarding wizard 7-step (`onboarding.html`)
- [x] Funnel analytics ke Firestore
- [x] Redesign landing page startup-grade
- [x] Auto-detect language + i18n setup
- [x] Wire redirect logic (register/login → onboarding bila belum complete)

### Phase E — Roadmap Execution (90 items)
- [x] Build `aervinex-roadmap.html` (94 KB, 12 kategori, 90 action items)
- [x] Effort×Impact matrix + 18-month Gantt
- [x] 6 parallel agents executed 90 items:
  - [x] Performance + a11y + SEO (21 items)
  - [x] Security + Privacy (8 items)
  - [x] Data Pipeline + ML Training (16 items)
  - [x] UX + Monetization (14 items)
  - [x] i18n + Open Source (14 items, OS done manually after agent E content-filter)
  - [x] Hardware Web BLE + Clinical (17 items)
- [x] ~120 file dibuat/dimodifikasi
- [x] Status: 72 DONE / 15 SCAFFOLDED / 3 EXTERNAL-DEP

### Phase F — Firmware ESP32
- [x] Arduino CLI scripts (setup/compile/flash/monitor untuk bash + PowerShell)
- [x] `aervinex-sensor.ino` 583 LOC (MAX30102 + BME280 + SDS011 + GUVA-S12SD + battery)
- [x] BLE GATT services (Heart Rate 0x180D + Environmental 0x181A + Nordic custom)
- [x] BOM Rupiah + ASCII wiring + OTA flow documentation

### Phase G — Open Source
- [x] LICENSE (AGPL-3.0 dengan medical disclaimer addendum)
- [x] CONTRIBUTING.md (development setup, code style, commit convention, DCO)
- [x] CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- [x] ROADMAP.md (quarterly milestones Q3 2026 → Q4 2027)
- [x] 4 issue templates (bug, feature, ml_model_issue, clinical_concern)
- [x] PR template dengan checklist
- [x] GitHub Actions CI + deploy workflows

### Phase H — Initial Deploy + GitHub Push
- [x] Force push ke `Mostoples/AERVIO` (clear remote, replace dengan struktur baru)
- [x] Setup .gitignore (exclude 2GB data/, 21MB ml_models pickle, secrets)
- [x] Comprehensive commit 213 files +40,804 lines

### Phase I — CSP / Manifest / X-Frame Fixes
- [x] CSP `connect-src` tambah fonts.gstatic.com + www.gstatic.com + cdn.jsdelivr.net + Midtrans
- [x] X-Frame-Options DENY → SAMEORIGIN (untuk iframe sample.html di landing)
- [x] Remove `**/*.json` dari firebase.json ignore → manifest.json 200 OK
- [x] App Check placeholder warning di-disclose (butuh reCAPTCHA v3 key dari Console)

### Phase J — Team Section
- [x] Tambah 4 team cards (Zabrina CEO, Mahar CBO, Syasa CTO, Shyra CRO)
- [x] 4 foto team uploaded ke `public/images/team/` (zabrina/shyra/syasa/mahar.png)
- [x] Wire nav link "Tim" di main nav + mobile drawer
- [x] Responsive 4→2→1 col

### Phase K — Auth + Responsive + i18n Initial Fix
- [x] Fix Android Google sign-in: signInWithRedirect fallback + auto-fallback popup→redirect
- [x] Better Anon error: map admin-restricted-operation → friendly message
- [x] getRedirectResult handler di init() untuk return-from-Google flow
- [x] Responsive: ≤480px breakpoint hero h1 32px, floating cards tuck, nav padding
- [x] i18n landing toggle: localStorage persist immediate + retry polling 30×200ms
- [x] Team photo slots dengan onerror fallback ke initial letter

### Phase L — Community + AI Chat
- [x] `community.html` — 8 channels (Pelari Jakarta/Bandung/Surabaya, Komuter, Urban, Asma/Cardiac/Stress)
- [x] `community-channel.html` — realtime Firestore chat, rate limit 1.5s, max 500 char, report 🚩
- [x] `ai-chat.html` — Aervi AI dengan 6 suggestion chips + 4 capability cards + 7 fallback responses
- [x] `functions/aiChat.js` — Cloud Function Gemini 1.5 Flash, user context injection, rate limit 5/min
- [x] Firestore rules untuk community + ai_conversations
- [x] Nav wired di dashboard + landing

### Phase M — i18n Massive Expansion
- [x] **199 → 3,170 entries** (+1,494% growth, 15× lipat)
- [x] 4 parallel agents extract strings per cluster (A+B+C+D = 2,839 new)
- [x] i18n engine improvements:
  - translateMeta(): `<title>`, `<meta description>`, og:*, twitter:*
  - translateAttrs(): tambah `alt=` support
  - debugUntranslated(): console helper untuk audit ongoing
- [x] 28 admin/onboarding pages auto-patched dengan `<script src="i18n.js">`
- [x] Reproducible: `node scripts/merge-i18n-clusters.js`

### Phase N — Evidence Page Fixes
- [x] Mermaid diagrams centered (display flex justify-center)
- [x] SLR stat cards "kosong" diperbaiki (explicit color tokens, dedicated class)
- [x] Mobile responsive ≤600px untuk mermaid + stats

---

## 🔧 IN PROGRESS (akan selesai turn ini)

- [ ] **Dataset registry page** (`datasets.html`) — agent jalan, konsolidasi 33 papers + 24 repos + 18 datasets dengan link valid
- [ ] **XAI audit page** (`xai-audit.html`) — agent jalan, audit Level 0-3 per fitur

---

## ⚠️ MASIH ADA YANG BUTUH ACTION USER (external dependencies)

### Phase O — Items yang butuh kredensial / partnership eksternal
1. **Firebase Console — Enable Anonymous Auth**: kalau guest login masih gagal di Android (sudah ditangani di code, butuh user enable di Console → Authentication → Sign-in method → Anonymous → Enable)
2. **App Check reCAPTCHA v3 site key**: dari https://www.google.com/recaptcha/admin → paste ke `public/js/app-check.js`
3. **FCM VAPID key**: dari Firebase Console → Cloud Messaging → Web Push certificates → paste ke `window.AERVINEX_VAPID_KEY`
4. **Gemini API key untuk Aervi AI**: dari https://aistudio.google.com/app/apikey (free tier ada) → `firebase functions:config:set gemini.api_key="..."` → deploy
5. **Midtrans merchant keys**: register di https://midtrans.com (KYC 2-5 hari) → `firebase functions:config:set midtrans.server_key="..."` `midtrans.client_key="..."` → deploy
6. **PhysioNet AF Challenge 2017 download**: ke `data/` lokal untuk training real ML model (~150 MB)
7. **Hospital partnership**: kontak RSCM/RSPI Sulianti Saroso untuk IRB submission

---

## 📊 SESSION STATS

| Metric | Value |
|---|---|
| Total commits | 10+ |
| Files created | ~140+ |
| Files modified | ~80+ |
| Lines added | ~50,000+ |
| Documentation pages | 35+ MD files |
| Cloud Functions deployed | 13 modules |
| ML models calibrated | 35 |
| Avg ML accuracy | 86.4% (was 43.2%) |
| Verified citations | 33 papers + 24 repos + 18 datasets |
| i18n DICT entries | 3,170 (was 199) |
| Languages supported | 4 (ID, EN, JV stub, SU stub) |
| HTML pages | 68 |

---

## 🎯 NEXT TURN PRIORITAS

1. Lihat report dari dataset/XAI audit agent
2. Verify deployed
3. Push final commit
4. Berikan summary akhir
