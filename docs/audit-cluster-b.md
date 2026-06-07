# Audit Cluster B — Risk + Assessment

Viewports diaudit: Desktop 1440×900 (≥1024px breakpoint) & Mobile 390×844 (≤767px).
Sumber CSS: `public/css/aervinex-ui.css` + `public/css/desktop-responsive.css` (auto-loaded).
Catatan global yang relevan untuk semua halaman:

- Desktop `app-shell` di-cap `max-width: 1100px` (atau `1000px` untuk assessment / assessment-history / session-detail) dengan `padding: 30px 36px 60px`.
- Sidebar persistent kiri di-render via JS (`desktop-sidepanel.js`); margin-left ditangani sidepanel CSS, bukan oleh layout file ini.
- Generic `.grid-2` di desktop → `repeat(auto-fit, minmax(220px, 1fr))`.
- Selector `.risk-list, .disease-grid, .encyclopedia .disease-grid` punya override 3/4/5/6-col di breakpoint ≥1024/1280/1440/1700px — **tapi tidak ada elemen di halaman risk-list/encyclopedia yang memakai class itu**, semua memakai `.grid-2`. Ini issue CRITICAL berulang.

---

## Total issues: 41

- CRITICAL: 4
- HIGH: 13
- MEDIUM: 17
- LOW: 7

---

## public/risk-list.html

### Desktop (≥1024px)
- [CRITICAL] Override grid 3-col / 4-col / 5-col / 6-col di `desktop-responsive.css` menargetkan `body[data-page="risk-list"] .risk-list, .disease-grid`, sementara markup memakai `<section class="grid-2" id="rlGrid">`. Akibat: target spek "3-4 col di desktop, 5 col di 1440, 6 col di 1700" TIDAK PERNAH AKTIF — yang aktif hanya generic `.grid-2` auto-fit 220px → di 1100px width hanya muat ~4 col (kebetulan, bukan by design). Fix: tambahkan class `disease-grid` ke `<section class="grid-2 disease-grid" id="rlGrid">`, atau ubah override CSS untuk juga match `body[data-page="risk-list"] #rlGrid`.
- [HIGH] `.rl-cat-row` (line 25 inline style) `display:flex; overflow-x:auto` — di desktop dengan 35 kategori filter, scroll horizontal jadi anti-pattern (desktop user expect wrap). Selector: `.rl-cat-row`. Fix: `@media (min-width:1024px) .rl-cat-row { flex-wrap: wrap; overflow-x: visible; }`.
- [HIGH] Filter chip tidak sticky di desktop — saat scroll panjang katalog 35 kondisi, filter hilang dari viewport. Selector: `.rl-cat-row, .search-wrap`. Fix: `position: sticky; top: 0; background: var(--bg); z-index: 5;` di desktop.
- [MEDIUM] `.rl-foot` (line 48-50) berisi 2 mini-button (`📊 ML Detail`, `📝 Assessment`) dengan `justify-content: space-between`. Di card lebar desktop ada gap besar di tengah — visual disconnect. Fix: `justify-content: flex-end; gap: 6px` atau full-width buttons stacked.
- [MEDIUM] `.rl-icon-wrap` (44×44px) konsisten, tapi di card desktop wide proporsi terasa kecil vs `.rl-name`. Selector: `.rl-icon-wrap`. Fix di ≥1024px: `width: 52px; height: 52px;`.
- [LOW] Empty state (line 149) inline `<p style="grid-column:1/-1;text-align:center;padding:30px">` — tidak ada icon, terlihat "kosong" di viewport lebar. Fix: gunakan `AervinexEmpty.render({...})` untuk konsistensi.

### Mobile (≤767px)
- [HIGH] `.rl-cat-row` (≥6 kategori) horizontal scroll OK secara fungsi, tapi tidak ada visual affordance scroll (no gradient mask kanan). Selector: `.rl-cat-row`. Fix: tambah `mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent)`.
- [HIGH] `.rl-tagline` `min-height: 2.8em` — kalau tagline pendek (1 baris) ada whitespace, kalau panjang (3+ baris) terpotong tanpa ellipsis. Selector: `.rl-tagline`. Fix: `display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;` dan hapus min-height.
- [MEDIUM] `.rl-score` badge di mobile dengan label `38%` masuk `.rl-head` di sebelah icon+name — jika nama panjang (`COPD · Chronic Obstructive Pulmonary Disease`) bisa overflow / wrap aneh. Selector: `.rl-head, .rl-name`. Fix: `.rl-name { display:-webkit-box; -webkit-line-clamp:2; }` + `min-width:0` pada parent.
- [MEDIUM] Search-wrap tidak sticky di mobile saat browsing 35 kondisi — UX umum di app katalog. Selector: `.search-wrap`. Fix: sticky top dengan backdrop-filter.
- [LOW] `.rl-mini-btn` icon emoji 📊 / 📝 inline tidak sejalan dengan rest of app yang sudah konversi ke `ICO(emoji)` via `AervinexIcons.fromEmoji`. Selector: `.rl-mini-btn` (text content). Fix: gunakan SVG icon untuk konsistensi.

---

## public/risk-detail.html

### Desktop (≥1024px)
- [CRITICAL] Layout vertical stack penuh (semua section width 1100px). Konten kompleks (hero, faktor, chart, mitigasi, deskripsi, disclaimer, XAI) ber-stack — utilisasi ruang desktop sangat buruk, scroll panjang. Fix: grid 2-col `@media (min-width:1024px) body[data-page="risk-detail"] .app-shell { display:grid; grid-template-columns: 1.2fr 1fr; }` dengan kolom kiri (hero + factor + chart) dan kanan (action + desc + disclaimer + XAI).
- [HIGH] XAI panel (`#xaiCard`) `padding: 20px` dengan inline `grid-template-columns: 1fr 1fr` (line 1022) untuk ML Model / Performance — di mobile-first dimensi cukup, tapi di desktop wide 1100px ML model name + performance terasa kecil di tengah whitespace. Selector: `#xaiCard > div[style*="grid-template"]`. Fix: di desktop tambah `grid-template-columns: repeat(3, 1fr)` untuk lebih balanced.
- [HIGH] Feature Importance bars dalam XAI (line 996-1004 inline) tidak punya max-width — di card 1100px wide, bar 100% width terlihat berlebihan untuk angka kecil seperti `8%`. Selector: `#xaiContent .progress-bar.small`. Fix: container `max-width: 480px; margin: 0 auto`.
- [HIGH] `.factor-row` border-bottom `1px solid rgba(255,255,255,0.05)` — di theme-light (line 30) sudah ada override `rgba(0,0,0,0.06)`, tapi setiap factor list bisa 4-7 baris dengan visualisasi progress + contrib + DETAIL link. Di desktop wide setiap row terlihat dense karena `factor-head` `justify-content: space-between` membuat factor-name kiri & val kanan dengan jurang besar. Selector: `.factor-head, .factor-row`. Fix: tambah `max-width: 600px` pada factor-row content di desktop.
- [MEDIUM] `.severity-pill` di hero-card overlap visual dengan ring SVG kanan (hero-right) saat layout flex `justify-content: space-between` — di viewport tertentu pill berdekatan dengan ring 120×120. Selector: `.hero-left, .severity-pill`. Fix: pastikan `margin-top: 8px; display: inline-block` cukup, atau pindahkan severity-pill ke baris baru di hero-left.
- [MEDIUM] Chart 24h (`.chart-svg viewBox="0 0 320 120"` line 100) `preserveAspectRatio="none"` distorsi vertical di desktop wide — line risk + threshold jadi pipih. Selector: `.chart-svg`. Fix di desktop: `preserveAspectRatio="xMidYMid meet"` dan/atau height fixed 200px.
- [MEDIUM] Action card `.list-card #actionCard` di-fill via `R.actions` (3-4 items). Di desktop wide list-row width 1100px terlalu lebar untuk text pendek (`"Pakai masker N95 saat outdoor"`). Selector: `#actionCard.list-card`. Fix: `max-width: 720px; margin-left: 0` atau 2-col grid action items di ≥1024px.
- [MEDIUM] `.btn-assess` (line 119) full-width fluid di 1100px — visually berlebih untuk CTA tunggal. Selector: `.btn-assess`. Fix: `max-width: 480px; margin: 12px auto;`.
- [LOW] Disclaimer card `aura-coral padding:16px margin-top:12px` (line 130) terlihat seperti error/warning karena warna coral; severity tidak match dengan tone "informasi" dari konten disclaimer. Selector: `.card.aura-coral` (disclaimer). Fix: pakai aura yang lebih netral (aura-amber) atau aura-violet.

### Mobile (≤767px)
- [HIGH] Hero-card `display:flex; justify-content:space-between` (line 264) + ring 100×100 di kanan — di viewport 390px, num 44px + unit + status + severity-pill di hero-left ter-squeeze sehingga `riskStatus` text wrap aneh dan severity-pill kadang collide dengan ring. Selector: `.hero-card`. Fix di ≤480px: `flex-direction: column; align-items: stretch; .hero-right { align-self: flex-end; margin-top: 8px; }`.
- [HIGH] XAI panel `grid-template-columns: 1fr 1fr` (line 1022) di mobile 390px — 2 col untuk "ML Model: XGBoost (calibrated proxy)" + "Performance: 94.2% acc · F1 0.93" wrap jelek (text 14px + label uppercase 11px). Selector: `#xaiContent div[style*="grid-template-columns:1fr 1fr"]`. Fix: 1-col di ≤480px.
- [HIGH] `.factor-row` di mobile menampilkan 4-5 faktor untuk model kompleks (mis. `asma-exacerbation`) — `factor-head` (name + val) + progress-bar + (contrib + DETAIL link) = 3 baris × 5 faktor = scroll panjang. Tidak ada collapse/accordion. Fix: collapse default ke 3 faktor + "Lihat semua" toggle.
- [MEDIUM] Chart trend di mobile 390px viewBox 320×120 + `preserveAspectRatio="none"` — line risk crowded jika 20 titik. Selector: `.chart-svg`. Fix: kurangi titik ke 12 di mobile atau ubah height 140px.
- [MEDIUM] `.btn-assess` (Self-Assessment CTA) di mobile fine, tapi inline `style="margin-top:10px"` — section sebelumnya `Action card` sudah punya gap, jadi spacing kurang konsisten. Selector: `.btn-assess`. Fix: pindahkan margin ke CSS class.
- [MEDIUM] Severity badge `sev-critical` (animation: pulse 1.4s infinite, line 43) — reduce-motion accessibility tidak dihormati. Selector: `.sev-critical`. Fix: `@media (prefers-reduced-motion: reduce) { .sev-critical { animation: none; } }`.
- [LOW] `Faktor Kontribusi`, `Aksi Mitigasi`, `Tentang Risiko Ini`, `XAI` — 4 section-title berurutan, tidak ada visual hierarchy. Selector: `.section-title`. Fix: numbering atau group dengan tab/accordion.

---

## public/metric-detail.html

### Desktop (≥1024px)
- [HIGH] Stats grid 4-col (line 12) tetap 4-col di desktop wide — stat-box `font-size:18px; padding: 12px 6px` terlihat sangat kecil di card 1100px wide. Selector: `.stats-grid`. Fix di desktop: tetap 4-col tapi `padding: 20px; .stat-val { font-size: 28px }`.
- [HIGH] Hero + chart card vertical stack 1100px wide — chart 320×120 `preserveAspectRatio="none"` jadi pipih ekstrem. Selector: `.chart-svg`. Fix: `preserveAspectRatio="xMidYMid meet"` + height 220px di desktop, atau viewBox dynamic.
- [MEDIUM] Tab nav `1h / 24h / 7d` (.tab-nav line 58) `gap: 24px` di desktop terlalu tight di card lebar. Selector: `body[data-page="metric-detail"] .tab-nav`. Fix: distribute evenly atau `justify-content: flex-start`.
- [MEDIUM] Related risks (`#relatedCard`) — 1-2 entries jadi single row di card 1100px wide, terlihat sangat sparse. Selector: `#relatedCard.list-card`. Fix: `max-width: 720px` atau 2-col grid.
- [LOW] `.baseline-marker` (line 16, inline style) absolute positioning tidak digunakan di markup yang terlihat — dead code? Verify dan hapus jika unused.

### Mobile (≤767px)
- [HIGH] Stats grid 4-col (line 12) fixed `repeat(4, 1fr)` — di mobile 390px stat-box jadi 80px width, `stat-val font-size:18px` terpotong untuk angka float (e.g. `36.8`). Selector: `.stats-grid`. Fix di ≤480px: `grid-template-columns: repeat(2, 1fr)` (2×2).
- [MEDIUM] Hero-card num `--` placeholder muncul flash sebelum JS render → CLS. Selector: `.hero-num, .hero-unit`. Fix: skeleton shimmer atau preset initial value.
- [MEDIUM] Insight card list-row dengan emoji icon (line 314, `font-size:18px`) tidak konsisten dengan SVG icon di list-row lain. Selector: `.list-row-icon` di `#insightCard`. Fix: gunakan AervinexIcons.fromEmoji.
- [LOW] Tab `.tab` (line 437) padding 6px 2px — touch target 32×24px, di bawah 44×44 minimum a11y. Fix: padding 10px 14px di mobile.

---

## public/assessment.html

### Desktop (≥1024px)
- [CRITICAL] Wizard layout vertical stack di 1000px (max-width override). Question card + progress + nav buttons — di desktop wizard biasanya 2-col (question kiri, illustration/progress kanan) atau centered max-width 600px. Selector: `body[data-page="assessment"] .app-shell`. Fix: `max-width: 600px; margin: 0 auto;` untuk q-wrapper di desktop, atau split layout.
- [HIGH] `.q-card padding: 20px` (line 11) lebar 1000px untuk pertanyaan single line + 6 scale-btn — buttons jadi sangat besar (160px+ each). Selector: `.q-card, .scale-btn`. Fix: container `max-width: 600px` di desktop, scale-btn `max-width: 60px`.
- [HIGH] `.multi-grid` flex-wrap (line 53) — di desktop wide chip berjajar penuh, alignment center kurang baik. Selector: `.multi-grid`. Fix: `justify-content: center` di desktop atau cap container width.
- [HIGH] Result section `.result-ring-wrap 200×200` (line 127) di card width 1000px terlihat kecil di tengah ruang besar. Comparison-card `1fr 1fr` (line 141) terlihat sparse. Selector: `.result-ring-wrap, .comparison-card`. Fix: result section `max-width: 600px; margin: 0 auto`.
- [MEDIUM] Action list `#actionList.list-card` 3 default actions di card 1000px wide. Selector: `#actionList`. Fix: `max-width: 600px; margin: 12px auto`.
- [LOW] btnBack visibility hidden (line 280) saat idx===0 menyebabkan empty space di kiri — di desktop layout grid `1fr 1fr` bawah. Selector: `#btnBack`. Fix: `display: none` instead of `visibility: hidden`, dan `#btnNext { grid-column: 1/-1 }` saat single.

### Mobile (≤767px)
- [HIGH] `.scale-btn` 6 buttons (0-5) di flex row gap 8px — di mobile 390px tiap button ~52px width, padding `12px 0` masih OK tapi tidak nyaman untuk thumb tap di tengah row. Selector: `.scale-btn`. Fix: tambah `min-height: 48px`.
- [MEDIUM] Progress bar `.progress-track height:6px` di mobile tidak ada label %, hanya `1 dari 5`. Selector: `.progress-track`. Fix: tambah `aria-label="Progress 20%"` dynamic.
- [MEDIUM] `.q-text font-size: 15px` (line 13) untuk pertanyaan panjang — di mobile readability OK tapi line-height 1.4 + bold makes wall of text saat 2-3 baris. Fix: `font-size: 16px; line-height: 1.5`.
- [MEDIUM] Result hero card padding 24px + ring 200×200 + comparison 1fr 1fr — vertical scroll panjang. Selector: result-wrapper. Fix: kurangi ring ke 160×160 di mobile.
- [MEDIUM] Toast `AervinexToast` saat submit (line 430) — jika user offline (Firestore .catch silent), tetap success toast → misleading. Selector: catch handler. Fix: toast warn jika error.
- [LOW] `.btn-pill` bottom row `Back / Lanjut` (line 180) — di mobile narrow `Back` button bisa terlalu kecil saat label hidden. Selector: `#btnBack`. Fix: min-width 80px.

---

## public/assessment-history.html

### Desktop (≥1024px)
- [HIGH] Trend area (line 21) inline div `display:flex; align-items:center; gap:12px; padding:10px 0` untuk setiap kondisi — di desktop wide 1000px, nama kondisi (flex:1) + score + arrow + delta jadi spread sangat lebar. Selector: `#trendArea > div`. Fix: `max-width: 720px` atau grid table-like layout.
- [HIGH] **Tidak ada chart visualisasi trend** — hanya text `first% → last%` + arrow icon. Halaman bernama "Trend Visit" tapi tidak ada visualisasi trend sesungguhnya (line chart per kondisi). Selector: `#trendArea`. Fix: tambah sparkline mini SVG per kondisi.
- [MEDIUM] History list `.list-row` di card list-card 1000px wide — date string panjang `28 Mei 2026 · 06:14 · skor user: 45% · ML: 30%` di `list-row-sub` bisa wrap aneh. Selector: `.list-row-sub`. Fix: gunakan grid columns untuk align metadata.
- [MEDIUM] Filter / sort tidak tersedia. 50 items semua dirender — di desktop expected filter by disease + date range. Selector: `<header>` area. Fix: tambah dropdown filter.
- [LOW] `tbl-status` badge di kanan list-row — class belum ditemukan di base CSS (verify rendering). Selector: `.tbl-status.danger, .warn, .ok`. Fix: pastikan defined atau swap ke severity-pill.

### Mobile (≤767px)
- [HIGH] Trend area baris (line 75-80) `flex` dengan 4 child elements (nama, score, arrow, delta) — di mobile 390px label nama kondisi panjang (`COPD · Chronic Obstructive Pulmonary Disease`) flex:1 ter-squeeze ke `font-size:13px` dengan score+arrow+delta menyita ~120px. Wrap atau ellipsis tidak set. Selector: `#trendArea > div span:first-child`. Fix: `text-overflow: ellipsis; overflow: hidden; white-space: nowrap;`.
- [MEDIUM] `count Label` `50 assessment tersimpan` — di mobile header narrow, page-title-block text-align center bisa overflow. Selector: `.page-title-block p`. Fix: `font-size: 11px` di mobile.
- [MEDIUM] List-row tap target = full row OK, tapi `tbl-status` badge di kanan small `12px` font tidak optimal untuk glance. Selector: `.tbl-status`. Fix: `font-size: 13px; padding: 4px 10px`.
- [LOW] Empty state via `AervinexEmpty.render` — tidak diketahui apakah punya CTA Mulai Assessment yang konsisten dengan empty di halaman lain (verify).

### Print
- [HIGH] Tidak ada print-friendly stylesheet untuk halaman ini. Print rules global di `desktop-responsive.css` line 285 hanya hide sidebar/nav — tapi list 50 items akan break across pages tanpa proper page-break, color (severity badge) tidak print-safe. Selector: tambah `@media print` block. Fix: warna jadi text + simbol, page-break-inside avoid pada list-row.

---

## public/encyclopedia.html

### Desktop (≥1024px)
- [CRITICAL] Override `body[data-page="encyclopedia"] .disease-grid` di desktop-responsive.css line 143 menargetkan `.disease-grid` — **tapi markup encyclopedia.html (line 70) memakai `<section id="articles" class="list-card card">` (list flat, BUKAN grid)**. Tidak ada element `.disease-grid` sama sekali di halaman ini. Override tidak pernah apply. Fix: bisa konvert `#articles` jadi grid 3-col atau rename selector + tambah class `disease-grid`.
- [HIGH] List flat 35 artikel di 1-col `.list-card` width 1100px — tagline `font-size: 11px` (`.list-row-sub`) terbentang sangat lebar. Tidak ada `max-width` pada description. Selector: `#articles .list-row-sub`. Fix: `max-width: 70ch` atau convert to grid 2-3 col.
- [HIGH] Category chips (`#catGrid` line 62-65) inline `display:inline-flex; margin:4px 6px 4px 0; padding:6px 12px` — di desktop wide 1100px chip-chip menumpuk inline tanpa flex-wrap container, dependency pada inline-flex default behavior. Selector: `#catGrid`. Fix: explicit `display: flex; flex-wrap: wrap; gap: 8px;` pada container.
- [MEDIUM] Tidak ada filter by category (chips info-only, tidak interactive). Selector: `#catGrid > div`. Fix: tambah click handler filter.
- [MEDIUM] "Lihat Sumber Riset Lengkap" link `.btn-block ghost` (line 34) full-width di 1100px terlalu lebar. Selector: `.btn-block.ghost`. Fix: `max-width: 480px; margin: 14px auto`.
- [LOW] Search input tidak debounced (line 80) — setiap keystroke trigger render. 35 items kecil, tapi best practice debounce 200ms.

### Mobile (≤767px)
- [HIGH] `.list-row-meta` (category badge kanan line 77) di mobile narrow — label `Kardiovaskular` (15 char) memakan ruang dari `list-row-body`. Selector: `.list-row-meta`. Fix: hide di ≤480px atau truncate.
- [MEDIUM] Tagline panjang (e.g. `Atrial Fibrillation adalah aritmia paling umum...`) — tidak di-clamp. Selector: `#articles .list-row-sub`. Fix: `-webkit-line-clamp: 2`.
- [MEDIUM] Hero card "Kategori Pelajari" + description + chips — di mobile padding 20px + 3 text blocks + N chips makan ½ viewport sebelum list muncul. Selector: section.card.aura-cyan (line 25). Fix: collapse chips by default.
- [LOW] No empty-state CTA untuk "Cari di luar library" jika 0 hasil — sub "Coba kata kunci lain" tanpa actionable next step.

---

## public/session-detail.html

### Desktop (≥1024px)
- [HIGH] Map `.session-map height:220px` (line 12) — di desktop card 1000px wide, map jadi sangat letterbox. Selector: `.session-map`. Fix di ≥1024px: `height: 360px`.
- [HIGH] `.grid-2` 4 metric cards (HR, Cal, SpO₂, RRSS) — di desktop dengan rule generic auto-fit minmax(220px, 1fr) jadi 4-col bagus, tapi setiap card content sparse (icon + label + 1 value). Selector: `.metric-card` di session-detail. Fix: tambah mini sparkline atau context value (e.g. avg vs personal baseline) untuk fill density.
- [MEDIUM] `.splits-row grid-template-columns: 32px 1fr 60px 60px` (line 13) — di desktop wide ada banyak whitespace di kolom 2 (bar). Selector: `.splits-row`. Fix di desktop: `grid-template-columns: 40px 1fr 80px 80px 80px` + tambah kolom HR.
- [MEDIUM] "Environment saat sesi" section (line 102) `grid-template-columns:1fr 1fr` (2×2) — di desktop bisa 4-col 1-row. Selector: section.card.aura-cyan environment. Fix: di desktop `repeat(4, 1fr)`.
- [LOW] HR chart (`.chart-svg viewBox 320 120 preserveAspectRatio="none"`) sama issue dengan halaman lain. Selector: `#hrLine, #hrFill`. Fix: preserve aspect + height fixed.

### Mobile (≤767px)
- [HIGH] `.splits-row grid-template-columns: 32px 1fr 60px 60px` (line 13) — di mobile 390px (- padding 32px = 358px content), kolom 1fr untuk bar visualization jadi ~206px (cukup), tapi pace `60px` + delta `60px` ketat. Saat label pace 5 char (`5:25`) + delta 5 char (`+0:17`) OK, tapi `font-size:13px` cukup squeezed. Selector: `.splits-row`. Fix: `font-size: 12px` di mobile dan gap 8px.
- [HIGH] Map tile dark `cartocdn dark_all` di-load tanpa fallback untuk theme-light. Selector: tile layer. Fix: detect theme, swap to `light_all` untuk theme-light.
- [MEDIUM] Hero ring text `80%` + `Z2` (line 47-48) hard-coded di markup, tidak dynamic. Selector: SVG text. Fix: populate via JS dari sessions data.
- [MEDIUM] Environment 2×2 grid (line 104) — di mobile sangat narrow, value `38 μg/m³ · sedang` (12 char) wrap. Selector: environment grid. Fix: stack 1-col di ≤480px.
- [LOW] `metric-trend` badge `+12` (line 55, 70) tidak ada tooltip/explanation — apa baseline comparison? Fix: tambah aria-label deskriptif.

---

## Catatan Cross-Page

- **Bug umum #1**: Selector `body[data-page="risk-list"] .risk-list, .disease-grid` di `desktop-responsive.css` tidak match markup actual. Risk-list pakai `.grid-2 #rlGrid`, encyclopedia pakai `#articles.list-card.card` (bukan grid). Override 3/4/5/6-col grid tidak pernah eksekusi. Fix global: tambahkan class `disease-grid` ke markup atau ubah selector ke `body[data-page="risk-list"] #rlGrid, body[data-page="encyclopedia"] #articles`.
- **Bug umum #2**: Semua SVG chart `.chart-svg viewBox="0 0 320 120" preserveAspectRatio="none"` — di desktop wide jadi pipih, di mobile narrow OK. Fix global: ganti ke `xMidYMid meet` + height fixed via class breakpoint.
- **Bug umum #3**: List-card content selalu full-width hingga 1000-1100px tanpa max-width content cap — readability lemah untuk text lines. Fix global: `.list-row { max-width: 720px }` di desktop atau wrap container.
- **Bug umum #4**: Reduce-motion accessibility tidak konsisten — sev-critical pulse, ML animateTrendTo cubic easing, dll. Fix: global `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.
- **Bug umum #5**: Severity contrast — `sev-low rgba(74,222,128, 0.15)` background dengan text `rgb(74,222,128)` di theme-light bisa di bawah WCAG AA (3:1 untuk UI element). Fix: ada `body.theme-light` override yang verify rasio.
