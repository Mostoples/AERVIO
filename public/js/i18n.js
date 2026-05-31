/* AERVINEX i18n — bilingual ID ↔ EN dengan smart DOM walker + MutationObserver.
   API:
     AervinexI18n.lang          → 'id' atau 'en'
     AervinexI18n.setLang(l)    → switch + auto-translate + persist
     AervinexI18n.toggle()      → switch ID ↔ EN
     AervinexI18n.t('key')      → manual lookup
     AervinexI18n.apply()       → re-translate seluruh DOM
*/
(function () {
  'use strict';

  // ID → EN dictionary. Key = string Indonesia, value = English.
  // (Format ini memudahkan: existing HTML stays ID, translator hanya swap text saat EN active.)
  const DICT = {
    // ── Top-level navigation ─────────────────────────
    'Home': 'Home', 'Stats': 'Stats', 'Recovery': 'Recovery', 'Profile': 'Profile',
    'Dashboard': 'Dashboard', 'Risks': 'Risks', 'Achievements': 'Achievements',
    'Risiko': 'Risk', 'Bantuan': 'Help', 'Pengaturan': 'Settings',

    // ── Common buttons / actions ─────────────────────
    'Masuk': 'Sign in', 'Daftar': 'Sign up', 'Mulai Gratis': 'Start Free',
    'Mulai Monitoring': 'Start Monitoring', 'Daftar Gratis': 'Sign up Free',
    'Sudah punya akun': 'Already have an account', 'Belum punya akun?': "Don't have an account?",
    'Lihat Demo UI': 'View UI Demo', 'Lihat Fitur': 'See Features',
    'Buka Preview di Tab Baru ↗': 'Open Preview in New Tab ↗',
    'Lewati ke Landing': 'Skip to Landing',
    'Lanjut': 'Continue', 'Lanjut →': 'Continue →', 'Kembali': 'Back', 'Back': 'Back',
    'Skip': 'Skip', 'Selesai': 'Done', 'Selesai ✓': 'Done ✓', 'Simpan': 'Save', 'Batalkan': 'Cancel',
    'Tutup': 'Close', 'Mulai': 'Start', 'Stop': 'Stop',
    'Stop & Save': 'Stop & Save', 'Pause': 'Pause', 'Start Run': 'Start Run',
    'Mulai Run': 'Start Run', 'Mulai Monitoring': 'Start Monitoring',
    'Buat Akun': 'Create Account', 'Lanjutkan dengan Google': 'Continue with Google',
    'Daftar dengan Google': 'Sign up with Google',
    'Masuk sebagai Guest / Debug': 'Sign in as Guest / Debug',
    'Coba dulu sebagai Guest': 'Try as Guest first',
    'Lupa password?': 'Forgot password?',
    'atau': 'or', 'Konfirmasi Password': 'Confirm Password',
    'Email': 'Email', 'Password': 'Password', 'Nama': 'Name',
    'Nama lengkap': 'Full name', 'Minimal 6 karakter': 'Minimum 6 characters',
    'Ulangi password': 'Repeat password',
    'Buka Ticket': 'Open Ticket', 'Buka di Tab Baru ↗': 'Open in New Tab ↗',
    'Replay Tour': 'Replay Tour', 'Selanjutnya': 'Next',
    'Lihat semua 35 →': 'View all 35 →',
    'Lihat semua →': 'View all →', 'Detail →': 'Detail →',

    // ── Hero / Landing copy ──────────────────────────
    'AERVINEX adalah smartwatch untuk': 'AERVINEX is a smartwatch for',
    'pelari': 'runners', 'warga kota': 'urban dwellers',
    'Pelari & Atlet': 'Runners & Athletes',
    'Warga Urban & Komuter': 'Urban Dwellers & Commuters',
    'Untuk Pelari & Warga Urban': 'For Runners & Urban Dwellers',
    'Untuk Siapa?': 'Who is it for?',
    'Dua dunia, satu wearable.': 'Two worlds, one wearable.',
    'Tentang Project': 'About the Project',
    'Penelitian skripsi yang nyata.': 'Real thesis research.',
    'Berbasis Bukti': 'Evidence-Based',
    'ML Pipeline Lengkap': 'Complete ML Pipeline',
    'Open untuk Riset': 'Open for Research',
    'Energy Harvesting': 'Energy Harvesting',
    'Siap mencoba?': 'Ready to try?',
    'Mulai monitoring kesehatan Anda hari ini.': 'Start monitoring your health today.',
    'Gratis, berbasis WHO, didukung AI. Buat akun atau coba dulu sebagai Guest.': 'Free, WHO-aligned, AI-powered. Create an account or try as Guest first.',
    'Apa yang dilakukan AERVINEX': 'What AERVINEX does',
    'Lima sensor, satu ekosistem AI': 'Five sensors, one AI ecosystem',

    // ── Greeting ─────────────────────────────────────
    'Selamat datang,': 'Welcome,', 'Selamat pagi,': 'Good morning,',
    'Selamat datang di AERVINEX!': 'Welcome to AERVINEX!',
    'Live · Connected': 'Live · Connected',
    'Athlete': 'Athlete', 'Member': 'Member',

    // ── Section titles ───────────────────────────────
    'Vital Signs': 'Vital Signs',
    'Lingkungan': 'Environment',
    'Deteksi Risiko Penyakit': 'Disease Risk Detection',
    'Rekomendasi AI · Real-time': 'AI Recommendations · Real-time',
    'Aksi Cepat': 'Quick Actions',
    'Aksi Mitigasi': 'Mitigation Actions',
    'Tentang Risiko Ini': 'About This Risk',
    'Faktor Kontribusi': 'Contributing Factors',
    'Insight & Rekomendasi': 'Insights & Recommendations',
    'Terkait Risiko Kesehatan': 'Related Health Risks',
    'Statistik 24 Jam': '24-Hour Statistics',
    'Sesi Terbaru': 'Recent Sessions',
    'Riwayat Broadcast (30 hari)': 'Broadcast History (30 days)',
    'Aktivitas Terbaru': 'Recent Activity',
    'Top BMKG Stations': 'Top BMKG Stations',
    'System Health': 'System Health',
    'Disease Risk · 24 jam': 'Disease Risk · 24 hours',
    'Trend Visit': 'Visit Trend',
    'Semua Riwayat': 'All History',
    'Semua Artikel': 'All Articles',
    'Kategori Pelajari': 'Learn by Category',
    'Onboarding Tour Analytics': 'Onboarding Tour Analytics',

    // ── Vital signs metrics ──────────────────────────
    'Heart Rate': 'Heart Rate',
    'Oksigen Darah': 'Blood Oxygen',
    'Respiratory': 'Respiratory',
    'Hidrasi': 'Hydration',
    'UV Index': 'UV Index',
    'PM2.5': 'PM2.5',
    'Heat Index': 'Heat Index',
    'Steps': 'Steps',
    'Calories': 'Calories',
    'Avg HR': 'Avg HR',
    'Avg SpO₂': 'Avg SpO₂',
    'RRSS Earned': 'RRSS Earned',
    'Heart Rate over time': 'Heart Rate over time',
    'TEPRS & HR Trend': 'TEPRS & HR Trend',
    'Activity & Risk Trend': 'Activity & Risk Trend',
    'TEPRS · Risiko rendah · Aman untuk aktivitas outdoor': 'TEPRS · Low risk · Safe for outdoor activity',
    'TEPRS · Risiko sedang · Pertimbangkan masker': 'TEPRS · Medium risk · Consider mask',
    'Environment Health Risk · klik untuk detail': 'Environment Health Risk · tap for detail',

    // ── Status labels ────────────────────────────────
    'Risiko ringan': 'Low risk', 'Risiko sedang': 'Medium risk',
    'Risiko tinggi': 'High risk', 'Risiko kritis': 'Critical risk',
    'Risiko rendah': 'Low risk', 'Aman': 'Safe',
    'Sedang': 'Medium', 'Tinggi': 'High', 'Rendah': 'Low',
    'RENDAH': 'LOW', 'SEDANG': 'MEDIUM', 'TINGGI': 'HIGH', 'KRITIS': 'CRITICAL',
    'BAIK': 'GOOD', 'TIDAK SEHAT': 'UNHEALTHY', 'BERBAHAYA': 'HAZARDOUS',
    'OK': 'OK', 'WARN': 'WARN', 'LOW': 'LOW', 'PEAK': 'PEAK', 'READY': 'READY',
    'SAFE': 'SAFE', 'EPO': 'EPO', 'POWER': 'POWER', 'HEAT': 'HEAT',
    'PRIMARY': 'PRIMARY', 'CURRENT': 'CURRENT', 'GUEST MODE': 'GUEST MODE',
    'Active': 'Active', 'Idle': 'Idle', 'Suspended': 'Suspended', 'Connected': 'Connected',

    // ── Disease names ────────────────────────────────
    'Asma / ISPA': 'Asthma / ARI',
    'Asma': 'Asthma',
    'ISPA': 'ARI (Acute Respiratory Infection)',
    'COPD': 'COPD',
    'Pneumonia': 'Pneumonia',
    'Bronchitis Akut': 'Acute Bronchitis',
    'Hipoksia Ringan': 'Mild Hypoxia',
    'Prediksi Asma Eksaserbasi': 'Asthma Exacerbation Prediction',
    'Prediksi COPD Eksaserbasi': 'COPD Exacerbation Prediction',
    'Skrining Sleep Apnea': 'Sleep Apnea Screening',
    'Sleep Apnea Screening': 'Sleep Apnea Screening',
    'Aritmia / AFib': 'Arrhythmia / AFib',
    'Bradikardia': 'Bradycardia',
    'Takikardia Istirahat': 'Resting Tachycardia',
    'PVC / PAC (Ektopik Beat)': 'PVC / PAC (Ectopic Beat)',
    'Hipertensi (Estimasi)': 'Hypertension (Estimated)',
    'Hipertensi (Estimasi PWV/PTT)': 'Hypertension (PWV/PTT Estimated)',
    'Vasovagal Syncope Risk': 'Vasovagal Syncope Risk',
    'CV Fitness Decline': 'CV Fitness Decline',
    'Cardiac Event Risk': 'Cardiac Event Risk',
    'Heatstroke': 'Heatstroke',
    'Heatstroke / Kelelahan Panas': 'Heatstroke / Heat Exhaustion',
    'Kelelahan Panas': 'Heat Exhaustion',
    'Kelelahan Panas (Heat Exhaustion)': 'Heat Exhaustion',
    'Dehidrasi': 'Dehydration',
    'Heat Cramps': 'Heat Cramps',
    'Hyponatremia': 'Hyponatremia',
    'Hyponatremia (EAH)': 'Hyponatremia (EAH)',
    'Sunburn': 'Sunburn',
    'Sunburn / Kerusakan Kulit': 'Sunburn / Skin Damage',
    'Photokeratitis': 'Photokeratitis',
    'Vitamin D Status': 'Vitamin D Status',
    'Skin Cancer Risk': 'Skin Cancer Risk',
    'Risiko Kanker Kulit': 'Skin Cancer Risk',
    'Demam (Fever)': 'Fever',
    'Demam': 'Fever',
    'Hipotermia': 'Hypothermia',
    'Stres Kronik': 'Chronic Stress',
    'Burnout Risk': 'Burnout Risk',
    'Panic Attack': 'Panic Attack',
    'Sleep Deprivation': 'Sleep Deprivation',
    'Overtraining Syndrome': 'Overtraining Syndrome',
    'Sedentary Lifestyle Risk': 'Sedentary Lifestyle Risk',
    'Migraine Trigger': 'Migraine Trigger',
    'Environment Health Risk (TEPRS)': 'Environment Health Risk (TEPRS)',
    'Environment Health Risk': 'Environment Health Risk',

    // ── Categories ───────────────────────────────────
    'Composite': 'Composite', 'Pernapasan': 'Respiratory',
    'Kardiovaskular': 'Cardiovascular', 'Heat': 'Heat',
    'Kulit & UV': 'Skin & UV', 'Suhu Tubuh': 'Body Temperature',
    'Stress & Mental': 'Stress & Mental', 'Aktivitas': 'Activity',
    'Triggers': 'Triggers',
    'Semua': 'All',

    // ── Profile rows ─────────────────────────────────
    'Edit Profil': 'Edit Profile', 'Notifikasi': 'Notifications',
    'Privasi & Data': 'Privacy & Data', 'Tentang AERVINEX': 'About AERVINEX',
    'Bantuan & FAQ': 'Help & FAQ', 'Device Manager': 'Device Manager',
    'Browse Risk Factors': 'Browse Risk Factors',
    'Self-Assessment': 'Self-Assessment',
    'Research Evidence & XAI': 'Research Evidence & XAI',
    'Assessment History': 'Assessment History',
    'Encyclopedia': 'Encyclopedia',
    'Pair Device (Web Bluetooth)': 'Pair Device (Web Bluetooth)',
    'Export Health Report (PDF)': 'Export Health Report (PDF)',
    'Voice Alerts': 'Voice Alerts',
    'Language': 'Language',
    'Bahasa Indonesia': 'Bahasa Indonesia',
    'English': 'English',
    'Switch to EN': 'Switch to EN', 'Switch to ID': 'Switch to ID',
    'Keluar': 'Sign out',
    'Smart Alerts': 'Smart Alerts',
    'Auto Recovery Mode': 'Auto Recovery Mode',
    'Background Sync': 'Background Sync',

    // ── Common phrases ───────────────────────────────
    'baru saja': 'just now', 'menit lalu': 'min ago', 'jam lalu': 'hours ago',
    'hari lalu': 'days ago', 'minggu lalu': 'weeks ago', 'Hari Ini': 'Today',
    'hari ini': 'today', 'Kemarin': 'Yesterday', 'kemarin': 'yesterday',
    'Loading...': 'Loading...', 'Tidak ada data': 'No data',
    'Belum ada data': 'No data yet',
    'Klik untuk detail': 'Tap for detail', 'klik untuk detail': 'tap for detail',
    'Pertanyaan': 'Question', 'dari': 'of',

    // ── Auth disclaimers / titles ────────────────────
    'From Detection to Action': 'From Detection to Action',
    'Mulai monitoring kesehatan Anda': 'Start monitoring your health',
    'Lanjutkan monitoring kesehatan Anda': 'Continue monitoring your health',
    'Mulai monitoring kesehatan berbasis AI — gratis': 'Start AI-based health monitoring — free',
    'Daftar gratis': 'Sign up free',
    'Akun & pengaturan': 'Account & settings',

    // ── Tour strings ─────────────────────────────────
    'Selamat menikmati!': 'Enjoy!',
    'Tour selesai!': 'Tour complete!',

    // ── Notification / Alert titles ──────────────────
    'Notifikasi Saat ini': 'Notifications Now', 'belum dibaca': 'unread',
    'Kritis': 'Critical', 'Level 2': 'Level 2', 'Level 1': 'Level 1', 'Info': 'Info',
    'Tandai semua dibaca': 'Mark all as read',

    // ── Settings sub-text ────────────────────────────
    'AARC alerts, daily summary': 'AARC alerts, daily summary',
    'Atur AARC alerts & daily summary': 'Configure AARC alerts & daily summary',
    'Kelola data tersimpan di cloud': 'Manage cloud-stored data',
    'Versi 1.0.0 · From Detection to Action': 'Version 1.0.0 · From Detection to Action',
    'Dokumentasi fitur novelty & troubleshoot': 'Documentation of novelty features & troubleshooting',
    'Lihat lagi tour panduan dashboard': 'See the dashboard guided tour again',
    'Speak milestones + warnings saat running': 'Speak milestones + warnings while running',

    // ── Misc / footer ────────────────────────────────
    'Powered by Firebase': 'Powered by Firebase',
    'Made with research-grade care': 'Made with research-grade care',
    'Research-grade methodology': 'Research-grade methodology',
  };

  // ── Extension registry (regional languages: jv, su, future: btk/min/ban)
  // i18n-jv.js / i18n-su.js mendaftarkan diri via AervinexI18n.registerLang().
  const EXT_DICTS = {};   // { jv: {...}, su: {...} }
  const EXT_LABELS = { id: 'Indonesia', en: 'English' };

  function registerLang(code, dict, label) {
    if (!code || !dict) return;
    EXT_DICTS[code] = dict;
    if (label) EXT_LABELS[code] = label;
    // Re-apply jika user lagi pakai bahasa ini & belum ter-translate
    if (getLang() === code) apply();
  }

  function getLang() {
    return localStorage.getItem('aervinex-lang') || 'id';
  }
  function getAvailableLangs() {
    return ['id', 'en', ...Object.keys(EXT_DICTS)];
  }
  function getLangLabel(code) {
    return EXT_LABELS[code] || code;
  }

  function t(key) {
    const lang = getLang();
    if (lang === 'id') return key;
    if (lang === 'en') return DICT[key] || key;
    // Regional / extension language
    if (EXT_DICTS[lang] && EXT_DICTS[lang][key]) return EXT_DICTS[lang][key];
    // Fallback: ID → tetap key (= bahasa Indonesia asli)
    return key;
  }

  // Auto-detect bahasa first-time visit.
  // Order: localStorage → navigator.language → fallback 'id'.
  // Optional: geo-IP via Firebase Function (stub `/api/geo-lang`).
  function detectLang(opts) {
    opts = opts || {};
    // 1. Preference user yang sudah disimpan → menang
    const stored = localStorage.getItem('aervinex-lang');
    if (stored) return stored;

    // 2. navigator.language
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.startsWith('id') || nav.startsWith('in')) return 'id';
    if (nav.startsWith('jv')) return 'jv';   // ISO 639-1 untuk Jawa
    if (nav.startsWith('su')) return 'su';   // Sunda
    if (nav.startsWith('en')) return 'en';

    // 3. Optional geo-IP probe (Firebase Function stub)
    //    Caller harus pass opts.useGeo=true & resolve manual.
    //    Default: tidak network call agar tetap offline-first.
    if (opts.useGeo && typeof fetch === 'function') {
      // Stub — di production point ke Firebase Function:
      //   fetch('/api/geo-lang').then(r => r.json()).then(d => d.lang)
      // Untuk sekarang return promise yang resolve 'id'.
      return Promise.resolve('id');
    }

    // 4. Default
    return 'id';
  }

  // Skip these elements when walking text nodes
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);
  const SKIP_CLASSES = ['mono', 'kbd', 'hero-num', 'metric-value'];

  function shouldSkip(node) {
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.classList) {
        for (const c of SKIP_CLASSES) if (el.classList.contains(c)) return true;
      }
      if (el.dataset && el.dataset.noi18n === '1') return true;
      el = el.parentElement;
    }
    return false;
  }

  function translateNode(textNode) {
    if (shouldSkip(textNode)) return;
    const original = textNode.dataset_originalText || textNode.nodeValue;
    const trimmed = original.trim();
    if (!trimmed) return;
    const lang = getLang();
    // Check if key exists in active dictionary (EN core OR regional)
    const hasTranslation = (lang === 'en' && DICT[trimmed]) ||
                           (EXT_DICTS[lang] && EXT_DICTS[lang][trimmed]);
    if (!hasTranslation) return;
    // Cache original di parent element
    const parent = textNode.parentElement;
    if (parent && !parent.dataset.i18nOriginal) {
      parent.dataset.i18nOriginal = trimmed;
    }
    textNode.nodeValue = original.replace(trimmed, t(trimmed));
  }

  function restoreNode(textNode) {
    const parent = textNode.parentElement;
    if (!parent || !parent.dataset.i18nOriginal) return;
    textNode.nodeValue = parent.dataset.i18nOriginal;
  }

  function walkApply(root, restore = false) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => shouldSkip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => restore ? restoreNode(n) : translateNode(n));
  }

  // Translate attributes (placeholder, aria-label, title)
  function translateAttrs(restore = false) {
    const lang = getLang();
    document.querySelectorAll('[placeholder], [aria-label], [title], [data-tooltip]').forEach(el => {
      ['placeholder', 'aria-label', 'title', 'data-tooltip'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (!val) return;
        const trimmed = val.trim();
        if (restore) {
          const orig = el.dataset['orig_' + attr];
          if (orig) el.setAttribute(attr, orig);
        } else {
          const hasTranslation = (lang === 'en' && DICT[trimmed]) ||
                                 (EXT_DICTS[lang] && EXT_DICTS[lang][trimmed]);
          if (hasTranslation) {
            if (!el.dataset['orig_' + attr]) el.dataset['orig_' + attr] = trimmed;
            el.setAttribute(attr, t(trimmed));
          }
        }
      });
    });
  }

  function apply() {
    const lang = getLang();
    if (lang === 'id') {
      // Restore semua ke ID asli
      walkApply(document.body, true);
      translateAttrs(true);
    } else {
      walkApply(document.body, false);
      translateAttrs(false);
    }
  }

  function setLang(l) {
    localStorage.setItem('aervinex-lang', l);
    document.documentElement.lang = l;
    apply();
    if (window.AervinexToast) {
      const TOAST_MSG = {
        id: 'Bahasa diubah ke Indonesia',
        en: 'Language switched to English',
        jv: 'Basa dipun-gantos dhateng Jawa',
        su: 'Basa diganti ka Sunda',
      };
      AervinexToast(TOAST_MSG[l] || ('Language: ' + l), 'success');
    }
  }

  // Cycle: id → en → jv → su → id (skip langs not registered)
  function toggle() {
    const all = getAvailableLangs();
    const idx = all.indexOf(getLang());
    const next = all[(idx + 1) % all.length];
    setLang(next);
  }

  // MutationObserver: re-translate setiap kali DOM berubah
  let pendingTranslate = false;
  const observer = new MutationObserver(() => {
    if (pendingTranslate) return;
    if (getLang() === 'id') return; // no work needed
    pendingTranslate = true;
    requestAnimationFrame(() => {
      pendingTranslate = false;
      walkApply(document.body, false);
      translateAttrs(false);
    });
  });

  // Init
  function init() {
    // Auto-detect untuk first-time visit (no stored preference)
    if (!localStorage.getItem('aervinex-lang')) {
      const detected = detectLang();
      if (typeof detected === 'string' && detected !== 'id') {
        // Hanya persist kalau bukan default — tetap respect "do nothing on ID"
        localStorage.setItem('aervinex-lang', detected);
      }
    }
    document.documentElement.lang = getLang();
    if (getLang() !== 'id') {
      walkApply(document.body, false);
      translateAttrs(false);
    }
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.AervinexI18n = {
    get lang() { return getLang(); },
    setLang, toggle, t, apply,
    registerLang, detectLang,
    getAvailableLangs, getLangLabel,
    isEN() { return getLang() === 'en'; },
    isID() { return getLang() === 'id'; },
    isJV() { return getLang() === 'jv'; },
    isSU() { return getLang() === 'su'; },
  };

  // ══════════════════════════════════════════════════════════
  // LANGUAGE TOGGLE BUTTON injection (self-contained — independent)
  // Guaranteed coverage: setiap halaman yang load i18n.js dapat toggle
  // ══════════════════════════════════════════════════════════
  function makeLangBtn(isFab = false, position = 'right:72px') {
    const lang = getLang().toUpperCase();
    const btn = document.createElement('button');
    btn.className = 'btn-icon aerv-lang-toggle' + (isFab ? ' theme-toggle-fab' : '');
    if (isFab) btn.style.cssText = `position:fixed;top:16px;${position};z-index:100`;
    btn.setAttribute('aria-label', 'Switch language');
    btn.title = 'Switch language';
    btn.dataset.noi18n = '1';
    btn.innerHTML = `<span style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--accent);font-family:Inter,sans-serif" data-noi18n="1">${lang}</span>`;
    btn.addEventListener('click', () => {
      toggle();
      setTimeout(() => {
        const newLang = getLang().toUpperCase();
        document.querySelectorAll('.aerv-lang-toggle span').forEach(s => s.textContent = newLang);
      }, 120);
    });
    return btn;
  }

  function injectLangToggle() {
    // Cek apakah brand stylesheet (aervinex-ui.css) sudah loaded
    const hasBrandCSS = !!document.querySelector('link[href*="aervinex-ui.css"]');

    // Strategi 1: sibling .theme-toggle (paling umum)
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(themeBtn => {
      const parent = themeBtn.parentElement;
      if (!parent || parent.querySelector(':scope > .aerv-lang-toggle')) return;
      const isFab = themeBtn.classList.contains('theme-toggle-fab');
      parent.insertBefore(makeLangBtn(isFab), themeBtn);
    });

    // Strategi 2: kalau TIDAK ada theme-toggle sama sekali (e.g., 404, sample),
    // tambah floating lang button di pojok kanan-atas
    if (!document.querySelector('.aerv-lang-toggle')) {
      const fab = makeLangBtn(true, 'right:16px');
      // Kalau brand CSS tidak loaded, beri fallback inline style
      if (!hasBrandCSS) {
        fab.style.cssText = 'position:fixed;top:16px;right:16px;z-index:100;width:44px;height:44px;border-radius:14px;background:#1a2433;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.3)';
        fab.querySelector('span').style.color = '#00e5d4';
      }
      document.body.appendChild(fab);
    }
  }

  function initWithToggle() {
    init();
    injectLangToggle();
    // MutationObserver — re-inject saat dynamic top-bar muncul (tour, modals)
    const mo = new MutationObserver(() => injectLangToggle());
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithToggle);
  } else {
    initWithToggle();
  }
})();
