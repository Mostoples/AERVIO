/**
 * AERVIO SPA Router & App Shell
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
    document.getElementById('btn-logout')?.addEventListener('click', () => AervioAuth.logout());
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
  toast(msg, type = 'info', duration = 4000) {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    const icons = { info: 'ℹ️', warn: '⚠️', danger: '🚨', success: '✅' };
    const cls   = { warn: 'tw', danger: 'td', success: 'ts', info: '' };
    const t = document.createElement('div');
    t.className = `toast ${cls[type] || ''}`;
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
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

  // ── USER INFO ────────────────────────────────────────
  updateUserUI(profile) {
    const initials = AervioAuth.getInitials(profile?.name || 'U');
    const name = profile?.name || 'User';
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = name;
    SensorSim.setAge(profile?.age || 25);
  },

  // ── MAIN INIT ────────────────────────────────────────
  init() {
    AervioAuth.init(
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
