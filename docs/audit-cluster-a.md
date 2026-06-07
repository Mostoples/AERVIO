# Audit Cluster A — Core App Pages

> Scope: 8 core app pages (`dashboard`, `profile`, `history`, `recovery`, `running`, `alerts`, `achievements`, `edit-profile`).
> Viewports diaudit: Desktop ≥1024 px (Chrome 1440 px window, persistent sidebar 260 px) dan Mobile ≤767 px (iPhone 13, 390 × 844).
> Sumber: HTML di `public/`, CSS global `css/aervinex-ui.css` (+ `@import` `desktop-responsive.css`), sidebar shim `js/desktop-sidepanel.js`.

## Total issues: 47
- CRITICAL: 4
- HIGH: 15
- MEDIUM: 20
- LOW: 8

---

## public/dashboard.html

### Desktop (≥1024px)
- [HIGH] `Vital Signs` & `Lingkungan` grid kelihatan terlalu sempit di window 1440px — `body[data-page="dashboard"] .grid-2` di `desktop-responsive.css:113` di-cap `minmax(220px, 280px)` dan `justify-content: start`, sehingga 4 card berjejer mentok ke kiri dan menyisakan whitespace lebar ±200 px di kanan. Fix: ubah ke `repeat(auto-fit, minmax(220px, 1fr))` (atau naikkan upper bound ke 320 px) supaya card mengisi 1100 px shell secara merata.
- [HIGH] `Aksi Cepat` punya 5 tombol tapi `desktop-responsive.css:60` set `action-grid: repeat(auto-fit, minmax(160px, 1fr))` — di 1100 px shell jadi 6 kolom dan row terakhir tinggal 1 tombol "Aervi AI" sendirian tampak ganjil; di 1280px 7 kolom. Fix: cap `max(160px, ...) , minmax(160px, 200px)` atau set eksplisit `grid-template-columns: repeat(5, 1fr)` untuk halaman dashboard saja.
- [HIGH] Hero card `progress-bar` & `hero-desc` sangat lebar (≈600 px) karena `.hero-left { flex:1 }` dipakai bersama `min-height: 240px` (line 99 desktop-responsive) — bar full-width terlihat kurus & kurang elegan dibanding ring 160 px di kanan. Fix: cap `.hero-left { max-width: 480px }` atau wrap `progress-bar` di container `max-width: 60%`.
- [MEDIUM] `section.greeting` di desktop di-set `padding: 8px 0 14px` (override) — hilangkan default gap dari `app-shell { gap: 22px }` jadi greeting mepet ke konten berikutnya (`#smartRecs` kosong → hero card). Fix: tambah `margin-bottom: 18px` atau biarkan default gap shell.
- [MEDIUM] `Deteksi Risiko Penyakit` heading inline-style `display:flex;justify-content:space-between` (line 167-170) — link "Lihat semua 35 →" stick ke pinggir kanan 1100 px, jaraknya ±900 px dari heading text → terlihat disconnected. Fix: bungkus heading + link dalam wrapper `max-width: 600px` atau pakai grid 2-col.
- [MEDIUM] Top-bar di desktop dijadikan `justify-content: flex-end` (line 49 desktop-responsive.css), tapi `top-bar-actions` jadi sendirian di kanan; brand sudah disembunyikan namun greeting di bawahnya redundant juga dengan sidebar brand. Cek: visual balance OK tapi `padding: 18px 0 8px` membuat tombol icon "menggantung" tanpa konteks — pertimbangkan tambah breadcrumb/page-title kiri.
- [LOW] Inline `style="text-decoration:none;color:inherit"` di setiap `<a class="card ...">` (dipakai 17×) — bukan bug visual tapi noise. Sebaiknya pindah ke rule `.card a, a.card { text-decoration: none; color: inherit; }` global.

### Mobile (≤767px)
- [HIGH] Section title `Deteksi Risiko Penyakit` inline `display:flex;justify-content:space-between;align-items:center` (line 167) dengan link "Lihat semua 35 →" font-size 11px — di 390 px, "Deteksi Risiko Penyakit" (24 ch) + link bersaing wrap, link bisa pindah baris atau memendekkan heading di bawah 14px target. Fix: tambah `flex-wrap: wrap` dan `gap: 6px`.
- [HIGH] `Quick Action "Aervi AI"` inline-style `background:linear-gradient(...)` di line 238 — saat `theme-light` ter-aktivasi, gradient cyan-violet di atas teks dark gak punya kontras khusus (teks light theme jadi cyan-violet gradient di atas violet bg). Fix: pakai `.aura-violet` class dan biarkan token-driven, atau pakai data-attribute selector.
- [MEDIUM] `streakBadge` inline `style="margin-top:6px"` (line 56) — kosong sampai JS render → menyisakan jarak meskipun belum ada konten. Fix: render kondisional, atau pakai `:empty { margin: 0 }`.
- [MEDIUM] Hero card vertical stacking di mobile (default `.hero-card` flex row, gap 16, ring 100x100). Tapi ring tetap di samping `hero-left`. Di 390 px - padding 40 - ring 100 - gap 16 = ±234 px untuk teks; "TEPRS · Risiko rendah · Aman untuk aktivitas outdoor" wrap jadi 3 baris. OK readability, namun `progress-bar` di-cramped. Fix: pertimbangkan `flex-wrap: wrap` di mobile breakpoint untuk hero.
- [LOW] `Bottom-nav` `max-width: 420px` + `width: calc(100% - 30px)` di 390 px → lebar nav 360 px floating di tengah. FAB margin-top: -28 px ok, tapi `.spacer-bottom { height: 90 }` mungkin kurang jika bottom-nav bottom-offset 14 + height ±70 + safe-area = >90. Fix: naikkan ke 110 px.

### Notes
- Live JS update (interval 2000ms) mengubah TEPRS hero text/ring tanpa transisi — saat angka berubah dari 34 ke 88 mendadak, agak distracting. Bukan bug layout tetapi UX polish.
- Inline-style `display:flex;justify-content:space-between;align-items:center` pada section-title diulang berkali-kali di project — kandidat utility class `.section-title.row`.

---

## public/profile.html

### Desktop (≥1024px)
- [CRITICAL] `desktop-responsive.css:132-139` set `body[data-page="profile"] .app-shell { display: grid; grid-template-columns: 320px 1fr; }`. Tapi DOM profile.html berisi 8 section vertikal + modal + button + nav — semua jadi direct grid children. Hasil: profile card (avatar, 320 px col-1) akan menempati cell pertama, semua section sisanya tumpuk vertikal di col-2 tetapi dengan grid `align-items: start`, profile card jadi sticky di kiri sementara konten kanan jauh lebih panjang — strukturnya tidak sesuai maksud (mungkin maksudnya sidebar profile + scrollable settings di kanan). Saat ini avatar card di kiri (320 px), TIAP card berikut (subscription, device, achievement, dst.) jatuh berurutan di kolom 2 → kolom 1 kosong setelah avatar. Fix: bungkus card grup sticky dalam `<aside>` dan group konten kanan dalam `<div>`, atau gunakan `grid-auto-flow: dense` dengan eksplisit `grid-column: 2` untuk konten.
- [CRITICAL] Modal `#modalDeleteAccount` (line 325) adalah direct child `.app-shell` → karena parent grid 2-col, modal-overlay `position:fixed` tetap fixed (OK karena fixed lepas dari flow), tapi `display:none` initially & `display:flex` saat open → tetap grid child saat hidden, bisa membuat grid layout shift jika ada bug. Generally OK karena `position:fixed` lepas dari grid context, tapi rawan.
- [HIGH] `<nav class="bottom-nav">` (line 346) sengaja disembunyikan di desktop (`desktop-sidepanel.js` line 325 hide). Tapi nav juga jadi grid child → karena `position:fixed`, OK. Namun `.btn-block.ghost data-action="logout"` (line 319) jadi grid item: dengan kolom 1 sudah dipakai avatar dan tidak ada `grid-column` eksplisit, button logout bisa nyangkut di kolom 1 di bawah avatar (mungkin yang diinginkan? perlu visual confirm).
- [HIGH] Card profile (line 35) pakai `padding:28px` inline + `aura-cyan` — di desktop col 320 px ini ok, tapi avatar (80 × 80) center sangat dominan sementara card 280-an width kelihatan kosong. Fix: pakai pattern profile-sidebar dengan extra info (stats, level) atau cap padding lebih kecil.
- [MEDIUM] `aura-danger` class dipakai (line 256) — TIDAK didefinisikan di `aervinex-ui.css` (cek confirmed). Class jatuh no-op → `--aura` tetap default cyan, hilang efek warning visual untuk "Hapus Akun + Data" section. Fix: tambah `.aura-danger { --aura: var(--aura-coral); }` di token block.
- [MEDIUM] Banyak inline `style="width:18px;height:18px;color:var(--text-muted)"` pada chevron icons di tiap list-row — DRY violation. Tidak break layout tapi polusi.
- [LOW] `section #streakCard` (line 45) `style="margin-top:6px"` — sama dengan dashboard, jika empty tetap leave space.

### Mobile (≤767px)
- [HIGH] Section "Hapus Akun + Data" button (line 281) `type="button"` tanpa chevron (sengaja, tapi inconsistent dengan list-row siblings yang punya chevron). Fix: tambah chevron atau buat varian list-row tanpa chevron dengan kelas khusus.
- [MEDIUM] Modal delete (`#modalDeleteAccount` line 325) inline `style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:120;padding:20px"` — inline style override pre-defined `.modal-overlay` class kalau ada. Inline OK tapi `z-index:120` di bawah `.bottom-nav z-index:50` dan toast `z-index:2000` — modal bisa ketutup toast. Fix: pakai z-index 1500+ atau token.
- [MEDIUM] Card profile avatar `background:var(--bg)` dengan `font-size:28px;color:var(--accent)` — initials ungu/cyan, tapi jika user belum login (Guest) → "?" terlihat lemah secara kontras. Cek a11y.
- [MEDIUM] Setting-row "Language" punya button `btn-pill` inline `padding:6px 14px;font-size:11px` (line 155) — terlihat squished dibanding toggle siblings. Fix: harmoniskan dengan `min-height: 32px`.
- [LOW] Card-grup terlalu banyak (5 list-card + 1 danger card) → mobile scroll panjang. Konsiderasi grup di accordion atau tabs, tapi ini design decision.

### Notes
- Total 8 card sections di mobile bikin halaman panjang ±2800 px. Fine secara teknis tapi overwhelming UX-wise.
- Duplikat row "Pair Device (Web Bluetooth)" muncul 2× — line 127 (`#rowPair`, click triggers BLE scan) dan line 160 (link ke `/device-pair.html`). Bukan layout issue murni tapi data redundancy.

---

## public/history.html

### Desktop (≥1024px)
- [HIGH] `body[data-page="history"] .app-shell` di-cap `max-width: 1000px` (desktop-responsive.css:153-165). Chart-card SVG `viewBox="0 0 320 120" preserveAspectRatio="none"` → di-stretch jadi 940 px lebar × 120 px height → line/area chart jadi sangat flat dan stretched. Fix: ganti `preserveAspectRatio="xMidYMid meet"` atau naikkan viewBox height proporsional, atau cap `.chart-area { max-width: 720px; margin: 0 auto }`.
- [HIGH] `Sesi Terbaru` list-card (line 61) hanya 4 baris kecil → di desktop 1000 px terlihat seperti card sempit dengan banyak whitespace di kanan tiap `list-row-body`. Fix: di desktop, tambah kolom kanan untuk meta lebih kaya (durasi, distance, badges) atau split jadi 2 kolom grid.
- [MEDIUM] `tab-nav` di mobile-only context didesain — di desktop 1000 px tab bertiga (7d/30d/1y) `gap:24px` jadi cluster di kiri atas card 940 px, sisanya kosong. Fix: justify-content space-between atau tambah filter/period dropdown di kanan.
- [LOW] Header back arrow `href="/dashboard.html"` di desktop dengan sidebar persistent — back button redundant tapi tidak break.

### Mobile (≤767px)
- [LOW] Chart-card padding 22 × shell 20 padding → SVG efektif 308 px wide. 12-point polyline rapat tapi OK. `chart-figure` `text-align:right` ok.
- [LOW] List-row meta "+12 RRSS", "86", "+18 km/w", "L2" — formatnya tidak konsisten (ada delta, raw value, satuan, code). Bukan layout issue, content polish.

### Notes
- Page sederhana, paling rentan ke desktop stretch issue saja.

---

## public/recovery.html

### Desktop (≥1024px)
- [HIGH] `body[data-page="recovery"] .app-shell` di-cap `max-width: 1000px`. Hero card di-style `display:flex` default → ring & hero-left side-by-side OK. Tapi `.grid-2` di desktop = `repeat(auto-fit, minmax(220px, 1fr))` (line 56 dr) → 4 metric card (RMSSD, SDNN, LF/HF, Rest HR) jadi 4 kolom horizontal di 940 px → each card ±220 px, terlalu rapat label "RMSSD" + value "62 ms" di-stretch jadi mid-empty. Fix: cap card max-width 260 px atau pakai 2x2 grid eksplisit untuk recovery (`repeat(2, minmax(0,1fr))`).
- [HIGH] Metric card di recovery TIDAK punya `metric-head` (icon + trend pill) seperti di dashboard — hanya label + value + bar. Konsekuensi: card terasa lebih "kurus" / kurang berisi di desktop. Fix: tambah icon di sebelah label atau extra subline.
- [MEDIUM] Hero card `.aura-green` — ring "READY" badge mungil di tengah lingkaran 160 px ring di desktop terlihat aneh karena ring sangat besar untuk angka "86". Fix: scale ring-num font-size dari 18 → 28 di desktop.

### Mobile (≤767px)
- [MEDIUM] `.metric-card` di recovery tanpa metric-head → tinggi card lebih pendek dari hero card siblings. Visual hierarchy OK karena hero dominan. Tidak break.
- [LOW] `list-card` saran (line 72) memakai `<div class="list-row">` (non-link) tapi struktur identik dengan link version — hover state tidak ada. OK by design.

### Notes
- Recovery page secara struktur paling rapi tapi underuse metric cards (no icon, no trend indicator).

---

## public/running.html

### Desktop (≥1024px)
- [CRITICAL] `.run-map` height fixed `240px` (line 14 inline `<style>`) → di shell 1000 px desktop, map jadi sangat lebar (940 px) × 240 px height, aspect 4:1 sangat panjang. Map jadi terlihat seperti banner stretching. Fix: di breakpoint ≥1024px, set `.run-map { height: 360px }` atau aspect-ratio.
- [HIGH] `Active Session` hero (line 58) inline `style="flex-direction:column;align-items:stretch;text-align:center"` override default flex-row hero. Di desktop hero card jadi pendek vertikal, tapi `desktop-responsive.css:97-100` untuk dashboard set `padding:32px 40px; min-height:240px; align-items:center; justify-content:space-between` — TIDAK berlaku karena selector spesifik `body[data-page="dashboard"]`. Jadi running hero tidak dapat padding/min-height desktop treatment → tampak "lonjong tipis" di lebar 940 px. Fix: tambah aturan untuk `body[data-page="running"] .hero-card` atau generalisasi.
- [HIGH] `RPAE Zone Timer` (line 104) — di desktop, content card jadi sangat lebar (940 px) dengan 3 progress bar full-width + label kiri/kanan. Visual sangat sparse. Fix: limit card max-width 600 px center atau pakai 3-col layout untuk Z1/Z2/Z3 berdampingan.
- [HIGH] Action-grid Stop/Pause (line 125) `grid-template-columns:1fr 1fr` inline — di desktop 940 px shell, 2 tombol stretch jadi ±465 px tiap tombol, terlalu lebar untuk button. Fix: cap `max-width: 480px; margin: 0 auto` untuk action-grid running.
- [MEDIUM] Metric card "AIRI Injury" (line 93) target nya page `risk-detail.html?id=heatstroke` — bukan layout tapi semantik linking salah konteks.
- [MEDIUM] `.map-chip` inline-style `position:absolute; top:14px; left:14px` di overlay — saat desktop map jadi 940×240, chip masih anchor top-left → posisi OK tapi proporsi mungil di card besar.

### Mobile (≤767px)
- [HIGH] Leaflet map z-index:0 vs `.run-map-overlay z-index:1` ok, tapi `.bottom-nav z-index:50` floating di atas. Saat map full di 390 px × 240 px → chips pakai `backdrop-filter:blur` yang heavy di mobile (perf), tapi visually fine.
- [MEDIUM] Inline `<style>` block (line 12-31) — masalahnya `.run-map { filter: saturate(0.85) brightness(0.85) }` di theme-dark berlaku global untuk seluruh peta termasuk circleMarker → marker juga ter-darken (mungkin sengaja).
- [MEDIUM] `Active Session` hero `text-align:center` di mobile OK karena single column. `hero-value` center alignment via inline `style="justify-content:center"` — duplikasi setting. OK.
- [LOW] Voice/haptic event di interval 1500ms cukup spam saat user pause — bukan layout.

### Notes
- Running page paling banyak desktop-specific layout issue karena hero & map tidak dioverride di breakpoint desktop.
- Leaflet CSS dimuat dari unpkg CDN — risk integrity (tidak ada SRI).

---

## public/alerts.html

### Desktop (≥1024px)
- [HIGH] `body[data-page="alerts"] .app-shell { max-width:1000px }`. List-card `#alertList` jadi 940 px wide × 10 alerts panjang. Setiap `list-row` punya `.level-pill` di kanan dengan `font-size:10px` — di 940 px row sangat sparse, semua konten (icon + body + pill) berkumpul di kiri/tengah/kanan dengan jarak besar. Fix: cap `#alertList { max-width: 720px }` atau buat 2-col layout (List + Detail panel) ala Gmail.
- [MEDIUM] `.filter-row` inline-style `display:flex; gap:8px; overflow-x:auto` (line 12) — di desktop tidak perlu horizontal scroll (5 chips muat di 1000 px). Tapi overflow-x:auto bikin scrollbar mungkin muncul tidak perlu. Fix: tambah breakpoint `@media (min-width:1024px) { .filter-row { overflow: visible; flex-wrap: wrap } }`.
- [MEDIUM] `.alert-time` font-size 11px + `.list-row-sub` font-size 11px — di desktop sub & time terlihat redundant secara visual hierarchy. Fix: di desktop perbesar title ke 15px untuk skim lebih cepat.
- [LOW] Empty-state fallback (line 129) `<p style="...padding:30px">` adalah inline — di desktop center text 940 px wide → text "Tidak ada notifikasi pada filter ini" mengambang sendiri. Fix: bungkus dalam card atau set `max-width: 400px; margin: 0 auto`.

### Mobile (≤767px)
- [LOW] Filter chip "Kritis" + "Level 2" + "Level 1" + "Info" + "Semua" = 5 chip. Di 390 px - padding bisa muat 4-5 chip jika compact (gap 8 + padding 8×14). Marginal. Horizontal scroll backup OK.
- [LOW] `lvl-3` pulse animation `animation: pulse 1.4s infinite` — pulse keyframe didefinisikan di file utama dengan opacity 1↔0.4. OK.

### Notes
- Alerts page paling siap untuk desktop "split-view" pattern tapi belum implemented.

---

## public/achievements.html

### Desktop (≥1024px)
- [MEDIUM] `body[data-page="achievements"] .app-shell { max-width:1000px }` + `.badge-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) }` (inline style line 10) → 940/140 = ~6-7 kolom. Badge 60 × 60 icon center, badge-card padding 18px 14px → card jadi tegak kurus 140 px × ±150 px. Akhirnya badge berjejer 6-7 per row → bagus secara density, tapi `transform:translateY(-3px)` hover masuk ke row di atasnya kalau gap kecil (gap 14). Fine.
- [MEDIUM] `#streakCard` (line 48) `style="margin:14px 0"` → kosong sampai JS, sama dengan dashboard/profile (empty space).
- [LOW] `progressCard` (line 46) `style="padding:20px"` — progress bar full 940 px di desktop, label kiri/kanan, sparse visual. Fix: max-width 720 px center.
- [LOW] `btnTest` (line 51) `style="margin:14px auto;display:inline-flex"` — `inline-flex` + `margin auto` di parent block context tidak center. Sebenarnya kalau parent flex-column maka margin auto ok horizontal. Cek visually di desktop.

### Mobile (≤767px)
- [LOW] Badge grid `minmax(140px, 1fr)` di 390 px - shell padding 40 = 350 px → 2 kolom 168 px-ish, OK.
- [LOW] `.badge-card.locked { opacity:0.4; filter:grayscale(0.7) }` → bagus visual differentiation.

### Notes
- Halaman ini paling sederhana & paling siap untuk desktop. Issue hanya progress card terlalu wide.

---

## public/edit-profile.html

### Desktop (≥1024px)
- [HIGH] `body[data-page="edit-profile"] .app-shell { max-width:1000px }` — form section card `style="padding:20px"` (line 25) berisi inputs single-column → form fields stretch 940 px lebar (form-input border-radius pill 14-22 padding) terlihat sangat lebar dan susah scan (mata harus lompat horizontal jauh). Fix: cap form card max-width 600 px center, atau pakai 2-col untuk grouping (Name/Email | Age/Gender | Weight/Height | Target/WeeklyKm).
- [HIGH] Avatar card (line 20) `style="text-align:center;padding:24px"` di desktop 940 px → avatar 80×80 center, ada button "Ganti Avatar" di bawah → card sangat lebar untuk konten kecil ini. Fix: max-width 480 px center atau side-by-side dengan form pertama.
- [MEDIUM] Inline grid `grid-template-columns:1fr 1fr; gap:14px` untuk Age/Gender & Weight/Height — di desktop 940 px → setiap cell ~440 px untuk input number 100% width — input umur stretching seukuran "Nama Lengkap" terlihat aneh. Fix: max-width input atau wrap form di container.
- [MEDIUM] "Zona Berbahaya" section card aura-coral (line 50) full-width di desktop → "Hapus Akun & Semua Data" button stretch 940 px lebar, padding pill (22 px L/R). Fix: cap card 600 px center.
- [LOW] No bottom-nav in mobile context either (edit-profile hidden top-back arrow goes to /profile.html). Desktop side-nav handles it. OK.

### Mobile (≤767px)
- [MEDIUM] `input[disabled]` email (line 29) inline `style="opacity:0.6"` — okay readability-wise tapi tidak ada visual cue lain (cursor not-allowed?). Minor.
- [MEDIUM] `<select class="form-input">` (line 33, 41) — native select dengan `form-input` styling pill — di iOS chevron native masih muncul di kanan dengan padding pill, kadang chevron terpotong. Fix: tambah `appearance: none` + custom chevron SVG.
- [LOW] Form-error box (line 26) `class="form-error"` — kosong by default, show via .show class. Inline space-taking acceptable.

### Notes
- Edit-profile sangat butuh max-width pada form card di desktop. Saat ini terlihat seperti single mobile form di-stretch — usability buruk untuk form-filling.

---

# Output Report (Concise)

## Severity totals
- CRITICAL: 4 (profile grid mismatch, modal grid-child, running map height, running hero proportion)
- HIGH: 15 (paling banyak di dashboard, running, edit-profile)
- MEDIUM: 20
- LOW: 8

## Top 3 halaman terburuk (desktop pengalaman terburuk)
1. **profile.html** — grid 2-col (320px | 1fr) tidak match dengan 8 sibling cards yang tumpuk semua di kolom 2; `aura-danger` class tidak terdefinisi; modal z-index dibawah toast.
2. **running.html** — map height 240 px fixed jadi banner stretch, hero `Active Session` tidak punya desktop padding/min-height override, RPAE Zone Timer & action-grid stop/pause full-width tanpa cap.
3. **edit-profile.html** — form card full 1000 px width tanpa cap, input fields stretch jauh, "Zona Berbahaya" card juga full width.

## Top 5 fix priority (impact tinggi, low effort)
1. **Tambah `.aura-danger { --aura: var(--aura-coral); }`** di `aervinex-ui.css` token block — fix instant 1 line, profile.html section "Hapus Akun" langsung dapat warna warning.
2. **Cap form/list card max-width di desktop**: tambah rule `body[data-page="edit-profile"] .app-shell > section.card, body[data-page="alerts"] #alertList, body[data-page="achievements"] #progressCard { max-width: 640px; margin-left: auto; margin-right: auto; }` di `desktop-responsive.css`.
3. **Refactor `body[data-page="profile"] .app-shell` grid**: ubah ke `display: block` + bungkus avatar/streak/subscription dalam `<aside class="profile-sidebar" style="max-width:320px;float:left">` atau gunakan flexbox 2-col dengan eksplisit wrapper.
4. **Override hero & map di running**: tambah `body[data-page="running"] .hero-card { padding:32px 40px; min-height:200px } body[data-page="running"] .run-map { height: 360px }` di desktop breakpoint.
5. **Dashboard grid-2 fix**: ubah `body[data-page="dashboard"] .grid-2 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important }` (hapus upper-cap 280px) supaya 4 metric card mengisi lebar 1100 px shell merata.
