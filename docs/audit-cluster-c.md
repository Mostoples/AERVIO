# Audit Cluster C — Auth + Onboarding + Landing + Features

Viewport target: Desktop 1440x900 + Mobile 390x844.
Scope: 13 halaman. Auto-import `desktop-responsive.css` diasumsikan aktif.

## Total issues: 41

---

## public/login.html

### Desktop
- [HIGH] `.auth-shell` tidak punya split-screen / max-width tegas; card melayang di tengah viewport 1440px tanpa hero illustration di sisi kiri. Brief minta "split-screen desktop". Form terlihat sempit (~440px max) dan kanan-kiri kosong → wasted real estate. Fix: tambah grid 2-col `.auth-shell { display:grid; grid-template-columns: 1fr 1fr }` di `@media (min-width: 1024px)` dengan illustration/brand-aura di kolom kiri.
- [MEDIUM] `.theme-toggle-fab` (top-right fixed) bisa overlap dengan `.auth-brand` di viewport medium karena `auth-brand` tidak punya padding-top safe-zone. Fix: tambah `padding-top: 56px` ke `.auth-shell`.
- [LOW] `#error-box` (`.form-error`) hanya muncul dengan `.show`, tapi sebelum ada error tetap mengambil layout space jika CSS default-nya tidak `display:none`. Cek `aervinex-ui.css` — kalau tidak, fix `display:none` default.

### Mobile
- [MEDIUM] Inline `style="padding:28px"` di `.card.aura-cyan` terlalu besar untuk 390px width — sisa konten width 334px. Reduce ke `padding: 22px 18px` mobile via media query.
- [LOW] Tombol `#btn-forgot` `align-self:flex-end` + `font-size:12px` — touch target < 36px (gagal A11y/WCAG 44px target). Fix: `padding: 10px 12px; min-height: 36px`.
- [LOW] Validasi email tidak ditampilkan visually di samping field (hanya via `#error-box` di atas form) — UX standar minta inline error per-field. Tambah `<span class="field-error" id="emailErr">` per field.

---

## public/register.html

### Desktop
- [HIGH] Same as login: no split-screen layout. 4 fields stack vertikal sangat panjang (Nama + Email + Password + Confirm + meter) → form scrollable di 900px height padahal seharusnya muat dengan layout 2-col untuk name/email side-by-side. Fix: di desktop, `.form-group` Nama+Email pakai `grid-template-columns: 1fr 1fr`.
- [MEDIUM] `#pwd-meter` inline tanpa container — kalau `password-strength.js` inject HTML besar bisa lompat layout. Fix: reserve `min-height: 24px`.

### Mobile
- [MEDIUM] Total card height melebihi viewport (390x844): brand + card (4 inputs + meter + button + divider + Google + Guest) → keyboard pop-up tertindih CTA "Buat Akun". Fix: scroll into view on focus + ensure `viewport-fit=cover` (sudah ada).
- [LOW] Password meter rendering tidak punya skeleton/placeholder — flicker saat `password-strength.js` lazy-load. Reserve space.
- [LOW] Email validation inline error tidak ada (sama kasus login).

---

## public/onboarding.html

### Desktop
- [MEDIUM] `.ob-shell { max-width: 540px }` — onboarding form sangat sempit di 1440px viewport. Cards/segments terlihat seperti mobile sticker di tengah. Fix: scale up ke `max-width: 720px` desktop + naikan padding cards.
- [LOW] `.ob-actions { position: fixed }` dengan `max-width: 540px; margin: 0 auto` — di desktop fixed bar hanya 540px lebar di tengah, terasa kecil. Konsisten lebar dengan shell.

### Mobile
- [HIGH] `.ob-actions` fixed bottom dengan `padding-bottom: 110px` di `.ob-shell` — tapi `.ob-content` flex:1 bisa overflow ketika step "Form" (grid 1fr 1fr × 6 fields) di 390px lebar. `grid-template-columns: 1fr 1fr` paksa 2-col → input city/age dll mungkin tertekan. Fix: switch ke 1-col di `@media (max-width: 420px)`.
- [MEDIUM] Progress bar `.ob-bar` + `.ob-counter` + `.ob-dots` (3 indicator redundant) makan vertical space ~80px sebelum content. Konsolidasi: hilangkan dots atau gabung dengan bar.
- [MEDIUM] `.ob-emoji` 48px + `animation: obWave` bisa nempel ke top bar saat scroll. Tambah `margin-top: 4px`.
- [LOW] `.ob-cards` (grid 2-col) di mobile narrow — kalau card-title >14ch akan wrap aneh. Set `min-width: 0` di `.ob-card`.
- [LOW] Button "Lewati" (`.ob-skip`) tidak ada confirm dialog — fitur, bukan layout, tapi UX risk.

---

## public/index.html (Landing)

### Desktop
- [CRITICAL] Hero carousel: `.hero-arrow` posisi `left: 16px / right: 16px` dengan width 48px → di viewport 1440px arrow berada di luar `.lp-container` (max-width 1440px, padding 32px). Arrow overlap dengan side content / persona cards di slide 2/3/4/5. Fix: gunakan `left: calc(50% - 700px); right: calc(50% - 700px)` atau pindahkan ke dalam container.
- [HIGH] Slide 2-5: `.slide-visual { min-height: 360px }` + `.lp-hero-grid { grid-template-columns: 1.05fr 0.95fr }` → di slide-2 city-grid `max-width: 420px`, slide-3 stat-circle-grid `max-width: 420px` → terlalu kecil dibanding kolom 700px+; banyak whitespace di kanan. Fix: naikkan max-width ke 520-580px.
- [HIGH] `.lp-cta-final` `padding: 70px 40px` + `text-align: center`; tapi `.lp-hero-cta { justify-content: center }` di-override di selector `.lp-cta-final .lp-hero-cta`. Cek visual: dengan 2 CTA + `flex-wrap: wrap`, di 1440px bisa OK, tapi di breakpoint 960-1100px CTAs justified kiri default. Verify alignment.
- [MEDIUM] `.lp-team` 4-col di ≥1000px. `.lp-team-avatar img` 96px dengan `onerror` replace ke text node — kalau image fail di tengah hover transform, layout jump. Fix: keep div size with fallback text.
- [MEDIUM] `.lp-compare table { min-width: 600px }` dengan `overflow-x: auto` parent — table fit di desktop, tapi `th.us` highlight cyan tidak diberi `width` → kolom AERVINEX bisa sempit. Fix: `th.us, td.us { min-width: 140px; background: rgba(0,229,212,0.05) }`.
- [MEDIUM] `.lp-pricing` 3-col + `.lp-plan-badge` "PALING POPULER" `position: absolute; top: -12px`. Plan tengah `.featured` `transform: translateY(-4px) on hover` bisa potong badge karena `overflow: hidden` di parent? Cek `.lp-plan { overflow:? }` — tidak set. Aman, tapi pastikan `.lp-pricing` tidak punya overflow:hidden.
- [LOW] `.lp-testimonials` 3-col → 6 items render 2 baris. Tinggi card bervariasi (quote length berbeda) → "rough edge" di row 2. Fix: `align-items: stretch` (default ok) + `.lp-testimonial { display: flex; flex-direction: column }` agar attribute bottom-aligned.
- [LOW] `.lp-faq summary::after` `+` symbol — sebagai accordion indicator OK, tapi tidak ada `aria-expanded` pada `<summary>` (native details handles ini). Verify keyboard navigation.

### Mobile
- [CRITICAL] Hero carousel arrows display:none `< 768px` (OK), tapi `.hero-dots` `position: absolute; bottom: 22px` dapat overlap dengan content slide karena slide 2-5 `min-height: 360px` + `padding-bottom: 70px` di `.hero-track > section.lp-hero`. Di slide 4 (chat mockup) `max-width: 380px` bisa nempel dots. Fix: `bottom: 8px` mobile atau geser ke bawah carousel.
- [HIGH] `.lp-hero-grid` jadi 1-col `< 960px`. Phone mockup `.lp-phone { max-width: 260px }` + `lp-float-1/2/3` `top/left: 4%` masih bisa keluar bezel di 390px karena `transform: scale(0.85)` tetap diaplikasikan setelah position. Visual clutter. Fix: `display:none` floats di `< 480px` atau scale lebih agresif.
- [HIGH] `.lp-persona { padding: 38px 32px; min-height: 360px }` × 2 = 720px+ vertical mobile. Card sangat tinggi dengan emoji + h3 + p + ul (5 items) + CTA. Acceptable tapi terlalu padat. Fix: `padding: 28px 22px` mobile.
- [HIGH] `.lp-compare { overflow-x: auto }` — tabel scroll-x di mobile, tapi tidak ada visual hint scroll. Fix: tambah gradient fade kanan + `scroll-snap-type`.
- [MEDIUM] `.lp-stats { grid-template-columns: 1fr 1fr }` `< 700px` — 4 stat cards jadi 2×2 grid. OK. Tapi `.lp-stat-num { font-size: clamp(28px, 4vw, 40px) }` di 390px ≈ 28px, masih fit.
- [MEDIUM] `.lp-pricing` 1-col `< 880px` — 3 plan stack vertical. Plan PRO `.featured` `box-shadow: 0 20px 60px rgba(0,229,212,0.15)` makan space horizontal. Badge "PALING POPULER" `top:-12px` masih visible. OK.
- [MEDIUM] `.lp-team` 1-col `< 540px` — 4 cards stack = ~1600px scroll. Acceptable. Avatar 96px OK. Bio text 13px line-height 1.6 readable.
- [MEDIUM] `.lp-testimonials` 1-col `< 880px` — 6 items stack vertical → ~2000px scroll. Konsider hide-after-3 + "Load more".
- [MEDIUM] `.lp-faq summary { padding: 16px 20px }` di mobile font-size 14.5px — touch target OK (>44px). Tapi `::after { font-size: 22px }` plus icon kecil — sulit di-tap di area kanan. Acceptable.
- [LOW] `.lp-footer-top` 1-col `< 500px` — 4 columns stack = panjang. OK.
- [LOW] `.lp-drawer { width: 280px; max-width: 85vw }` — overlay click handler ada (`.lp-drawer-overlay.open`). OK.

---

## public/sample.html

### Desktop
- [HIGH] Tidak ada container constraint — `.app-shell` default-nya full-width. Di 1440px viewport, `.hero-card`, `.grid-2`, `.chart-card` semua full-width = visual stretch. Fix: `.app-shell { max-width: 480px; margin: 0 auto }` (this is mobile-first dashboard sample). Atau biarkan saja sebagai mobile-sample, tapi tidak responsive ke desktop.
- [MEDIUM] `.bottom-nav` fixed bottom di desktop tidak natural — desktop biasanya sidebar. Acceptable kalau ini sample mobile-view.

### Mobile
- [LOW] `.grid-2` 4 metric cards OK di 390px. `.hero-card { display: flex }` dengan `.hero-right` ring 120px → bisa cramped. Verify.
- [LOW] `.action-grid` 3 pills horizontal — kalau text "Recovery" + "History" panjang bisa overflow. Fix: `flex-wrap: wrap`.

---

## public/404.html

### Desktop
- [LOW] `.auth-shell` (reused) sempit di tengah viewport — sama issue split-screen seperti login. Acceptable untuk 404.

### Mobile
- [LOW] Number "404" `font-size: 88px; letter-spacing: -4px` — OK fit. Stack CTAs vertical natural.

---

## public/community.html

### Desktop
- [HIGH] `.cm-list { grid-template-columns: 1fr 1fr }` — hanya 2-col bahkan di 1440px! 8 channels di 2-col = 4 baris. Brief explicit: "Community channels list: grid 3-col desktop". Fix: tambah `@media (min-width: 1024px) { .cm-list { grid-template-columns: repeat(3, 1fr) } }`.
- [MEDIUM] `.cm-hero { margin: 14px }` — hero sangat sempit di 1440px. Fix: `max-width: 1100px; margin: 14px auto`.
- [MEDIUM] `.bottomnav` fixed bottom di desktop (sama issue sample.html). Disabling untuk desktop responsive.

### Mobile
- [LOW] `.cm-list` 1-col `< 600px` — OK.
- [LOW] `.cm-tabs { overflow-x: auto }` 5 tabs — OK scrollable.
- [LOW] `.cm-card::before` accent stripe 4px width — `.cm-card { overflow: hidden }` OK.
- [LOW] `.cm-card-badge` "POPULER/BARU" `margin-left: auto` inside flex h3 — OK.

---

## public/community-channel.html

### Desktop
- [HIGH] `html, body { height: 100%; overflow: hidden }` + chat layout flex-column → di desktop 1440px chat lebar penuh, bubble `max-width: 85%` × 1440 = 1224px bubble width — terlalu lebar untuk readability. Fix: wrap `.ch-messages` di container `max-width: 760px; margin: 0 auto`.
- [MEDIUM] `.ch-input-bar { position: fixed; bottom: 0; left: 0; right: 0 }` full-width di desktop → input field jadi sangat panjang. Constrain dengan max-width container.
- [MEDIUM] `.ch-topbar` sticky tidak max-width constrained.

### Mobile
- [HIGH] `<main class="ch-messages" id="messages">` punya dua `id` (id="main" implicit dari `id` di luar, lalu `id="messages"`) — invalid HTML, ada dua `id` di satu element: line 177 `id="main"` dan `id="messages"`. Fix: pakai satu `id`.
- [MEDIUM] `.ch-input-bar` fixed bottom dengan `padding-bottom: calc(12px + env(safe-area-inset-bottom))` — OK iOS notch. `.ch-messages { padding-bottom: 90px }` ada — tapi input bisa 120px tall saat textarea expand max → last message ketutup. Fix: dynamic padding atau `padding-bottom: 140px`.
- [LOW] `.ch-msg { max-width: 85% }` bubble alignment OK. Self vs other distinction visible.
- [LOW] `.ch-bubble .actions { opacity: 0 → 0.85 on hover }` — mobile no hover, actions tersembunyi. Fix: tap-to-reveal atau always-show.

---

## public/ai-chat.html

### Desktop
- [HIGH] Sama dengan community-channel: tidak ada container constraint. `.ai-bubble` di 1440px lebar ekstrim. Fix: wrap `.ai-messages` & `.ai-input-bar` dalam max-width 760px container.
- [MEDIUM] `.ai-suggestions` `overflow-x: auto` — di desktop 6 suggestions muat horizontal, tapi tidak ada hint scrollable.

### Mobile
- [HIGH] `<main class="ai-messages" id="messages">` juga punya double-id (`id="main"` + `id="messages"`). Same fix.
- [MEDIUM] `.ai-suggestions` `padding: 8px 14px` horizontal scroll — OK, tapi nempel dengan `.ai-input-bar` (fixed bottom) — suggestion bar bisa terhalang input area. Verify `bottom` margin pada suggestions container.
- [LOW] `.ai-capabilities` `grid-template-columns: 1fr 1fr` < 420px jadi 1fr. OK.
- [LOW] `.ai-welcome` muncul saat empty — h2 22px + p + 4 cap = ~400px height. Fit.
- [LOW] Send button 44px touch OK.

---

## public/subscription.html

### Desktop
- [HIGH] `.sub-shell { max-width: 720px; margin: 0 auto }` — semua 3 plan stack VERTIKAL bahkan di desktop! Brief minta "3-col desktop". Fix: tambah grid wrapper untuk plan cards `@media (min-width: 1024px) { .plans-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:18px } }` dan group 3 plan-card di dalamnya.
- [MEDIUM] `.plan-badge` "PLAN AKTIF" `top: -10px; right: 16px` — di desktop dengan card vertical OK; tapi jika 3-col badge tetap visible.
- [MEDIUM] `.bottom-nav` fixed bottom — tidak natural di desktop.

### Mobile
- [MEDIUM] Plans stack vertikal natural. `.plan-cta` full-width OK.
- [LOW] `.plan-price { font-size: 28px }` "Rp149.000" + "/bulan · 6 akun" — bisa wrap 2 line. OK.
- [LOW] `.pm-list { flex-wrap: wrap }` 7 chips → 2 baris. OK.
- [LOW] `<small>` di price `font-size: 13px` cukup kontras (`color: #9aabb2`) — tapi `#9aabb2` on dark `#0f1923` contrast ratio ≈ 5.8:1 OK.

---

## public/challenges.html

### Desktop
- [HIGH] `.ch-shell { max-width: 720px }` — semua challenges stack vertikal. Di desktop seharusnya 2-col atau 3-col grid. Fix: wrap `#challengeList` dengan grid 2-col di ≥1024px.
- [LOW] `.bottom-nav` issue sama dengan halaman lain.

### Mobile
- [LOW] `.ch-card { padding: 18px 18px 16px }` OK. `.ch-stats { gap: 18px }` 3 stats horizontal — bisa cramped di 390px (Target/Peserta/Berakhir + values 16px). Verify wrap-or-shrink.
- [LOW] `.ch-actions { gap: 8px }` 2 buttons OK.
- [LOW] `.ch-progress` bar 6px tipis OK.

---

## public/device.html

### Desktop
- [HIGH] `.app-shell` default mobile-first, no max-width — `.sensor-grid` `grid-template-columns: 1fr 1fr` jadi sangat lebar di 1440px. Fix: `.app-shell { max-width: 720px; margin: 0 auto }` atau adapt to 3-col sensor grid di desktop.
- [MEDIUM] `.device-hero { padding: 24px }` + `.watch-illu 90×110px` + info — OK kompak. Di desktop fine.

### Mobile
- [MEDIUM] `.sensor-grid` 2-col + last sensor `grid-column: 1/-1` span 2 → di 390px lebar = 2 col × ~175px width per cell. `.sensor-tile { padding: 14px }` + icon 36px + name + role + meta → padat tapi fit.
- [LOW] BLE status states clear via `.conn-pill` + `.sensor-status-dot` (green/warn/error). OK.
- [LOW] `.battery-visual 70×30px` + `.battery-pct 28px` `.battery-info 11px` — OK layout.

---

## public/calibrate.html

### Desktop
- [HIGH] `.app-shell` default — wizard form full-width di desktop. Card-card spans 1440px lebar, sangat awkward. Fix: `.app-shell { max-width: 560px; margin: 0 auto }`.
- [LOW] Step indicator `.step-bar` 4 segments 4px height + gap 6px — OK, tapi sangat tipis dan tanpa label "Langkah X dari 4". Fix: tambah counter text di atas bar.

### Mobile
- [MEDIUM] Step indicator tidak menampilkan step name — hanya bar. UX: user tidak tahu progress semantically. Add `<p>Langkah {n} dari 4: {title}</p>`.
- [LOW] `.calib-input { padding: 10px 12px }` — input number OK. `inputmode="decimal"` tidak diset → number keyboard not optimal. Fix: tambah `inputmode="decimal"` pada step-2 (temp).
- [LOW] Tombol "Kembali/Lanjut" `flex:1` 50/50 split — touch target OK (≥44px).
- [LOW] Step 3 review box `font-size: 13px; line-height: 1.8` readable.

---

# Summary

## Issues per severity
- **CRITICAL: 2** — hero-arrow positioning desktop (index.html), hero-dots overlap mobile (index.html)
- **HIGH: 15** — auth split-screen × 2, onboarding form 2-col mobile, landing slide overflow desktop, landing CTA-final, landing persona padding mobile, landing compare scroll hint, community grid 3-col desktop, community-channel double-id + width constrain × 2, ai-chat double-id + width constrain, subscription 3-col desktop, challenges grid desktop, device max-width desktop, calibrate max-width desktop
- **MEDIUM: 18** — onboarding shell width × 2, register desktop 2-col + keyboard overlap, login/register touch targets & inline validation, landing team img fallback, landing compare column, landing pricing badge, landing mobile clutter (floats/personas), community-channel input bar padding, ai-chat suggestions overlap, subscription plan-badge, device sensor-grid, calibrate step-name, sample.html bottom-nav desktop, community-channel topbar constrain
- **LOW: 6+** — minor a11y, error display, fallback states

## 3 halaman terburuk
1. **public/index.html** — 11+ issues; carousel arrows overflow container, hero-dots overlap, slide visuals undersized, persona mobile padding excess, comparison table no scroll hint, testimoni staggered heights.
2. **public/community-channel.html** — chat layout full-width tanpa container di desktop, double-id HTML invalid, input bar overlap last message saat textarea expand, message actions hidden di mobile (no hover).
3. **public/onboarding.html** — wizard form 2-col paksa di mobile narrow, shell max-width 540px terlalu sempit desktop, progress indicator triple (bar+counter+dots) redundant, fixed action bar width tidak match shell.

## Top 5 fix priority
1. **Landing hero carousel** (`index.html` — `.hero-arrow`, `.hero-dots`): pindahkan arrows ke dalam `.lp-container`, geser dots ke `bottom: 8px` di mobile, naikkan slide-visual `max-width` ke 520-580px.
2. **Auth split-screen desktop** (`login.html`, `register.html`): tambah `@media (min-width: 1024px)` grid 2-col di `.auth-shell` dengan brand-illustration di kolom kiri.
3. **Chat pages desktop width constrain** (`community-channel.html`, `ai-chat.html`): wrap `.ch-messages`/`.ai-messages` dan input bar dalam `max-width: 760px; margin: 0 auto` container. Sekalian fix double-id HTML invalid.
4. **Subscription + Challenges 3-col desktop**: tambah `.plans-grid` / `#challengeList` grid wrapper dengan `grid-template-columns: repeat(3,1fr)` di `@media (min-width: 1024px)`.
5. **Community channels 3-col desktop** (`community.html`): `.cm-list` `@media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr) }` + `.cm-hero` max-width 1100px.
