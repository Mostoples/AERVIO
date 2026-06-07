# AERVINEX — Project Progress & Handoff

> **Untuk Claude Code berikutnya:** Dokumen ini berisi konteks lengkap project, state terkini, dan instruksi untuk melanjutkan kerjaan. **Baca seluruhnya** sebelum mulai. Last updated: 2026-06-08.

---

## 🎯 Project Overview

**AERVINEX** (sebelumnya "Aervio") — health monitoring web app untuk pelari Indonesia + warga urban. Mengintegrasikan AQI, cuaca, sensor wearable, dan 35 ML proxy untuk prediksi risiko kesehatan kontekstual.

- **Live**: https://aervinex.web.app
- **Repo**: https://github.com/Mostoples/AERVIO (branch `main`)
- **Firebase project**: `aervinex`
- **Lokasi project**: `c:\Users\mosto\Desktop\aervio`
- **User**: Mostoples (cooxnime@gmail.com)
- **Firebase login**: mersif.storage1@gmail.com
- **License**: AGPL-3.0
- **Tim founder**: Zabrina (CEO), Mahar (CBO), Syasa (CTO), Shyra (CRO)

### User Context
- Mahasiswa riset Indonesia (bilingual ID/EN, prefer ID untuk percakapan)
- Fokus: health tech + sport science
- Iterates fast — sering minta revisi visual incremental setelah deploy

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — **NO build tool**, NO bundler |
| Hosting | Firebase Hosting (region: asia-southeast2) |
| Auth | Firebase Auth (Email, Google, Anonymous) |
| DB | Firestore asia-southeast2 |
| Functions | Firebase Cloud Functions (Gemini API untuk Aervi AI chatbot) |
| Caching | Service Worker (`public/sw.js`) — versioned, currently **v29** |
| i18n | Custom dict `public/js/i18n.js` (~3,170 entries ID/EN) |
| ML | 35 calibrated proxies (avg 85.8% accuracy) — `public/js/health-engine.js` |
| Payments | Midtrans (planned, butuh KYC) |
| 3D | Three.js (lazy-loaded landing only) |
| Charts | Inline SVG + Mermaid (riset pages) |

### Critical Architecture Rules
1. **NO npm install, NO build step** — semua edit langsung ke `public/`
2. **CSS @import HARUS di TOP** file (spec requirement)
3. **Service Worker** harus di-bump VERSION setelah edit asset → cache bust
4. Setiap `<body>` punya `data-page="..."` untuk per-page CSS targeting
5. Sidebar persistent ≥1024px via `desktop-sidepanel.js` — skip pages: home, login, register, onboarding, sample, 404

---

## 📁 File Map (Penting)

### Top-level
- `firebase.json` — hosting config, CSP headers, X-Frame SAMEORIGIN
- `.firebaserc` — project: `aervinex`
- `functions/aiChat.js` — Gemini Cloud Function

### CSS (`public/css/`)
- `aervinex-ui.css` — base design system, `@import url('./desktop-responsive.css')` at **line 6** (top)
- `desktop-responsive.css` — v5 SIMPLIFIED, per-page max-width caps
- `a11y-tokens.css` — accessibility tokens
- `admin-ui.css` — admin dashboard styles
- `style.css` — landing page only

### JS (`public/js/`)
- `aervinex-app.js` — global loader, auto-injects: i18n.js, desktop-sidepanel.js, card-pattern-auto.js
- `desktop-sidepanel.js` — persistent sidebar 260-280px, body padding-left strategy
- `card-pattern-auto.js` — auto-detect medical icon decoration via keyword matching (10 patterns)
- `i18n.js` — bilingual dictionary 3,170 entries
- `health-engine.js` — 35 ML proxy predictions
- `auth.js` — Firebase Auth wrapper, Android Google `signInWithRedirect` fallback
- `smart-recs.js` — recommendations, theme-aware (dark/light/glass)
- `disease-list.js` — 36 disease entries
- `assessments.js` — self-assessment GINA ACT etc.
- `ml-test-runner.js` — accuracy test orchestrator
- `firebase-config.js` — Firebase init
- `app-check.js` — **PLACEHOLDER** reCAPTCHA v3 site key (user action needed)

### HTML pages (`public/`)
**Core**: index.html (landing), dashboard.html, onboarding.html, login.html, register.html, profile.html

**Health**: risk-list.html, risk-detail.html, metric-detail.html, encyclopedia.html, assessment.html, recovery.html, alerts.html

**Activity**: running.html, history.html, session-detail.html, achievements.html, challenges.html

**Community**: community.html, community-channel.html, ai-chat.html

**Subscription**: subscription.html

**Device**: device.html, device-pair.html, calibrate.html, live-data.html

**Research/Transparency**: evidence.html, ml-results-report.html, ml-improvement-plan.html, aervinex-roadmap.html, datasets.html, xai-audit.html

**Admin** (`public/admin/`): 22+ admin pages (users, devices, alerts, etc.)

**Legal**: terms.html, privacy.html, privacy-policy.html, security.html, consent.html, about.html, help.html

---

## 📜 Recent Work (Reverse Chronological)

### Latest 5 commits
1. **`99a2a54`** fix(layout): body padding-left + revert overengineered 3-col splits **← CURRENT HEAD**
2. **`cf88045`** feat(ui): auto-detect card pattern across all pages
3. **`90a694b`** fix(layout): fill viewport desktop + decorative side panels
4. **`e132b59`** fix(ui): comprehensive UI audit fixes — 217 issues across 49 pages
5. **`93cd3f7`** feat(carousel): force auto-move every 6 seconds

### What `99a2a54` changed (LATEST FIX)
**Root cause**: Pre-existing `margin-left: 260px` rules pada banyak selector individu menyebabkan content overlap sidebar (community heading "AERVINEX 🌿" terpotong, Aervi AI input bar mungil, ML report actions-bar salah posisi, Notifikasi narrow di kanan).

**Solution**:
- Apply `padding-left: 260px` (1024-1279px) / `280px` (≥1280px) di `<body>` level
- Skip pages: home, login, register, onboarding, sample, 404
- Drop semua per-element `margin-left` rules (was double-shifting)
- Reverted 3-col fake-aside layouts (overengineered)
- Fixed-positioned chat input bars: `left: 260/280px` override
- ml-results actions-bar: `left: 274px; right: 14px`

**Why this matters**: SEMUA child element body auto-shift sekarang — ga ada element yang ter-miss.

---

## 🎨 Design System

### Aura colors (card variants)
- `aura-coral` — heart/cardiac
- `aura-violet` — brain/mental
- `aura-blue` — droplet/hydration
- `aura-amber` — uv/sun
- `aura-green` — activity/success
- `aura-pink` — pill/medication
- `aura-cyan` — air/environment
- `aura-danger` / `aura-success` / `aura-warning` / `aura-info` aliases

### Medical pattern overlay (`card-pattern-auto.js`)
Single large icon di pojok kanan bawah card, opacity 0.08-0.18 (theme-aware). 10 patterns:
`heart, lung, temp, droplet, brain, uv, air, sleep, activity, pill`

Auto-detected dari text content (~80 keywords ID+EN). Override manual via `data-pattern="..."` attribute. Opt-out via `.no-pattern` class.

### Themes
- `theme-dark` (default)
- `theme-light`
- `theme-glass` (frosted glass)

Switching via `.theme-toggle-fab` button. Persist di `localStorage.theme`.

### Breakpoints (desktop-responsive.css)
- **Mobile** ≤600px — bottom nav, single column
- **Tablet** 768-1023px — hamburger toggle, narrow centered
- **Desktop** ≥1024px — persistent sidebar 260px, body padding-left
- **Wide** ≥1280px — sidebar 280px
- **Ultra-wide** ≥1700px — content max-width 1500px

---

## ✅ Major Completed Features

| Feature | Status | Notes |
|---|---|---|
| ML accuracy verification | ✅ Live | 35 models, avg 85.8% acc, seed=42 reproducible |
| Onboarding wizard | ✅ | Multi-step, ob-shell layout |
| Landing page redesign | ✅ | Hero carousel 5 slides (auto-rotate 6s), Three.js particles, persona, team |
| ESP32 firmware | ✅ | Arduino CLI scripts |
| i18n bilingual | ✅ | 3,170 entries ID/EN |
| Android Google auth fix | ✅ | `signInWithRedirect` fallback |
| Community channels | ✅ | community.html + channel pages |
| Aervi AI chatbot | ⚠️ | UI done, Gemini key user-action |
| Dataset registry | ✅ | 33 papers + 24 repos + 18 datasets verified |
| XAI audit | ✅ | 63 features Level 0-3 |
| Roadmap execution | ✅ | 90 items / 12 categories |
| Desktop responsive | ✅ | v5 simplified — body padding-left strategy |
| Medical card patterns | ✅ | Auto-detect 10 patterns |
| Service Worker | ✅ | v29, network-first HTML + SWR assets |
| Team section | ✅ | 4 founders Z/M/S/S |

---

## ⚠️ User-Action Required (Tidak bisa dilakukan Claude)

1. **App Check reCAPTCHA v3** — `public/js/app-check.js` masih punya `RECAPTCHA_V3_SITE_KEY_PLACEHOLDER`. Aktifkan via Firebase Console > App Check.
2. **Gemini API key** — `firebase functions:config:set gemini.api_key="..."` untuk Aervi AI chatbot.
3. **Midtrans merchant KYC + keys** — untuk subscription payments.
4. **FCM VAPID key** — dari Firebase Console > Cloud Messaging untuk push notifications.
5. **PhysioNet AF Challenge 2017 download** — untuk real ML training (saat ini pakai synthetic seeded data).
6. **Hospital partnership** (RSCM/RSPI) — untuk IRB submission.
7. **Team photos** — kalau mau update foto founder, ganti di `public/index.html` team section.

---

## 🎯 User Preferences (Important!)

Berdasarkan feedback iteratif sepanjang project:

### Communication
- ✅ **Bahasa Indonesia** untuk respon (mix EN technical OK)
- ✅ **Concise** — short respon dengan code refs, no fluff
- ✅ **Visual proof** — kalau bikin UI change, jelaskan via screenshot path/structure
- ❌ **Jangan over-explain** — user paham technical

### Design philosophy
- ✅ **"Buat 5x lebih bagus"** — ambition high, immersive 3D OK selama tidak berat
- ✅ **Decorative tapi tidak norak** — pattern samar (opacity 0.08-0.18), bukan looping pattern
- ✅ **Card decoration**: single large icon (~40% card width), bottom-right corner, "muncul dari bawah pojok"
- ✅ **Fill viewport pada desktop** — no awkward empty space ("layoutnya tidak full")
- ✅ **Persistent sidebar Notion-style** untuk navigasi desktop
- ❌ **Vertical sidebar nav awkward** — user sebut "jelek" untuk yang minimalist sebelumnya
- ❌ **3-col fake-aside split** untuk content — user nggak suka, terlihat "kosong"
- ✅ **Pattern kontekstual** — heart icon di HR card, lung di SpO2, dll

### Workflow
- ✅ **Selesaikan semua task** — kalau dia bilang "selesaikan semua", **execute ALL** sampai habis (parallel agents OK)
- ✅ **Verify deploy** — push to Firebase + GitHub setelah change
- ✅ **Bump SW version** setelah asset change
- ❌ **Jangan tanya berlebihan** — judgment call boleh, tapi konfirmasi action destruktif

### Iterasi pattern
User biasanya:
1. Request → Claude execute → deploy
2. User screenshot issue → "tolong perbaiki"
3. Iterate sampai puas

---

## 🐛 Known Issues / Watchlist

### Resolved tapi watch
- ✅ CSP fixed (added fonts.gstatic.com, www.gstatic.com, cdn.jsdelivr.net, midtrans)
- ✅ X-Frame DENY → SAMEORIGIN (for iframe in landing)
- ✅ manifest.json 404 fix (removed `**/*.json` from firebase.json ignore)
- ✅ App Check warning (still shows, user-action)
- ✅ Smart-recs cards theme-aware

### Outstanding (low priority)
- ⚠️ Carousel slide content might need refinement (deferred — check user feedback)
- ⚠️ ml-results-report mobile responsive — partially addressed, periodic re-check
- ⚠️ `body[data-page="login"]` & `register` & `sample` belum punya `data-page` attribute → tidak match selector, **tapi tidak masalah** karena pages ini juga di-skip sidepanel install. Kalau Auth pages butuh `.auth-shell` styling, attribute mungkin perlu ditambah.

---

## 🚀 Common Commands

```bash
# Deploy hosting (from project root)
firebase use aervinex
firebase deploy --only hosting

# Deploy functions (kalau edit aiChat.js etc.)
firebase deploy --only functions

# Git workflow
git add -A
git commit -m "..."
git push origin main

# Check what's deployed
curl -sI https://aervinex.web.app/sw.js | head

# Bump SW version
# Edit public/sw.js line 7: const VERSION = 'aervinex-vN+1';
```

### Local test (optional)
```bash
node ml/local-test/run-tests.js     # ML accuracy test
node ml/local-test/calibrate.js     # Recalibrate proxies
```

---

## 🧭 First Things Next Claude Should Do

1. **Baca PROGRESS.md** (this file) **fully**
2. **`git log --oneline -10`** — confirm latest state
3. **`git status`** — make sure clean (saat ini clean per last commit)
4. **Tanya user** apa yang mau dilanjutkan / fix berikutnya
5. **JANGAN langsung edit** tanpa konfirmasi user — kecuali user kasih instruksi spesifik

### Quick checks kalau user lapor bug
- Layout broken di desktop? → `public/css/desktop-responsive.css` + `public/js/desktop-sidepanel.js`
- Card icon hilang? → `public/js/card-pattern-auto.js` + `public/css/aervinex-ui.css` (`.card::after`)
- i18n hilang/salah? → `public/js/i18n.js` (massive dict)
- Auth gagal? → `public/js/auth.js`
- ML prediction salah? → `public/js/health-engine.js` + `disease-list.js`
- Theme tidak apply? → cari `theme-dark|light|glass` di CSS, ensure class-based not inline color

### Critical reminders
- **CSS @import HARUS di line 6** `aervinex-ui.css` (TOP, sebelum any rules) — kalau dipindah ke bawah, browser ignore
- **Service Worker version** wajib bump setelah edit JS/CSS — else user dapat stale cache
- **`data-page` attribute** wajib di every body — banyak CSS targeting pakai ini
- **`!important`** dipakai banyak di desktop-responsive — karena override existing `.app-shell` styles. Konsisten.

---

## 📊 Auto-Memory (User-specific, persists across sessions)

Lokasi: `C:\Users\mosto\.claude\projects\c--Users-mosto-Desktop-aervio\memory\`

- `MEMORY.md` — index
- `user_profile.md` — mahasiswa riset, health tech + sport science
- `project_aervio.md` — konteks lengkap project (mungkin perlu update dengan info dari PROGRESS.md ini)

Update memory kalau:
- User kasih feedback baru tentang preferensi
- Project state berubah significant (rename, pivot, dll)

---

## 🔗 References

- **Live URL**: https://aervinex.web.app
- **GitHub repo**: https://github.com/Mostoples/AERVIO
- **Firebase Console**: https://console.firebase.google.com/project/aervinex/overview

---

**End of handoff. Good luck — proyek ini sudah substantial, hati-hati jangan break existing features. Iterate carefully.**
