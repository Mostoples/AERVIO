/* AERVINEX shared app utilities — loaded by every mobile page.
   Provides: theme toggle, bottom-nav active state, logout, simple toast.
*/
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ── AUTO-LOAD i18n.js if not already loaded ───────────────────────────
  (function ensureI18n() {
    if (window.AervinexI18n) return; // Already loaded
    if (document.querySelector('script[src*="i18n.js"]')) return; // Script tag exists

    const script = document.createElement('script');
    script.src = '/js/i18n.js?v=31';
    script.async = false; // Load synchronously for reliability
    document.head.appendChild(script);
  })();

  // ── PWA: register manifest + service worker ─────────────────────────────
  (function pwaSetup() {
    // Inject manifest link kalau belum ada
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
    // Inject apple-touch-icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/icon-192.svg';
      document.head.appendChild(link);
    }
    // Register service worker
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
    // PWA install prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      window.AervinexInstallPWA = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        return outcome === 'accepted';
      };
      // Show subtle install hint sekali per session
      if (!sessionStorage.getItem('aervinex-install-shown')) {
        sessionStorage.setItem('aervinex-install-shown', '1');
        setTimeout(() => {
          const t = window.AervinexI18n?.t || (k => k);
          if (window.AervinexToast) AervinexToast(t('💾 Install AERVINEX di home screen Anda — tap menu browser → "Add to Home"'), 'info', 6000);
        }, 8000);
      }
    });
  })();

  // Auto-load icon-lib.js jika belum ada (memastikan emoji-to-SVG migration konsisten)
  if (!window.AervinexIcons && !document.querySelector('script[src*="icon-lib"]')) {
    const s = document.createElement('script');
    s.src = '/js/icon-lib.js?v=1.0.1'; // Cache busting version
    s.async = false;
    document.head.appendChild(s);
  }

  // Auto-replace FAB di bottom-nav dengan AERVINEX brand logo
  function applyBrandFAB() {
    if (!window.AervinexIcons?.get) return;
    const logo = window.AervinexIcons.get('aervinex-logo');
    if (!logo) return;
    document.querySelectorAll('.nav-item.fab').forEach(fab => {
      if (fab.dataset.brandApplied) return;
      fab.dataset.brandApplied = '1';
      fab.innerHTML = `<span style="display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center">${logo}</span>`;
    });
    // Tambah subtle ring + improved glow ke FAB
    if (!document.getElementById('aervinex-fab-style')) {
      const st = document.createElement('style');
      st.id = 'aervinex-fab-style';
      st.textContent = `
        .nav-item.fab {
          background: radial-gradient(circle at 30% 30%, #2eecd9, var(--accent) 70%);
          box-shadow:
            0 0 0 2px rgba(255,255,255,0.08) inset,
            0 0 28px rgba(0,229,212,0.55),
            0 10px 24px -6px rgba(0,229,212,0.55),
            -3px -3px 8px var(--shadow-light),
            4px 5px 10px var(--shadow-dark);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .nav-item.fab:hover {
          transform: translateY(-1px) scale(1.04);
          box-shadow:
            0 0 0 2px rgba(255,255,255,0.12) inset,
            0 0 36px rgba(0,229,212,0.75),
            0 14px 32px -6px rgba(0,229,212,0.7),
            -3px -3px 8px var(--shadow-light),
            4px 5px 12px var(--shadow-dark);
        }
        .nav-item.fab > span { color: #06222a; }
        body.theme-glass .nav-item.fab {
          backdrop-filter: blur(22px) saturate(180%);
          -webkit-backdrop-filter: blur(22px) saturate(180%);
        }
      `;
      document.head.appendChild(st);
    }
  }
  // Run setelah icon-lib siap
  function whenIconsReady(cb) {
    if (window.AervinexIcons?.get) return cb();
    const t = setInterval(() => {
      if (window.AervinexIcons?.get) { clearInterval(t); cb(); }
    }, 100);
    setTimeout(() => clearInterval(t), 5000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => whenIconsReady(applyBrandFAB));
  } else {
    whenIconsReady(applyBrandFAB);
  }

  // ── THEME TOGGLE (cycles dark → light → glass → dark, persist) ──────────
  function initTheme() {
    const KEY = 'aervinex-theme';
    const MODES = ['dark', 'light', 'glass'];
    const body = document.body;
    const stored = localStorage.getItem(KEY);
    const apply = (mode) => {
      MODES.forEach(m => body.classList.toggle('theme-' + m, m === mode));
    };
    apply(MODES.includes(stored) ? stored : 'dark');

    // Inject glass icon (sparkles) into every theme-toggle that doesn't have it
    const glassSvg = '<svg viewBox="0 0 24 24" class="ico ico-glass"><path d="M12 3l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M18.5 14l0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8z"/><path d="M5 7l0.5 1.3 1.3 0.5-1.3 0.5-0.5 1.3-0.5-1.3-1.3-0.5 1.3-0.5z"/></svg>';
    $$('.theme-toggle').forEach(btn => {
      if (!btn.querySelector('.ico-glass')) btn.insertAdjacentHTML('beforeend', glassSvg);
      btn.addEventListener('click', () => {
        const current = MODES.find(m => body.classList.contains('theme-' + m)) || 'dark';
        const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
        apply(next);
        localStorage.setItem(KEY, next);
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        if (window.AervinexToast) AervinexToast(tt('Theme: {theme}', { theme: next.toUpperCase() }), 'info', 1500);
      });
    });
  }

  // ── BOTTOM NAV ACTIVE STATE — by data-page on <body> ───────────────────
  function initBottomNav() {
    const current = document.body.dataset.page;
    $$('.bottom-nav .nav-item[data-nav]').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === current);
    });
  }

  // ── LOGOUT ─────────────────────────────────────────────────────────────
  function initLogout() {
    $$('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await AERVINEXAuth.logout(); } catch (_) {}
        location.replace('/login.html');
      });
    });
  }

  // ── SIMPLE TOAST ───────────────────────────────────────────────────────
  function ensureToastWrap() {
    let wrap = $('#aervinex-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'aervinex-toast-wrap';
      wrap.className = 'aervinex-toast-wrap';
      document.body.appendChild(wrap);
    }
    return wrap;
  }
  window.AervinexToast = function (msg, type = 'info', duration = 3500) {
    const wrap = ensureToastWrap();
    const t = document.createElement('div');
    t.className = `aervinex-toast ${type}`;
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, duration);
  };

  // ── GREETING DATE (Indonesian) — for pages that have #greetDate ────────
  window.AervinexSetGreetDate = function () {
    const el = $('#greetDate');
    if (!el) return;
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    el.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ── HAPTIC FEEDBACK ─────────────────────────────────────────────────────
  window.AervinexHaptic = {
    light()  { try { navigator.vibrate?.(10); } catch (_) {} },
    medium() { try { navigator.vibrate?.(25); } catch (_) {} },
    heavy()  { try { navigator.vibrate?.([30, 20, 30]); } catch (_) {} },
    success(){ try { navigator.vibrate?.([15, 50, 15]); } catch (_) {} },
    error()  { try { navigator.vibrate?.([60, 30, 60]); } catch (_) {} },
  };
  // Auto-haptic on primary CTA + FAB
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.btn-pill.primary, .btn-block.primary, .btn-assess, .nav-item.fab, .btn-icon');
    if (t) AervinexHaptic.light();
  }, { passive: true });

  // ── VOICE / TTS ─────────────────────────────────────────────────────────
  window.AervinexVoice = {
    enabled: localStorage.getItem('aervinex-voice') !== '0',
    setEnabled(v) { this.enabled = v; localStorage.setItem('aervinex-voice', v ? '1' : '0'); },
    speak(text, opts = {}) {
      if (!this.enabled || !('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang || 'id-ID';
      u.rate = opts.rate || 1;
      u.pitch = opts.pitch || 1;
      u.volume = opts.volume || 0.9;
      try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (_) {}
    },
    cancel() { try { speechSynthesis.cancel(); } catch (_) {} },
  };

  // ── i18n: auto-load comprehensive dictionary from /js/i18n.js ───────────
  if (!window.AervinexI18n && !document.querySelector('script[src*="i18n.js"]')) {
    const s = document.createElement('script');
    s.src = '/js/i18n.js?v=1.0.1'; // Cache busting version
    s.async = false;
    document.head.appendChild(s);
  }

  // ── Desktop sidepanel: persistent left nav (≥1024px) + hamburger (768-1023px)
  // Skipped automatically pada landing/auth/onboarding/sample/404 pages
  if (!window.__AERV_SIDEPANEL_INSTALLED && !document.querySelector('script[src*="desktop-sidepanel.js"]')) {
    const s2 = document.createElement('script');
    s2.src = '/js/desktop-sidepanel.js?v=1.0.1'; // Cache busting version
    s2.defer = true;
    document.head.appendChild(s2);
  }

  // ── Card pattern auto-detector: scan .card content + auto-assign data-pattern
  // untuk medical icon decoration kontekstual di pojok kanan bawah
  if (!window.__AERV_CARD_PATTERN_INSTALLED && !document.querySelector('script[src*="card-pattern-auto.js"]')) {
    const s3 = document.createElement('script');
    s3.src = '/js/card-pattern-auto.js?v=1.0.1'; // Cache busting version
    s3.defer = true;
    document.head.appendChild(s3);
  }

  // ── LANGUAGE TOGGLE CHIP — inject sebagai sibling theme-toggle (guaranteed coverage) ──
  function makeLangBtn(isFab = false) {
    const lang = (localStorage.getItem('aervinex-lang') || 'id').toUpperCase();
    const btn = document.createElement('button');
    btn.className = 'btn-icon aerv-lang-toggle' + (isFab ? ' theme-toggle-fab' : '');
    if (isFab) btn.style.cssText = 'position:fixed;top:16px;right:72px;z-index:100';
    btn.setAttribute('aria-label', 'Switch language');
    btn.title = 'Switch language';
    btn.dataset.noi18n = '1';
    btn.innerHTML = `<span style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--accent)" data-noi18n="1">${lang}</span>`;
    btn.addEventListener('click', () => {
      if (window.AervinexI18n?.toggle) {
        window.AervinexI18n.toggle();
        setTimeout(() => {
          const newLang = (localStorage.getItem('aervinex-lang') || 'id').toUpperCase();
          document.querySelectorAll('.aerv-lang-toggle span').forEach(s => s.textContent = newLang);
        }, 120);
      }
    });
    return btn;
  }

  function injectLangToggle() {
    // Strategi 1: insert sebagai SIBLING setiap .theme-toggle (covers semua top-bar + fab)
    document.querySelectorAll('.theme-toggle').forEach(themeBtn => {
      // Cek apakah sudah ada lang toggle di sibling-nya
      const parent = themeBtn.parentElement;
      if (!parent) return;
      if (parent.querySelector(':scope > .aerv-lang-toggle')) return;
      const isFab = themeBtn.classList.contains('theme-toggle-fab');
      const langBtn = makeLangBtn(isFab);
      parent.insertBefore(langBtn, themeBtn);
    });

    // Strategi 2: untuk page yang theme-toggle-nya position:fixed (login/register), pastikan ada lang FAB juga
    const fabTheme = document.querySelector('.theme-toggle-fab');
    if (fabTheme && !document.querySelector('.aerv-lang-toggle.theme-toggle-fab')) {
      // Sudah handle di strategi 1, skip
    }

    // Strategi 3: fallback — jika TIDAK ada theme-toggle di page (rare), tambah lang button floating
    if (!document.querySelector('.theme-toggle') && !document.querySelector('.aerv-lang-toggle')) {
      const fab = makeLangBtn(true);
      fab.style.right = '16px';
      document.body.appendChild(fab);
    }
  }

  function whenReady(cb) {
    if (document.readyState !== 'loading') cb();
    else document.addEventListener('DOMContentLoaded', cb);
  }
  whenReady(() => {
    // Auto-attach handler to manual lang-toggle button if exists
    const manualLangBtn = document.getElementById('lang-toggle-btn');
    if (manualLangBtn) {
      const updateLangBtn = () => {
        const lang = (localStorage.getItem('aervinex-lang') || 'id').toUpperCase();
        const span = manualLangBtn.querySelector('span');
        if (span) span.textContent = lang;
      };

      // Initial update
      setTimeout(updateLangBtn, 100);

      manualLangBtn.addEventListener('click', () => {
        if (window.AervinexI18n?.toggle) {
          window.AervinexI18n.toggle();
          setTimeout(updateLangBtn, 150);
        }
      });
    }

    // Auto-inject for pages without manual button (covers all pages)
    if (!manualLangBtn) {
      injectLangToggle();
      const mo = new MutationObserver(() => {
        if (!document.getElementById('lang-toggle-btn')) {
          injectLangToggle();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  });

  // ── ACHIEVEMENT / BADGE SYSTEM ──────────────────────────────────────────
  const BADGES = [
    { id: 'first_run',    icon: 'run',       title: 'First Run',          desc: 'Selesaikan sesi run pertama' },
    { id: 'streak_7',     icon: 'flame',     title: '7-Day Streak',       desc: 'Aktif 7 hari berturut-turut' },
    { id: 'streak_30',    icon: 'flame',     title: '30-Day Streak',      desc: 'Aktif 30 hari berturut-turut' },
    { id: 'distance_5k',  icon: 'run',       title: 'First 5K',           desc: 'Lari 5km dalam satu sesi' },
    { id: 'distance_10k', icon: 'run',       title: 'Half Marathoner',    desc: 'Lari 10km dalam satu sesi' },
    { id: 'recovery_pro', icon: 'shield',    title: 'Recovery Master',    desc: 'RRSS ≥ 85 selama 7 hari' },
    { id: 'no_alert',     icon: 'check-c',   title: 'Smooth Sailing',     desc: 'Tidak ada alert L2/L3 selama 7 hari' },
    { id: 'all_assess',   icon: 'assessment', title: 'Health Conscious',  desc: 'Assessment 10 kondisi berbeda' },
    { id: 'early_bird',   icon: 'sun',       title: 'Early Bird',         desc: 'Run sebelum 06:00 5x' },
    { id: 'night_owl',    icon: 'moon',      title: 'Night Recovery',     desc: 'Recovery session malam 5x' },
    { id: 'data_explorer',icon: 'chart-bar', title: 'Data Explorer',      desc: 'Buka 20+ metric detail' },
    { id: 'evidence',     icon: 'doc',       title: 'Research Curious',   desc: 'Baca Evidence page' },
  ];
  window.AervinexBadges = {
    all() { return BADGES; },
    earned() { return JSON.parse(localStorage.getItem('aervinex-badges') || '[]'); },
    has(id)  { return this.earned().includes(id); },
    award(id, opts = {}) {
      if (this.has(id)) return false;
      const b = BADGES.find(x => x.id === id); if (!b) return false;
      const list = this.earned(); list.push(id);
      localStorage.setItem('aervinex-badges', JSON.stringify(list));
      AervinexHaptic.success();
      if (window.AervinexToast && !opts.silent) {
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        AervinexToast(tt('🏆 Badge unlocked: {title}', { title: b.title }), 'success', 5000);
      }
      return true;
    },
    reset() { localStorage.removeItem('aervinex-badges'); },
  };
  // Auto-award "evidence" badge when visiting /evidence.html
  if (location.pathname.endsWith('/evidence.html')) {
    setTimeout(() => window.AervinexBadges.award('evidence'), 3000);
  }

  // ── SKELETON HELPER ─────────────────────────────────────────────────────
  window.AervinexSkeleton = {
    card() { return '<div class="skel skel-card"></div>'; },
    list(rows = 3) {
      return Array.from({length: rows}, () => `
        <div style="display:flex;gap:12px;padding:14px 0;align-items:center">
          <div class="skel skel-circle"></div>
          <div style="flex:1">
            <div class="skel skel-line short"></div>
            <div class="skel skel-line tiny"></div>
          </div>
        </div>`).join('');
    },
    grid(items = 4) {
      return Array.from({length: items}, () => `<div class="skel skel-card" style="height:120px"></div>`).join('');
    },
  };

  // ── EMPTY STATE HELPER ──────────────────────────────────────────────────
  window.AervinexEmpty = {
    render(opts = {}) {
      const icon = opts.icon || 'doc';
      const ico = window.AervinexIcons?.get(icon) || '';
      return `<div class="empty-state">
        <div class="empty-illu">${ico}</div>
        <p class="empty-title">${opts.title || 'Belum ada data'}</p>
        <p class="empty-sub">${opts.sub || ''}</p>
        ${opts.cta ? `<a class="btn-pill primary" href="${opts.ctaHref || '#'}">${opts.cta}</a>` : ''}
      </div>`;
    }
  };

  // ── PULL-TO-REFRESH ─────────────────────────────────────────────────────
  (function initPullRefresh() {
    if (window.matchMedia('(min-width: 768px)').matches) return; // mobile only
    let startY = 0, pulling = false, indicator = null;
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0 || window.scrollY > 0) { pulling = false; return; }
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.style.cssText = 'position:fixed;top:0;left:50%;transform:translate(-50%,-100%);background:var(--bg);box-shadow:var(--shadow-raised);padding:10px 18px;border-radius:0 0 var(--radius-pill) var(--radius-pill);color:var(--accent);font-size:12px;font-weight:700;z-index:9999;transition:transform 0.2s';
        indicator.textContent = '⟳ Pull untuk refresh';
        document.body.appendChild(indicator);
      }
      const pct = Math.min(1, delta / 100);
      indicator.style.transform = `translate(-50%, ${-100 + pct * 110}%) rotate(${pct * 360}deg)`;
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (!pulling) return;
      pulling = false;
      if (indicator) {
        const remove = () => { indicator.remove(); indicator = null; };
        const transform = indicator.style.transform;
        if (transform.includes('rotate(36')) {
          AervinexHaptic.medium();
          const t = window.AervinexI18n?.t || (k => k);
          if (window.AervinexToast) AervinexToast(t('Refreshing...'), 'info', 1500);
          setTimeout(() => location.reload(), 400);
        } else {
          indicator.style.transform = 'translate(-50%, -100%)';
          setTimeout(remove, 250);
        }
      }
    }, { passive: true });
  })();

  // ── PDF EXPORT (jsPDF lazy-load) ──────────────────────────────────────
  window.AervinexPDF = {
    async loadLib() {
      if (window.jspdf) return window.jspdf;
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = () => resolve(window.jspdf);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    },
    async generateHealthReport(opts = {}) {
      try {
        const lib = await this.loadLib();
        const { jsPDF } = lib;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const user = window.AERVINEXAuth?.currentUser;
        const profile = window.AERVINEXAuth?.userProfile || {};

        // Header
        doc.setFillColor(0, 229, 212);
        doc.rect(0, 0, 595, 60, 'F');
        doc.setTextColor(15, 25, 35);
        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.text('AERVINEX Health Report', 40, 38);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text('From Detection to Action · ' + new Date().toLocaleDateString('id-ID'), 40, 52);

        // User info
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(11); doc.setFont(undefined, 'bold');
        doc.text('PROFIL PENGGUNA', 40, 90);
        doc.setFont(undefined, 'normal'); doc.setFontSize(10);
        doc.text(`Nama: ${profile.name || user?.displayName || 'User'}`, 40, 110);
        doc.text(`Email: ${user?.email || '—'}`, 40, 124);
        doc.text(`Umur: ${profile.age || '—'} tahun · Tinggi: ${profile.height || '—'} cm · Berat: ${profile.weight || '—'} kg`, 40, 138);

        // Metric summary
        doc.setFont(undefined, 'bold'); doc.setFontSize(11);
        doc.text('RINGKASAN METRIK', 40, 170);
        doc.setFont(undefined, 'normal'); doc.setFontSize(10);
        const metrics = opts.metrics || [
          ['TEPRS (Env Risk)', '34 %'],
          ['Heart Rate Avg', '78 bpm'],
          ['SpO₂', '97%'],
          ['Hidrasi', '72%'],
          ['UV Exposure', 'Sedang'],
          ['PM2.5 Area', '38 μg/m³'],
        ];
        let y = 190;
        metrics.forEach(([k, v]) => {
          doc.setFont(undefined, 'normal'); doc.text(k, 40, y);
          doc.setFont(undefined, 'bold');   doc.text(v, 250, y);
          y += 18;
        });

        // Risk factors
        y += 16;
        doc.setFont(undefined, 'bold'); doc.setFontSize(11);
        doc.text('DETEKSI RISIKO PENYAKIT (24 jam terakhir)', 40, y);
        doc.setFontSize(10); doc.setFont(undefined, 'normal');
        y += 20;
        const risks = opts.risks || [
          ['Asma / ISPA', '14%', 'Ringan'],
          ['Heatstroke', '22%', 'Ringan'],
          ['Dehidrasi', '18%', 'Ringan'],
          ['AFib (skrining)', '6%', 'Aman'],
          ['Sunburn', '28%', 'Ringan'],
        ];
        risks.forEach(([n, p, s]) => {
          doc.text(n, 40, y);
          doc.text(p, 250, y);
          doc.text(s, 330, y);
          y += 18;
        });

        // Disclaimer
        y += 20;
        doc.setFillColor(255, 245, 230);
        doc.rect(40, y, 515, 60, 'F');
        doc.setTextColor(180, 90, 0);
        doc.setFontSize(8); doc.setFont(undefined, 'bold');
        doc.text('⚠️ DISCLAIMER', 50, y + 16);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 60, 30);
        doc.text('AERVINEX adalah tool skrining wearable, BUKAN diagnostik medis. Hasil di atas adalah', 50, y + 30);
        doc.text('estimasi ML berbasis sensor onboard. Konsultasi dokter untuk gejala signifikan.', 50, y + 42);

        // Footer
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text('Generated by AERVINEX v1.0.0 · ' + new Date().toISOString(), 40, 800);
        doc.text('aervinex.web.app · Research-grade, From Detection to Action', 40, 814);

        doc.save(`aervinex-health-report-${new Date().toISOString().split('T')[0]}.pdf`);
        const t = window.AervinexI18n?.t || (k => k);
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        if (window.AervinexToast) AervinexToast(t('Health report PDF tersimpan'), 'success');
        if (window.AervinexHaptic) AervinexHaptic.success();
      } catch (err) {
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        if (window.AervinexToast) AervinexToast(tt('Gagal generate PDF: {error}', { error: err.message }), 'error');
      }
    },
  };

  // ── WEB BLUETOOTH (scan + connect) ────────────────────────────────────
  window.AervinexBluetooth = {
    isSupported() { return 'bluetooth' in navigator; },
    async scan() {
      if (!this.isSupported()) {
        const t = window.AervinexI18n?.t || (k => k);
        if (window.AervinexToast) AervinexToast(t('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome/Edge desktop atau Android.'), 'warn', 5000);
        return null;
      }
      try {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate', 'battery_service', 'device_information'],
        });
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        if (window.AervinexToast) AervinexToast(tt('Pair sukses: {device}', { device: device.name || device.id }), 'success', 4000);
        if (window.AervinexHaptic) AervinexHaptic.success();
        // Save to Firestore
        if (window.db && window.AERVINEXAuth?.currentUser) {
          db.collection('paired_devices').add({
            uid: AERVINEXAuth.currentUser.uid,
            name: device.name || 'Unknown',
            id: device.id,
            ts: firebase.firestore.FieldValue.serverTimestamp(),
          }).catch(() => {});
        }
        return device;
      } catch (err) {
        if (err.name === 'NotFoundError') return null; // user cancelled, no toast
        const tt = window.AervinexI18n?.tt || ((k, v) => k);
        if (window.AervinexToast) AervinexToast(tt('Pair gagal: {error}', { error: err.message }), 'error');
        return null;
      }
    },
  };

  // ── REAL-TIME ALERTS LISTENER (Firestore subscription) ────────────────
  function initAlertsListener() {
    if (!window.db || !window.firebase?.auth) return;
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) return;
      try {
        db.collection('alerts')
          .where('uid', '==', user.uid)
          .where('read', '==', false)
          .limit(50)
          .onSnapshot((snap) => {
            const count = snap.size;
            // Update bell badge
            document.querySelectorAll('.btn-icon.notif').forEach(bell => {
              let badge = bell.querySelector('.badge-count');
              if (count > 0) {
                if (!badge) {
                  badge = document.createElement('span');
                  badge.className = 'badge-count';
                  badge.style.cssText = 'position:absolute;top:4px;right:4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:rgb(255,92,124);color:#fff;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(255,92,124,0.6);animation:anim-pulse 1.6s infinite;transform-origin:center';
                  bell.appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count;
                // Hide default badge-dot
                const dot = bell.querySelector('.badge-dot'); if (dot) dot.style.display = 'none';
              } else if (badge) {
                badge.remove();
                const dot = bell.querySelector('.badge-dot'); if (dot) dot.style.display = '';
              }
            });
            // Toast for newest unread alert sekali
            const newest = snap.docChanges().filter(c => c.type === 'added').pop();
            if (newest && window.AervinexToast && !sessionStorage.getItem('alert-' + newest.doc.id)) {
              sessionStorage.setItem('alert-' + newest.doc.id, '1');
              const d = newest.doc.data();
              AervinexToast(`🔔 ${d.title || 'New alert'}`, d.level === 3 ? 'error' : 'info', 5000);
            }
          }, () => {});
      } catch (_) {}
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBottomNav();
    initLogout();
    initAlertsListener();
  });
})();
