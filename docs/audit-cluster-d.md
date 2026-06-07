# Audit Cluster D — Research + Docs + Admin

Scope: 16 docs + 5 admin pages (21 total). Viewports: Desktop 1440×900 & Mobile 390×844.
Stylesheet baseline: `aervinex-ui.css` (mobile-first 440px shell), `desktop-responsive.css` (mengangkat shell ke 1000-1100px ≥1024px), `admin-ui.css` (grid 240px sidebar + 1fr).

## Total issues: 88

Breakdown: 9 CRITICAL · 27 HIGH · 38 MEDIUM · 14 LOW

---

## public/evidence.html

### Desktop
- [HIGH] `.ev-hero` hero (`padding:36px 28px`) penuh tapi heading `clamp(28px,4vw,40px)` di 1440px = 57px; jadi clamp tidak menaikkan ukuran melebihi 40px → hero terasa **kecil/kerdil** di canvas 1320px (`ev-shell` di ≥1440). Fix: tambah `body[data-page="evidence"] .ev-hero h1 { font-size: clamp(32px, 3.4vw, 52px) !important }` di desktop-responsive.css.
- [HIGH] `.ev-back` `position:sticky;top:16px;align-self:flex-start` di dalam `.ev-hero` yang `position:relative` + `display:flex;flex-direction:column` — sticky tidak akan berfungsi (parent flex tidak scrollable). Tombol akhirnya hanya absolute. Fix: pindah `.ev-back` ke luar `.ev-hero` atau ubah ke `position:fixed;top:90px;left:24px;z-index:50`.
- [HIGH] Mermaid `.mermaid` `min-height:200px` + `display:flex;align-items:center` di desktop dengan SVG `max-width:100%` → SVG kadang kosong putih besar (height tidak terpenuhi). Fix: `min-height:0` di ≥1024px atau `align-items:flex-start`.
- [MEDIUM] Independent test CTA card pakai `margin:0 14px 14px` (mobile-leftover) — di ≥1024 jadi tidak align dengan `.ev-shell` (1320px). Fix: `margin:0 auto 14px;max-width:1100px`.
- [MEDIUM] Tabel datasets (14 baris × 6 kolom) di `.ev-tbl-wrap{overflow-x:auto}` — di desktop muat tapi kolom "Digunakan untuk" akan **wrap awkward** karena tidak ada `min-width` row. Fix: `.ev-table { min-width: 880px; }`.
- [MEDIUM] TOC `.ev-toc` `auto-fit minmax(180px, 1fr)` menghasilkan 6+ kolom di 1320px → chip 180px terlalu lebar untuk teks 1-2 kata. Fix: `minmax(150px, 240px)` + `justify-content:start`.
- [LOW] `.ev-section h2` dibawah `eyebrow` tanpa `gap` margin atas — visual rapat.

### Mobile
- [HIGH] Mermaid `font-size:11px` di `<600px` tapi nodes flowchart `LR`/`TB` panjang (e.g., "Edge ML Inference<br/>ml-client.js") akan **overflow** horizontal. `overflow-x:auto` ada tapi target tap hilang. Fix: `mermaid svg { min-width: 100%; width: auto }` + scrollbar visible hint.
- [HIGH] `.ev-back` di mobile: tombol kiri-atas TAPI hero `text-align:center` → hero title tabrakan dengan tombol back ketika title 2-3 baris. Fix: `padding-top:60px` di hero mobile, atau pindahkan back ke `.topbar`.
- [HIGH] Stat-card grid SLR (`grid-template-columns:repeat(auto-fit,minmax(180px,1fr))`) di 390px → 1 kolom melar (label "Records initial" tidak readable). Fix: `minmax(140px, 1fr)` agar 2-col tampil.
- [MEDIUM] CTA card padding `18px` + content + emoji 36px → ketinggian 200px+ di mobile. Reduce padding.
- [LOW] Footer text-align center dengan link inline-block separator `·` kadang line-break aneh.

---

## public/ml-results-report.html

### Desktop
- [CRITICAL] `.actions-bar { position:fixed; bottom:14px; left:14px; right:14px }` → di 1440px full-width fixed bar terlihat **menutupi seluruh viewport bawah** termasuk konten. Tidak ada `max-width`. Fix: `max-width:1100px;left:50%;transform:translateX(-50%)` ATAU `right:auto;left:auto` dengan flex container.
- [HIGH] `.hero-test` margin `14px` (mobile leftover) → tidak align ke `max-width:1100px` di desktop-responsive override; perlu `body[data-page="ml-results-report"] .hero-test { margin: 14px auto !important }`.
- [HIGH] `.summary-grid` `1fr 1fr` (2-col) — di desktop seharusnya 4-col untuk 8 stat cells (Status/Models/Cases/Seed + Acc/F1/AUC/ECE). Saat ini = 4 baris × 2 kolom = terlalu vertikal. Fix: `@media (min-width:1024px){ .summary-grid { grid-template-columns: repeat(4, 1fr) } }`.
- [HIGH] `.results-table` tanpa `min-width` — 7 kolom (Disease + 6 metric) cocok desktop tapi kolom Disease bisa nge-stretch terlalu lebar. Fix: `min-width:760px` + `col-disease{width:30%}`.
- [MEDIUM] `.confusion-matrix` `grid-template-columns:80px 1fr 1fr` cocok mobile tapi di desktop detail panel terlihat **sempit** karena `.detail-panel { margin: 12px 14px }`. Fix: panel max-width align ke section.
- [MEDIUM] `.formula-box overflow-x:auto` baik, tapi rumus Wilson CI tidak akan wrap nicely di mobile (font-mono 12.5px).
- [LOW] Bottom-nav `.bottomnav` di desktop sebenarnya di-hide oleh sidepanel — duplikat nav.

### Mobile
- [CRITICAL] `.actions-bar` fixed bottom + `.bottomnav` fixed bottom → **konflik z-index/overlap**. Action bar `bottom:14px` di atas bottomnav (~64px). Tapi content `padding-bottom:96px` mungkin tidak cukup → konten kepotong.
- [HIGH] `.confusion-matrix` 80px label kolom + 2 cells = total min ~280px, cocok 390px tapi cell value `font-size:22px` + label `True Positive` di 1 cell terlihat sesak.
- [HIGH] Calibration SVG `width:100%;height:220px` — di mobile aspect rasio buruk + axis labels 9px tidak readable.
- [MEDIUM] `.section` padding 18px + `formula-box` mono 12.5px → rumus AUC trapezoidal akan break-line tengah simbol matematis.
- [MEDIUM] Hero `summary-grid 1fr 1fr` 8 cells = 4 baris, scroll panjang sebelum konten utama tabel.

---

## public/ml-improvement-plan.html

### Desktop
- [HIGH] `.section` `margin:14px` (tidak override desktop) → konten section tidak align di 1100px shell. Perlu margin auto.
- [HIGH] `.repo-grid { grid-template-columns: 1fr 1fr }` di desktop → hanya 2 kolom; idealnya 3-4 kolom di 1440px. Fix: `@media(min-width:1024px){ .repo-grid { grid-template-columns: repeat(3,1fr) } }`.
- [MEDIUM] `.toc-mini` chips menyebar full-width 1440px tanpa cap.
- [MEDIUM] `.formula-card` overflow-x:auto baik tapi `font-size:11.5px` mono kecil di 1440px.
- [LOW] `.correction-card` border-left 3px violet tertutup oleh padding 10px 14px — tidak balance.

### Mobile
- [HIGH] `.hero h1 font-size:22px` static (tidak clamp) → di 320px viewport tampak besar tapi di 414px tampak kerdil.
- [HIGH] `.badge-row` 4 verified badges (`✓ 33 papers verified` panjang) — di mobile akan **wrap menjadi 4 baris** karena `font-size:11px;padding:5px 10px`. Acceptable tapi padat.
- [MEDIUM] `.correction-card` `font-size:12.5px` dengan strike-through + nested links — readability rendah.
- [MEDIUM] Table `.table-summary` 4 kolom di 390px terlalu padat. Tidak ada `overflow-x:auto`. Fix wrap dalam `.admin-table-wrap` equivalent.

---

## public/aervinex-roadmap.html

### Desktop
- [HIGH] `.gantt-table { min-width:720px; overflow-x:auto pada .gantt-wrap }` — bagus, tapi di 1440px gantt jadi **terlihat kecil** (720px di canvas 1100px). Fix: di ≥1024 → `width:100%` tanpa min-width yang ketat, atau scale text.
- [HIGH] `.filter-bar` `position:sticky; top:50px; z-index:30; background:var(--bg)` — di desktop dengan persistent sidepanel kiri, top:50px tidak match topbar height. Bisa overlap content.
- [HIGH] `.impact-matrix aspect-ratio:1.1; max-width:520px` — di desktop terlihat sangat kecil di canvas. Fix: di ≥1024 → `max-width:720px`.
- [MEDIUM] `.hero-stats grid-template-columns: repeat(4,1fr)` ok di desktop tapi card `padding:10px 12px` + `num:22px` → terlihat compact untuk 1440px (perlu padding 18-20px).
- [MEDIUM] `.action-item` `padding:10px 12px` + flex gap → di 1100px 1-col list jadi terlalu lebar (readability >100ch).

### Mobile
- [CRITICAL] `.gantt-wrap { overflow-x:auto }` dengan `min-width:720px` → di 390px scrollbar tersembunyi; **no visual cue** user harus swipe. Fix: tambahkan fade gradient kanan + scroll-indicator.
- [HIGH] `.impact-matrix aspect-ratio:1.1` → 390-padding(28) = ~362×329 → impact dot 28px + label akan **overlap berat** di kuadran. Fix: `@media (max-width:600px){ .impact-matrix { display: none } + show table fallback}`.
- [HIGH] `.filter-bar sticky top:50px` di mobile — tidak ada topbar 50px! Sticky tertutup notch atau menggantung di tengah. Fix: `top:0`.
- [MEDIUM] `.hero-stats 2-col` ok tapi `num:22px` di mobile kecil untuk angka jutaan.
- [MEDIUM] `.cat-meta` (status badge + owner + effort) wrap → satu section header bisa 2-3 baris.

---

## public/datasets.html

### Desktop
- [HIGH] `.filter-bar` tidak `position:sticky` di file ini (unlike xai-audit/roadmap) — filter chips scroll dengan konten. Fix: tambah sticky.
- [HIGH] `.cluster` `margin:14px` static — di 1100px shell tidak align. Perlu `max-width:1100px;margin:14px auto`.
- [MEDIUM] `.item-card` `padding:12px 14px` + flex wrap → di 1100px terlihat sangat lebar (full-width single column). Fix: `@media(min-width:1024px){ .cluster-body { display:grid; grid-template-columns:repeat(2,1fr); gap:12px } }`.
- [MEDIUM] `.stats-grid` `repeat(4,1fr)` ok di desktop tapi card padding `12px 8px` minimal.

### Mobile
- [HIGH] `.cluster-body max-height:0` → `100000px` ketika `.open` — di mobile cluster (e.g. AFib dengan banyak items) bisa scroll sangat panjang. Tidak ada "show more". Acceptable tapi UX bisa diperbaiki.
- [HIGH] `.item-card .meta` flex-wrap mono 11px — di 390px badge DOI + PMID + metric akan **wrap 3 baris** tidak rapi. Fix: `font-size:10px` + `gap:6px`.
- [MEDIUM] `.filter-bar` tanpa overflow-x:auto → 5-6 filter chips di 390px akan wrap menjadi 2 baris.
- [MEDIUM] Cluster head `padding:16px 18px` + `h2` 16px + count badge — title panjang ("Sport+Fitness Methodology Audit") bisa overflow.

---

## public/xai-audit.html

### Desktop
- [HIGH] `.feat-table` tanpa `min-width` → 7+ kolom di desktop ok, tapi 4 stat cells `.stats-row 4-col` di 1440px berlebihan space.
- [HIGH] `.filter-bar { position:sticky; top:0 }` — tapi tidak ada topbar offset di desktop (sidepanel handles brand). Saat scroll, filter sticks ke browser top, **menumpuk dengan browser address bar/notch**. Fix: `top: 12px` + add backdrop.
- [MEDIUM] `.section { margin:14px }` tidak align dengan shell.
- [MEDIUM] `.level-legend { grid-template-columns:repeat(4,1fr) }` baik, tapi card `padding:12px` + heading 12px sedikit kerdil di 1440px.

### Mobile
- [HIGH] `.feat-table` hide kolom 4/5/6 di `<760px` — bagus, tapi user tidak tahu data tsb existed (no "show more cols" hint). Fix: badge "+3 fields" yang expand.
- [HIGH] `.filter-bar sticky top:0` di mobile tapi tidak ada extra padding-top di konten → header tabel pertama bisa tersembunyi.
- [MEDIUM] `.level-legend grid-template-columns:1fr 1fr` di `<700px` — 4 cards × 2 baris jadi long.

---

## public/about.html

### Desktop
- [HIGH] Page tidak ada `data-page="about"` di desktop-responsive override → `.app-shell` 1100px tapi konten list-row designed 440px-mobile-first → list-row jadi very wide (avatar+title+sub stretched).
- [MEDIUM] Hero card `text-align:center;padding:32px 20px` ok tapi h1 `letter-spacing:4px` 28px tidak balance dengan dot 18px di 1100px canvas.
- [LOW] Build info table 4 baris di 1100px terlihat sangat sparse.

### Mobile
- [LOW] Generally good — typical 440px shell mobile-first.
- [MEDIUM] `aura-amber` paragraph dengan novelty acronyms inline `DLSFA · TEPRS · ...` 11px → tidak readable, line-wrap awkward.

---

## public/help.html

### Desktop
- [HIGH] `.faq-q` font-size 14px di 1100px shell → terlihat kerdil untuk header FAQ.
- [HIGH] `.cat-chip` horizontal scroll container `overflow-x:auto` — di desktop bisa muat semua tanpa scroll, tapi style horizontal-scroll-friendly tetap dipakai → scrollbar fantom.
- [MEDIUM] Search input `.search-input` widht 100% di 1100px shell sangat lebar (1000px+) — typical UX search bar max 600px.
- [MEDIUM] FAQ items 10-15 di single column 1100px = readability >100ch.

### Mobile
- [LOW] Generally ok mobile-first.
- [MEDIUM] `.faq-a max-height:300px` ketika `.open` — jawaban panjang (e.g. troubleshoot baterai) bisa terpotong. Fix: `max-height:none` dengan transition.

---

## public/privacy.html

### Desktop
- [HIGH] `body[data-page="privacy"] .app-shell { max-width:1000px }` di desktop-responsive — tapi konten privacy adalah **setting toggles + list rows**, BUKAN long-form text. Ini OK karena 1000px = setting layout. Fine.
- [MEDIUM] `.setting-row` toggle right-align di 1000px → toggle terisolasi jauh dari title. Fix: setting card max-width 720px.
- [LOW] "Zona Berbahaya" card di canvas 1000px terlihat lebar dengan 2 buttons block.

### Mobile
- [LOW] Generally good.
- [MEDIUM] List-rows dengan `tbl-status` tag bisa overflow di 320px.

---

## public/privacy-policy.html

### Desktop
- [CRITICAL] **Long-form legal text** dalam `.app-shell` (default 440px → desktop-responsive: no override untuk `privacy-policy`) → konten privacy-policy `data-page="privacy-policy"` tidak ada di selector. Cek: hanya `privacy` (tanpa `-policy`) yang ada. Konten muncul di shell **440px statis** (max-width default aervinex-ui.css) di desktop → buang space besar di kanan/kiri.
- [HIGH] `.legal-content { padding: 24px }` lalu `p, li { font-size:13px; line-height:1.65 }` — readability **target 60-75ch** tidak tercapai di 440px (~50ch). Fix: `max-width:720px;margin:0 auto` + override desktop.
- [MEDIUM] `<ul>` `padding-left:22px` — nested list tidak ada styling.

### Mobile
- [MEDIUM] OK tapi font 13px untuk legal text border-line readable (12px lebih biasa untuk T&C). Acceptable.

---

## public/terms.html

### Desktop
- [CRITICAL] **Sama persis dengan privacy-policy.html** — `data-page="terms"` TIDAK ada di desktop-responsive selector. App-shell stuck di 440px di 1440px viewport. Konten terms 11 sections lebar 440px = waste of space + readability buruk (anti-pattern long-form).
- [HIGH] `.legal-content` tidak ada `max-width:720px` for readability. Fix: tambah override.
- [MEDIUM] List-style default (`disc`) tidak distinct dari surrounding text.

### Mobile
- [LOW] OK.

---

## public/security.html

### Desktop
- [CRITICAL] **Sama** — `data-page="security"` tidak di desktop-responsive override. Stuck 440px.
- [HIGH] `.legal-content table { width:100%; font-size:12.5px }` — tabel subprocessor/encryption matrix di 440px sangat sempit, kolom overflow.
- [HIGH] `.legal-content .pgp-block { white-space:pre-wrap; overflow-x:auto }` — PGP key di 440px wrap → format rusak.

### Mobile
- [MEDIUM] PGP block readable berkat overflow-x.
- [MEDIUM] Table di 390px akan horizontal overflow karena width:100% tapi tidak ada wrapper.

---

## public/consent.html

### Desktop
- [CRITICAL] `data-page="consent"` tidak di desktop-responsive. App-shell 440px statis.
- [HIGH] `grid-template-columns:1fr 1fr` untuk Agree/Decline button — di 440px ok, di 1100px desktop (if override added) terlalu lebar.

### Mobile
- [LOW] Good.

---

## public/live-data.html

### Desktop
- [HIGH] `data-page="live-data"` tidak di desktop-responsive selector → app-shell 440px statis. Real-time vitals dashboard yang harusnya benefit dari widescreen (live chart, multiple panels).
- [HIGH] `.live-grid { grid-template-columns: 1fr 1fr }` — desktop perlu 4-col (HR/SpO2/PM/UV). Fix: `@media(min-width:1024px){ .live-grid { grid-template-columns: repeat(4,1fr) } }`.
- [MEDIUM] `.live-svg height:60px;width:100%` di 1100px → polyline stretch buruk aspect ratio.

### Mobile
- [HIGH] `.live-grid 1fr 1fr` di `>480px` (mobile besar), `1fr` di `<480px` → 4 cards × 1 col di 390px = scroll panjang.
- [MEDIUM] Status section + last update + sample count di mobile cukup ok.

---

## public/ae-report.html

### Desktop
- [CRITICAL] `data-page="ae-report"` tidak di desktop-responsive. Form fields di shell 440px statis di desktop.
- [HIGH] Form labels + inputs full-width 440px ok mobile, tapi di desktop ideal max-width 600px untuk readability.
- [MEDIUM] Textarea `rows:5` + select `padding:10px 12px` — input height inconsistent (textarea pakai font-size inherit dari `font:inherit`).

### Mobile
- [LOW] Form generally good.

---

## public/health-bridge.html

### Desktop
- [HIGH] `data-page="health-bridge"` tidak di desktop-responsive. Shell 440px.
- [MEDIUM] `.bridge-tile { padding:18px; display:flex; gap:14px }` — bridge cards (Garmin/Apple/Fitbit) di 440px ok, di desktop perlu grid 2-col.

### Mobile
- [LOW] Good.

---

## public/admin/index.html

### Desktop
- [HIGH] `.admin-shell { grid-template-columns: 240px 1fr; max-width:1600px }` ok, TAPI tidak ada `min-width:0` di `.admin-main` parent grid track → di `.cols-2-1` chart card SVG bisa **force expand** kolom mengabaikan `1fr`. Fix: sudah ada `min-width:0` di `.admin-main` — tapi nested grids juga butuh. Verify.
- [MEDIUM] `.kpi-grid auto-fit minmax(200px,1fr)` di canvas 1360px (1600-240) → 4 cards menjadi 6 cards crammed jika viewport >1700. Cap dengan `max-columns` or `minmax(220px,1fr)`.
- [MEDIUM] Chart-card `.chart-svg viewBox="0 0 320 120" preserveAspectRatio="none"` → stretch ke 100% width × 120px = aspek aneh di canvas 800px+.
- [LOW] Activity feed (`#activityFeed`) panjang vs chart card bisa membuat row tidak balance.

### Mobile
- [HIGH] `@media (max-width:900px)` collapse sidebar → ok. Tapi `.kpi-grid auto-fit minmax(200px,1fr)` di 390px → 1 col, 4 cards vertikal scroll panjang. Fix: `minmax(150px,1fr)` agar 2-col.
- [HIGH] `.admin-cols.cols-2-1 grid-template-columns:1fr` di mobile — chart card SVG aspect-ratio terjaga? Tidak ada overflow check, tapi `chart-svg` `preserveAspectRatio:none` artinya akan stretch — visual rusak.
- [MEDIUM] Header actions (theme toggle + notif + logout) cramp di 390px setelah hamburger + title.

---

## public/admin/users.html

### Desktop
- [HIGH] `.admin-table { min-width:700px }` ok untuk fit, TAPI dengan 7 kolom (Pengguna/Role/Device/Last Active/TEPRS/Status/action) di 1360px main area → kolom Pengguna (avatar+name+email) bisa terlalu sempit. Fix: tambah `colgroup` widths.
- [HIGH] `.filter-bar { display:flex; gap:10px; flex-wrap:wrap }` dengan `.filter-search { min-width:240px; flex:1 }` + 2 filter-selects — di 1360px filter-search melar terlalu lebar. Fix: `max-width:400px` untuk search.
- [MEDIUM] Pagination `Halaman 1 / 1,037` + buttons text 11px → kerdil di canvas.
- [MEDIUM] `tbl-action` 32×32 single icon — di desktop bisa lebih jelas dengan label "Detail" hover.

### Mobile
- [HIGH] `.admin-table-wrap { overflow-x:auto }` + `min-width:700px` → horizontal scroll di 390px. **Tidak ada visual hint** untuk scroll. Fix: scroll shadow gradient.
- [HIGH] `.filter-bar wrap` 1 search + 2 selects → 3 rows di mobile, eat vertical space.
- [HIGH] Pagination text + buttons cramp; "Menampilkan 12 dari 12,438 user" + page label + 2 arrow buttons di 390px wrap atau overflow.
- [MEDIUM] Table sticky thead `position:sticky; top:0` — di mobile when scrolling horizontal table, thead vertical sticky tidak match horizontal scroll cell alignment.

---

## public/admin/ml-models.html

### Desktop
- [HIGH] Table 9 kolom (Model/Type/Version/Acc/F1/Inf/Trained/Status/action) — `.admin-table min-width:700px` mungkin tidak cukup; di 1360px ok tapi packed. Fix: `min-width:880px`.
- [HIGH] Confusion matrix `display:grid;grid-template-columns:80px repeat(4,1fr)` di card `.cols-1-1` (half-width) → di 1360/2≈680px main col, matrix cell jadi small text 11px. Acceptable tapi cramped.
- [MEDIUM] Drift chart SVG `preserveAspectRatio="none"` di 160px height stretch buruk.
- [MEDIUM] `.kpi-icon` emoji vs SVG (index.html pakai SVG, ini pakai emoji) → **inkonsistensi** style.

### Mobile
- [CRITICAL] Confusion matrix 5-col grid (80px + 4 cells × ~70px each) = ~360px min — fit 390px tapi cell font 11px tidak readable. Fix: matrix di mobile → list view ATAU `overflow-x:auto` wrap.
- [HIGH] Table 9 kolom horizontal scroll di mobile, no scroll hint.
- [MEDIUM] KPI grid 1-col scroll panjang di mobile.

---

## public/admin/alerts.html

### Desktop
- [HIGH] `.cols-2-1` (Compose 2fr · Templates 1fr) → di canvas 1360px Compose form 900px wide. Form inputs tidak `max-width` → input text full-width terlalu lebar.
- [MEDIUM] Severity buttons (Info/L1/L2/L3) di flex gap 8px → di compose card 900px lebar, button cluster terlihat kerdil di tengah.
- [MEDIUM] Templates list `.list-row` di 1/3 col → ok.
- [MEDIUM] History table 6 kolom — col Title bisa terlalu sempit.

### Mobile
- [HIGH] `.cols-2-1` → 1fr (collapse). Compose form + Templates jadi stacked → scroll panjang.
- [HIGH] Severity 4 buttons di mobile flex tidak wrap properly → tombol overflow horizontal? Cek `<button class="btn-pill">` — flex parent tidak wrap, akan **overflow viewport**.
- [HIGH] Table 6 kolom min-width 700px → scroll horizontal.
- [MEDIUM] Textarea `rows:3; resize:vertical; border-radius:18px` di mobile ok.

---

## public/admin/devices.html

### Desktop
- [HIGH] Table 7 kolom (Device/Owner/FW/Battery/LastSync/Status/action) — Battery col punya inline `<div width:50px>` battery bar + percent text, total ~120px. OK.
- [HIGH] KPI grid 4 cards `auto-fit minmax(200px,1fr)` ok di 1360px = 4-col.
- [MEDIUM] Filter bar (search + 2 selects) sama issue dengan users.html.
- [MEDIUM] Tidak ada pagination (10 items demo) — di real data jadi issue.

### Mobile
- [HIGH] Battery bar 50px width inline + percentage → di mobile table horizontal scroll, battery col cramp.
- [HIGH] Sama: table 7 col min-width 700px, no scroll indicator.
- [MEDIUM] KPI 4 cards 1-col di mobile.

---

## SUMMARY · Top Issues

### 3 halaman terburuk
1. **terms.html / privacy-policy.html / security.html** — TRIPLET legal pages, semua data-page TIDAK ada di desktop-responsive override → konten long-form text stuck di shell 440px di desktop 1440px viewport. Readability anti-pattern (legal text terlalu sempit, waste of space). **Solusi seragam**: tambah `body[data-page="terms"] .app-shell, body[data-page="privacy-policy"] .app-shell, body[data-page="security"] .app-shell { max-width: 800px !important }` + `.legal-content { max-width:720px;margin:0 auto }`.

2. **ml-results-report.html** — `.actions-bar position:fixed` full-width di desktop + konflik bottomnav di mobile + summary-grid hanya 2-col di desktop padahal 8 stats butuh 4-col. Halaman test runner ini critical untuk evidence.

3. **aervinex-roadmap.html** — Mobile gantt overflow tanpa scroll hint + impact-matrix dot overlap di 390px + filter-bar sticky `top:50px` mis-aligned dengan absent topbar di mobile.

### Top 5 Fix Priority (max ROI)
1. **CRITICAL · Legal pages width** — tambahkan 3 data-page selector ke `desktop-responsive.css` ≥1024 dengan `max-width:800px` + nested `.legal-content max-width:720px`. Affects: privacy-policy, terms, security, consent, ae-report, health-bridge, live-data.
2. **CRITICAL · ml-results-report.actions-bar** — wrap fixed bar `max-width:1100px;left:50%;transform:translateX(-50%)`. Avoid bottomnav overlap dengan `padding-bottom:160px`.
3. **HIGH · Admin table responsiveness mobile** — tambahkan scroll-shadow gradient + sticky first column untuk users.html / devices.html / ml-models.html agar horizontal scroll discoverable.
4. **HIGH · Sticky filter-bar offset** — `top` value yang konsisten dengan topbar height (mobile 0, desktop 12px with backdrop blur). Affects: datasets, xai-audit, aervinex-roadmap.
5. **HIGH · Mermaid + impact-matrix mobile fallback** — render text/table fallback di `<600px` untuk evidence (mermaid), roadmap (impact-matrix), ml-models (confusion-matrix). SVG/grid di mobile tidak readable.
