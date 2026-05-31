/**
 * AERVINEX SPA Router & App Shell
 */
window.App = {
  currentView: null,
  modules: {},

  // ── ROUTER ───────────────────────────────────────────
  views: ['dashboard', 'running', 'recovery', 'history'],

  navigate(view) {
    if (!this.views.includes(view)) view = 'dashboard';
    this.showView(view);
    history.pushState({ view }, '', `#${view}`);
  },

  showView(view) {
    // Hide all
    document.querySelectorAll('.view-content').forEach(el => el.classList.remove('active'));
    // Show target
    const el = document.getElementById('view-' + view);
    if (el) el.classList.add('active');
    // Update nav
    document.querySelectorAll('.nav-item[data-view]').forEach(n => {
      n.classList.toggle('active', n.dataset.view === view);
    });
    // Lifecycle: stop old, start new
    const prev = this.currentView;
    if (prev && prev !== view && this.modules[prev]?.onLeave) this.modules[prev].onLeave();
    this.currentView = view;
    if (this.modules[view]?.onEnter) this.modules[view].onEnter();
  },

  registerModule(name, mod) {
    this.modules[name] = mod;
  },

  // ── SIDEBAR ──────────────────────────────────────────
  initSidebar() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.view);
        this.closeSidebar();
      });
    });
    document.getElementById('btn-logout')?.addEventListener('click', () => AERVINEXAuth.logout());
    // Mobile
    document.getElementById('ham-btn')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
  },

  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('show');
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
  },

  // ── TOAST ────────────────────────────────────────────
  // Security: build with createElement/textContent to neutralize any HTML in `msg`.
  // (Was: innerHTML with template string — vulnerable if msg ever carried user data.)
  toast(msg, type = 'info', duration = 4000) {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    const icons = { info: 'ℹ️', warn: '⚠️', danger: '🚨', success: '✅' };
    const cls   = { warn: 'tw', danger: 'td', success: 'ts', info: '' };
    const t = document.createElement('div');
    t.className = `toast ${cls[type] || ''}`;
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type] || 'ℹ️';
    const msgSpan = document.createElement('span');
    msgSpan.textContent = String(msg == null ? '' : msg);
    t.appendChild(iconSpan);
    t.appendChild(msgSpan);
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(110%)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, duration);
  },

  // ── MODAL HELPERS ────────────────────────────────────
  openModal(id) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    document.getElementById(id)?.classList.add('open');
  },
  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  },

  // ── AARC — Adaptive Alert & Response Chain ───────────
  // level 1: toast (warn)  |  level 2: modal  |  level 3: full-screen overlay
  escalate(level, context = {}) {
    const { title = 'Peringatan', msg = '', icon = '⚠️' } = context;
    if (level === 1) {
      this.toast(`${icon} ${title}: ${msg}`, 'warn', 6000);
    } else if (level === 2) {
      const l2Icon  = document.getElementById('aarc-l2-icon');
      const l2Title = document.getElementById('aarc-l2-title');
      const l2Msg   = document.getElementById('aarc-l2-msg');
      if (l2Icon)  l2Icon.textContent  = icon;
      if (l2Title) l2Title.textContent = title;
      if (l2Msg)   l2Msg.textContent   = msg;
      this.openModal('aarc-modal-l2');
    } else if (level >= 3) {
      const overlay = document.getElementById('aarc-overlay');
      const titleEl = document.getElementById('aarc-title');
      const msgEl   = document.getElementById('aarc-msg');
      const pulse   = document.getElementById('aarc-pulse-icon');
      if (overlay) {
        if (titleEl) titleEl.textContent = title;
        if (msgEl)   msgEl.textContent   = msg;
        if (pulse)   pulse.textContent   = icon;
        overlay.classList.add('active');
      }
    }
  },

  closeAARC() {
    document.getElementById('aarc-overlay')?.classList.remove('active');
  },

  // ── USER INFO ────────────────────────────────────────
  updateUserUI(profile) {
    const initials = AERVINEXAuth.getInitials(profile?.name || 'U');
    const name = profile?.name || 'User';
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = name;
    SensorSim.setAge(profile?.age || 25);
  },

  // ── MAIN INIT ────────────────────────────────────────
  init() {
    AERVINEXAuth.init(
      (user, profile) => {
        // Authenticated
        document.getElementById('view-landing').style.display = 'none';
        document.getElementById('app-shell').style.display    = 'flex';
        this.updateUserUI(profile);
        this.initSidebar();
        const hash = (location.hash || '#dashboard').slice(1);
        this.navigate(this.views.includes(hash) ? hash : 'dashboard');
      },
      () => {
        // Not authenticated
        document.getElementById('view-landing').style.display = 'block';
        document.getElementById('app-shell').style.display    = 'none';
        if (this.currentView && this.modules[this.currentView]?.onLeave)
          this.modules[this.currentView].onLeave();
      }
    );

    // Browser back/forward
    window.addEventListener('popstate', e => {
      if (e.state?.view) this.showView(e.state.view);
    });

    // Modal backdrop clicks
    document.querySelectorAll('.modal-overlay').forEach(ov => {
      ov.addEventListener('click', e => { if (e.target === ov) this.closeModals(); });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
