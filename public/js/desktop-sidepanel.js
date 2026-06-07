/*!
 * AERVINEX Desktop Side Panel
 * ────────────────────────────────────────────────────────────
 * Hamburger button (top-left) + slide-out side panel untuk desktop ≥1024px.
 * Auto-inject ke setiap halaman via aervinex-app.js loader.
 * Mobile: tidak active (bottom-nav handles navigation).
 *
 * Features:
 *  - Hamburger fixed top-left (glassmorphic)
 *  - Side panel slide from left, 280px wide
 *  - Backdrop overlay (click to close)
 *  - Keyboard: ESC closes, ↑↓ navigates items
 *  - State persisted di sessionStorage (open/closed)
 *  - Auto-highlight active page via data-page body attr
 *  - Theme-aware (dark/light/glass)
 *  - i18n-aware (text di-translate via i18n.js DICT)
 */
(function () {
  'use strict';

  // Skip kalau mobile (bottom-nav punya tugas)
  // We'll attach but CSS handles visibility via @media
  if (window.__AERV_SIDEPANEL_INSTALLED) return;
  window.__AERV_SIDEPANEL_INSTALLED = true;

  // Skip di landing/auth pages (mereka punya nav sendiri)
  const SKIP_PAGES = ['home', 'login', 'register', 'sample', '404', 'onboarding'];

  function getCurrentPage() {
    return document.body?.dataset?.page || '';
  }

  function shouldSkip() {
    return SKIP_PAGES.includes(getCurrentPage());
  }

  // Nav items — sesuai dengan bottom-nav existing
  const NAV_ITEMS = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'home',     href: '/dashboard.html' },
    { id: 'history',      label: 'Statistik',    icon: 'chart',    href: '/history.html' },
    { id: 'running',      label: 'Mulai Run',    icon: 'play',     href: '/running.html' },
    { id: 'recovery',     label: 'Pemulihan',    icon: 'heart',    href: '/recovery.html' },
    { id: 'profile',      label: 'Profil',       icon: 'user',     href: '/profile.html' },
    { id: '__divider__1', label: '',             icon: '',         href: '' },
    { id: 'risk-list',    label: 'Daftar Risiko',icon: 'shield',   href: '/risk-list.html' },
    { id: 'encyclopedia', label: 'Ensiklopedia', icon: 'book',     href: '/encyclopedia.html' },
    { id: 'assessment',   label: 'Self Assessment', icon: 'check', href: '/assessment.html' },
    { id: 'alerts',       label: 'Notifikasi',   icon: 'bell',     href: '/alerts.html' },
    { id: 'community',    label: 'Komunitas',    icon: 'users',    href: '/community.html' },
    { id: 'ai-chat',      label: 'Aervi AI',     icon: 'bot',      href: '/ai-chat.html' },
    { id: '__divider__2', label: '',             icon: '',         href: '' },
    { id: 'evidence',     label: 'Riset',        icon: 'lab',      href: '/evidence.html' },
    { id: 'ml-results-report', label: 'Test Akurasi', icon: 'check2', href: '/ml-results-report.html' },
    { id: 'datasets',     label: 'Dataset Registry', icon: 'database', href: '/datasets.html' },
    { id: 'xai-audit',    label: 'XAI Audit',    icon: 'shield2',  href: '/xai-audit.html' },
    { id: 'aervinex-roadmap', label: 'Roadmap',  icon: 'map',      href: '/aervinex-roadmap.html' },
    { id: '__divider__3', label: '',             icon: '',         href: '' },
    { id: 'device',       label: 'Perangkat',    icon: 'device',   href: '/device.html' },
    { id: 'subscription', label: 'Langganan',    icon: 'card',     href: '/subscription.html' },
    { id: 'help',         label: 'Bantuan',      icon: 'help',     href: '/help.html' },
  ];

  const ICONS = {
    home:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>',
    chart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    heart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-7-11a5 5 0 019-3 5 5 0 019 3c0 6.5-7 11-7 11z"/></svg>',
    user:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/></svg>',
    book:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    check2:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>',
    bell:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/></svg>',
    users:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><circle cx="17" cy="9" r="3"/><path d="M2 21a7 7 0 0114 0M14 21a5 5 0 0110 0"/></svg>',
    bot:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="14" rx="3"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M12 3v4"/></svg>',
    lab:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3v6L4 19a2 2 0 002 3h12a2 2 0 002-3l-5-10V3"/><line x1="7" y1="3" x2="17" y2="3"/></svg>',
    database:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></svg>',
    shield2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    map:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/></svg>',
    device:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="18" r="1"/></svg>',
    card:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    help:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4M12 17h.01"/></svg>',
    logout:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    menu:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>',
    close:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
  };

  // Inject CSS sekali
  function injectCSS() {
    if (document.getElementById('aerv-sidepanel-css')) return;
    const css = `
      .aerv-hamburger {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 44px; height: 44px;
        display: none;
        align-items: center; justify-content: center;
        background: rgba(20, 30, 44, 0.65);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        color: var(--text, #e6f1f4);
        cursor: pointer;
        z-index: 80;
        transition: all 0.2s;
        padding: 0;
      }
      .aerv-hamburger:hover { background: rgba(0, 229, 212, 0.18); border-color: rgba(0, 229, 212, 0.4); }
      .aerv-hamburger:active { transform: scale(0.95); }
      .aerv-hamburger svg { width: 22px; height: 22px; }

      body.theme-light .aerv-hamburger {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(0, 0, 0, 0.08);
        color: #0c1828;
      }
      body.theme-light .aerv-hamburger:hover { background: rgba(0, 229, 212, 0.18); }

      /* Sidepanel + backdrop */
      .aerv-sp-backdrop {
        position: fixed; inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 90;
      }
      .aerv-sp-backdrop.open { opacity: 1; pointer-events: auto; }

      .aerv-sidepanel {
        position: fixed;
        top: 0; left: 0; bottom: 0;
        width: 300px;
        background: rgba(15, 22, 32, 0.92);
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        transform: translateX(-105%);
        transition: transform 0.35s cubic-bezier(0.5, 0, 0.2, 1);
        z-index: 95;
        display: flex; flex-direction: column;
        padding: 18px;
        gap: 6px;
        overflow: hidden;
      }
      .aerv-sidepanel.open { transform: translateX(0); }

      body.theme-light .aerv-sidepanel {
        background: rgba(248, 250, 252, 0.96);
        border-right-color: rgba(0, 0, 0, 0.08);
        color: #0c1828;
      }

      .aerv-sp-head {
        display: flex; align-items: center; gap: 12px;
        padding: 4px 6px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        margin-bottom: 8px;
      }
      body.theme-light .aerv-sp-head { border-bottom-color: rgba(0, 0, 0, 0.06); }

      .aerv-sp-brand {
        display: flex; align-items: center; gap: 8px; flex: 1;
      }
      .aerv-sp-brand .dot {
        width: 9px; height: 9px; border-radius: 50%;
        background: linear-gradient(135deg, #00e5d4, #a78bfa);
        box-shadow: 0 0 10px #00e5d4;
      }
      .aerv-sp-brand .name {
        font-size: 13px; font-weight: 800; letter-spacing: 3px;
      }

      .aerv-sp-close {
        width: 32px; height: 32px;
        background: rgba(255, 255, 255, 0.05);
        border: 0; border-radius: 8px;
        color: var(--text, #e6f1f4);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
      }
      .aerv-sp-close:hover { background: rgba(255, 84, 112, 0.18); color: #ff5470; }
      .aerv-sp-close svg { width: 16px; height: 16px; }
      body.theme-light .aerv-sp-close {
        background: rgba(0, 0, 0, 0.04);
        color: #0c1828;
      }

      .aerv-sp-user {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 10px;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        margin-bottom: 12px;
      }
      .aerv-sp-user .avatar {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00e5d4, #a78bfa);
        color: #0c1828;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 13px;
        flex-shrink: 0;
      }
      .aerv-sp-user .uname {
        font-size: 13px; font-weight: 700;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .aerv-sp-user .uemail {
        font-size: 11px; opacity: 0.65;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      body.theme-light .aerv-sp-user {
        background: rgba(0, 0, 0, 0.03);
      }

      .aerv-sp-nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        margin: 0; padding: 0 0 16px; list-style: none;
        display: flex; flex-direction: column; gap: 2px;
        min-height: 0; /* allow flex shrink */
      }
      .aerv-sp-nav::-webkit-scrollbar { width: 6px; }
      .aerv-sp-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px; }
      .aerv-sp-nav::-webkit-scrollbar-thumb:hover { background: rgba(0,229,212,0.3); }

      .aerv-sp-item {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        color: var(--text-muted, #b6c4cb);
        text-decoration: none;
        font-size: 13.5px; font-weight: 500;
        transition: all 0.15s;
      }
      .aerv-sp-item:hover {
        background: rgba(0, 229, 212, 0.08);
        color: var(--text, #e6f1f4);
      }
      .aerv-sp-item.active {
        background: linear-gradient(135deg, rgba(0,229,212,0.15), rgba(167,139,250,0.10));
        color: #00e5d4;
        font-weight: 700;
      }
      .aerv-sp-item.active::before {
        content: ''; position: absolute; left: -18px; top: 8px; bottom: 8px;
        width: 3px; border-radius: 0 3px 3px 0;
        background: #00e5d4;
        box-shadow: 0 0 8px rgba(0, 229, 212, 0.6);
      }
      .aerv-sp-item { position: relative; }
      .aerv-sp-item svg {
        width: 18px; height: 18px;
        flex-shrink: 0;
      }
      body.theme-light .aerv-sp-item { color: #4a5a68; }
      body.theme-light .aerv-sp-item:hover { background: rgba(0, 229, 212, 0.10); color: #0c1828; }
      body.theme-light .aerv-sp-item.active { color: #007a72; }

      .aerv-sp-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
        margin: 8px 4px;
      }
      body.theme-light .aerv-sp-divider { background: rgba(0, 0, 0, 0.05); }

      .aerv-sp-foot {
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex; flex-direction: column; gap: 4px;
      }
      body.theme-light .aerv-sp-foot { border-top-color: rgba(0, 0, 0, 0.06); }

      .aerv-sp-logout {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 12px;
        background: transparent;
        border: 0;
        color: #ff5470;
        cursor: pointer;
        border-radius: 10px;
        font-size: 13.5px; font-weight: 600;
        font-family: inherit;
        text-align: left;
        transition: background 0.15s;
        width: 100%;
      }
      .aerv-sp-logout:hover { background: rgba(255, 84, 112, 0.12); }
      .aerv-sp-logout svg { width: 18px; height: 18px; }

      /* ───── TABLET 768-1023px: hamburger + toggle ───── */
      @media (min-width: 768px) and (max-width: 1023px) {
        .aerv-hamburger { display: flex; }
        .bottom-nav, .bottomnav { display: none !important; }
      }

      /* ───── DESKTOP ≥1024px: PERSISTENT SIDEBAR ───── */
      @media (min-width: 1024px) {
        /* Sidebar always visible */
        .aerv-sidepanel {
          transform: none !important;
          width: 260px;
          background: rgba(15, 22, 32, 0.85);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 4px 0 40px rgba(0, 0, 0, 0.15);
        }
        body.theme-light .aerv-sidepanel {
          background: rgba(248, 250, 252, 0.95);
          border-right-color: rgba(0, 0, 0, 0.06);
          box-shadow: 4px 0 40px rgba(0, 30, 60, 0.06);
        }

        .aerv-hamburger,
        .aerv-sp-backdrop,
        .aerv-sp-close { display: none !important; }
        .bottom-nav, .bottomnav { display: none !important; }

        /* Body padding-left → SEMUA content auto-shift ke kanan sidebar.
           Skip pages yang tidak install sidepanel (landing/auth/onboarding/404/sample) */
        body[data-page]:not([data-page="home"]):not([data-page="login"]):not([data-page="register"]):not([data-page="onboarding"]):not([data-page="sample"]):not([data-page="404"]) {
          padding-left: 260px !important;
        }

        /* Fixed-positioned chat input bars: shift right to clear sidebar */
        .ai-input-bar, .ch-input-bar {
          left: 260px !important;
        }

        /* Theme toggle FAB */
        .theme-toggle-fab {
          left: auto !important;
          right: 24px !important;
        }
      }

      /* ≥1280px: sidebar 280px */
      @media (min-width: 1280px) {
        .aerv-sidepanel { width: 280px; }
        body[data-page]:not([data-page="home"]):not([data-page="login"]):not([data-page="register"]):not([data-page="onboarding"]):not([data-page="sample"]):not([data-page="404"]) {
          padding-left: 280px !important;
        }
        .ai-input-bar, .ch-input-bar { left: 280px !important; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'aerv-sidepanel-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderPanel() {
    const current = getCurrentPage();
    const items = NAV_ITEMS.map(item => {
      if (item.id.startsWith('__divider__')) {
        return '<li class="aerv-sp-divider" role="separator"></li>';
      }
      const active = item.id === current ? ' active' : '';
      return `
        <li>
          <a class="aerv-sp-item${active}" href="${item.href}" data-nav="${item.id}">
            ${ICONS[item.icon] || ''}
            <span>${item.label}</span>
          </a>
        </li>`;
    }).join('');

    const user = window.AERVINEXAuth?.currentUser || window.auth?.currentUser;
    const profile = window.AERVINEXAuth?.userProfile || {};
    const uname = profile.name || user?.displayName || (user?.isAnonymous ? 'Guest' : 'User');
    const uemail = user?.email || (user?.isAnonymous ? 'Anonymous session' : '');
    const initial = (uname || '?')[0]?.toUpperCase() || '?';

    return `
      <div class="aerv-sp-head">
        <div class="aerv-sp-brand">
          <span class="dot"></span>
          <span class="name">AERVINEX</span>
        </div>
        <button type="button" class="aerv-sp-close" aria-label="Tutup panel">${ICONS.close}</button>
      </div>
      <div class="aerv-sp-user">
        <div class="avatar">${initial}</div>
        <div style="min-width:0;flex:1">
          <div class="uname">${uname}</div>
          <div class="uemail">${uemail}</div>
        </div>
      </div>
      <ul class="aerv-sp-nav" role="navigation">${items}</ul>
      <div class="aerv-sp-foot">
        <button type="button" class="aerv-sp-logout" id="aervSpLogout">
          ${ICONS.logout}<span>Keluar</span>
        </button>
      </div>
    `;
  }

  function build() {
    if (shouldSkip()) return;

    injectCSS();

    // Hamburger button
    if (!document.querySelector('.aerv-hamburger')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aerv-hamburger';
      btn.setAttribute('aria-label', 'Buka menu');
      btn.innerHTML = ICONS.menu;
      btn.addEventListener('click', open);
      document.body.appendChild(btn);
    }

    // Backdrop
    if (!document.querySelector('.aerv-sp-backdrop')) {
      const bd = document.createElement('div');
      bd.className = 'aerv-sp-backdrop';
      bd.addEventListener('click', close);
      document.body.appendChild(bd);
    }

    // Panel
    if (!document.querySelector('.aerv-sidepanel')) {
      const panel = document.createElement('aside');
      panel.className = 'aerv-sidepanel';
      panel.setAttribute('aria-label', 'Navigasi utama');
      panel.innerHTML = renderPanel();
      document.body.appendChild(panel);

      panel.querySelector('.aerv-sp-close')?.addEventListener('click', close);
      panel.querySelector('#aervSpLogout')?.addEventListener('click', logout);
    }

    // ESC closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Listen auth changes — re-render user section
    if (window.AERVINEXAuth?.init) {
      // already initialized; just refresh on visibility
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshUser();
      });
    }
  }

  function open() {
    document.querySelector('.aerv-sp-backdrop')?.classList.add('open');
    document.querySelector('.aerv-sidepanel')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.querySelector('.aerv-sp-backdrop')?.classList.remove('open');
    document.querySelector('.aerv-sidepanel')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function refreshUser() {
    const panel = document.querySelector('.aerv-sidepanel');
    if (!panel) return;
    panel.innerHTML = renderPanel();
    panel.querySelector('.aerv-sp-close')?.addEventListener('click', close);
    panel.querySelector('#aervSpLogout')?.addEventListener('click', logout);
  }

  async function logout() {
    if (!confirm('Yakin keluar dari akun?')) return;
    try {
      if (window.AERVINEXAuth?.logout) {
        await window.AERVINEXAuth.logout();
      } else if (window.auth?.signOut) {
        await window.auth.signOut();
      }
      try {
        localStorage.removeItem('aervinex-onboarded');
        sessionStorage.clear();
      } catch {}
      location.replace('/login.html');
    } catch (e) {
      console.error('[sidepanel] logout failed:', e);
      alert('Gagal keluar. Coba lagi.');
    }
  }

  window.AervinexSidePanel = { open, close, refreshUser };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
