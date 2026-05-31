/* AERVINEX Admin shared helpers — sidebar inject, active state, demo data.
   Each admin page includes <aside id="admin-sidebar"></aside> as placeholder.
   This script fills it. data-page on <body> determines active item.
*/
(function () {
  'use strict';

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Auto-load icon-lib.js (konsistensi icon semua admin pages)
  if (!window.AervinexIcons && !document.querySelector('script[src*="icon-lib"]')) {
    const s = document.createElement('script');
    s.src = '/js/icon-lib.js';
    s.async = false;
    document.head.appendChild(s);
  }
  // Auto-load i18n.js untuk admin pages
  if (!window.AervinexI18n && !document.querySelector('script[src*="i18n.js"]')) {
    const s = document.createElement('script');
    s.src = '/js/i18n.js';
    s.async = false;
    document.head.appendChild(s);
  }

  // ── LANGUAGE TOGGLE CHIP injection (sama seperti aervinex-app.js) ──
  function injectAdminLangToggle() {
    document.querySelectorAll('.theme-toggle').forEach(themeBtn => {
      const parent = themeBtn.parentElement;
      if (!parent || parent.querySelector(':scope > .aerv-lang-toggle')) return;
      const lang = (localStorage.getItem('aervinex-lang') || 'id').toUpperCase();
      const btn = document.createElement('button');
      btn.className = 'btn-icon aerv-lang-toggle';
      btn.setAttribute('aria-label', 'Switch language');
      btn.title = 'Switch language';
      btn.dataset.noi18n = '1';
      btn.innerHTML = `<span style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--accent)" data-noi18n="1">${lang}</span>`;
      btn.addEventListener('click', () => {
        window.AervinexI18n?.toggle?.();
        setTimeout(() => {
          const newLang = (localStorage.getItem('aervinex-lang') || 'id').toUpperCase();
          document.querySelectorAll('.aerv-lang-toggle span').forEach(s => s.textContent = newLang);
        }, 120);
      });
      parent.insertBefore(btn, themeBtn);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    injectAdminLangToggle();
    new MutationObserver(() => injectAdminLangToggle()).observe(document.body, { childList: true, subtree: true });
  });

  const NAV = [
    { section: 'Operasional' },
    { id: 'overview',     title: 'Overview',           href: '/admin/',                  icon: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>' },
    { id: 'users',        title: 'Pengguna',           href: '/admin/users.html',        icon: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0114 0"/><circle cx="17" cy="8" r="3"/><path d="M22 21a5 5 0 00-7-4.6"/>' },
    { id: 'devices',      title: 'Devices',            href: '/admin/devices.html',      icon: '<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M11 7h2"/>' },
    { id: 'alerts',       title: 'Notifikasi',         href: '/admin/alerts.html',       icon: '<path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/>', badge: '3' },
    { id: 'support',      title: 'Support',            href: '/admin/support.html',      icon: '<path d="M21 11.5a8.4 8.4 0 11-16 0c0-4.6 3.6-8.4 8-8.4s8 3.8 8 8.4z"/><path d="M8 14h.01M16 14h.01M9 9h6"/>' },

    { section: 'Data & Intelligence' },
    { id: 'data',         title: 'Data Overview',      href: '/admin/data.html',         icon: '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/>' },
    { id: 'analytics',    title: 'Analytics',          href: '/admin/analytics.html',    icon: '<path d="M3 3v18h18M9 14v3M14 11v6M19 8v9"/>' },
    { id: 'ml-models',    title: 'ML Models',          href: '/admin/ml-models.html',    icon: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/><path d="M6 12h3M15 12h3"/>' },
    { id: 'geo',          title: 'Geo Stations',       href: '/admin/geo.html',          icon: '<path d="M12 2l8 4-8 4-8-4 8-4z"/><path d="M4 10l8 4 8-4M4 14l8 4 8-4"/>' },
    { id: 'sensors',      title: 'Sensor Calibration', href: '/admin/sensors.html',      icon: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>' },

    { section: 'Sistem' },
    { id: 'system',       title: 'System Health',      href: '/admin/system.html',       icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { id: 'roles',        title: 'Roles & Akses',      href: '/admin/roles.html',        icon: '<path d="M12 2L4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/>' },
    { id: 'audit',        title: 'Audit Log',          href: '/admin/audit.html',        icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
    { id: 'api-keys',     title: 'API Keys',           href: '/admin/api-keys.html',     icon: '<circle cx="7" cy="14" r="4"/><path d="M9.8 11.2L19 2l3 3-3 3-2 2-2 2-1-1"/>' },
    { id: 'integrations', title: 'Integrasi',          href: '/admin/integrations.html', icon: '<path d="M9 3v4a2 2 0 002 2h2a2 2 0 002-2V3M5 13h14M9 17h6"/>' },

    { section: 'Growth & Revenue' },
    { id: 'onboarding-funnel', title: 'Onboarding Funnel', href: '/admin/onboarding-funnel.html', icon: '<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>' },
    { id: 'churn-dashboard',   title: 'Churn Dashboard',   href: '/admin/churn-dashboard.html',   icon: '<path d="M3 3v18h18M7 14l4-4 4 4 5-5"/><path d="M17 5l-2 4-3-3-4 7"/>' },

    { section: 'Konten' },
    { id: 'content',      title: 'Content / FAQ',      href: '/admin/content.html',      icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>' },
    { id: 'onboarding',   title: 'Onboarding Flow',    href: '/admin/onboarding.html',   icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/><path d="M16 4l2 2-3 3"/>' },
    { id: 'settings',     title: 'Settings',           href: '/admin/settings.html',     icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008 19.4a1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 8a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1c0 .7.4 1.3 1 1.5a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.2.6.8 1 1.5 1H21a2 2 0 110 4h-.1c-.7 0-1.3.4-1.5 1z"/>' },
  ];

  function buildSidebar() {
    const aside = document.getElementById('admin-sidebar');
    if (!aside) return;
    const currentPage = document.body.dataset.page || 'overview';
    const html = ['<a href="/admin/" class="admin-brand" style="text-decoration:none;color:inherit"><span class="brand-dot"></span><span class="brand-name">AERVINEX</span><span class="admin-brand-badge">ADMIN</span></a>'];
    for (const item of NAV) {
      if (item.section) {
        html.push(`<div class="admin-nav-section">${item.section}</div>`);
      } else {
        const active = item.id === currentPage ? ' active' : '';
        const badge = item.badge ? `<span class="badge">${item.badge}</span>` : '';
        html.push(`<a class="admin-nav-item${active}" href="${item.href}"><svg viewBox="0 0 24 24" class="ico">${item.icon}</svg><span>${item.title}</span>${badge}</a>`);
      }
    }
    html.push('<div style="margin-top:auto;padding-top:18px;border-top:1px solid rgba(255,255,255,0.05)"><a href="/dashboard.html" class="admin-nav-item"><svg viewBox="0 0 24 24" class="ico"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>← Ke User App</span></a></div>');
    aside.innerHTML = html.join('');
  }

  function initMobileSidebar() {
    const ham = document.querySelector('.admin-ham');
    const sidebar = document.getElementById('admin-sidebar');
    if (!ham || !sidebar) return;
    let overlay = document.querySelector('.admin-sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'admin-sidebar-overlay';
      document.body.appendChild(overlay);
    }
    ham.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Theme toggle (re-uses aervinex-app.js logic but inline here so admin doesn't need to load it)
  function initTheme() {
    const KEY = 'aervinex-theme';
    const MODES = ['dark', 'light', 'glass'];
    const body = document.body;
    const stored = localStorage.getItem(KEY);
    const apply = (mode) => MODES.forEach(m => body.classList.toggle('theme-' + m, m === mode));
    apply(MODES.includes(stored) ? stored : 'dark');

    const glassSvg = '<svg viewBox="0 0 24 24" class="ico ico-glass"><path d="M12 3l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M18.5 14l0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8z"/><path d="M5 7l0.5 1.3 1.3 0.5-1.3 0.5-0.5 1.3-0.5-1.3-1.3-0.5 1.3-0.5z"/></svg>';
    $$('.theme-toggle').forEach(btn => {
      if (!btn.querySelector('.ico-glass')) btn.insertAdjacentHTML('beforeend', glassSvg);
      btn.addEventListener('click', () => {
        const current = MODES.find(m => body.classList.contains('theme-' + m)) || 'dark';
        const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
        apply(next);
        localStorage.setItem(KEY, next);
      });
    });
  }

  // Simple toast (same API as user app)
  function ensureToastWrap() {
    let wrap = document.getElementById('aervinex-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'aervinex-toast-wrap';
      wrap.className = 'aervinex-toast-wrap';
      document.body.appendChild(wrap);
    }
    return wrap;
  }
  window.AervinexToast = window.AervinexToast || function (msg, type = 'info', duration = 3500) {
    const wrap = ensureToastWrap();
    const t = document.createElement('div');
    t.className = `aervinex-toast ${type}`;
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, duration);
  };

  // Logout for admin (same key as user app)
  function initLogout() {
    $$('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.AERVINEXAuth) { try { await AERVINEXAuth.logout(); } catch (_) {} }
        location.replace('/login.html');
      });
    });
  }

  // ── Admin role gate ───────────────────────────────────────
  // Pop the comment block below + isi ADMIN_EMAILS untuk aktifkan.
  // Tanpa ini, /admin/ bisa diakses siapapun yang tahu URL-nya.
  /*
  const ADMIN_EMAILS = [
    'cooxnime@gmail.com',
    'fadli.rahman@aervi.id',
    'lukman.hadi@aervi.id',
  ];
  function requireAdmin() {
    return new Promise((resolve) => {
      if (typeof firebase === 'undefined' || !firebase.apps?.length) return resolve();
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) { location.replace('/login.html?return=' + encodeURIComponent(location.pathname)); return; }
        if (!ADMIN_EMAILS.includes((user.email || '').toLowerCase())) {
          alert('Anda tidak punya akses admin.');
          location.replace('/dashboard.html');
          return;
        }
        resolve(user);
      });
    });
  }
  */

  document.addEventListener('DOMContentLoaded', () => {
    // Uncomment baris berikut + uncomment requireAdmin() di atas untuk lock admin:
    // requireAdmin();
    buildSidebar();
    initMobileSidebar();
    initTheme();
    initLogout();
  });
})();
