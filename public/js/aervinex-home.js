/* AERVINEX Home — interaksi minimal untuk sample/preview UI:
   - Theme toggle (dark <-> light, persist via localStorage)
   - Tab switching pada chart card
   - Live update tanggal & metrics demo (HR, TEPRS)
*/

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Greeting date ----------
  function setGreetDate() {
    const el = $('#greetDate');
    if (!el) return;
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    el.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ---------- Tab switching ----------
  function initTabs() {
    const tabs = $$('.tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  // ---------- Demo live HR animation ----------
  function initLiveMetrics() {
    const hrEl = $('#hrValue');
    if (!hrEl) return;
    let base = 78;
    setInterval(() => {
      const delta = Math.round((Math.random() - 0.5) * 4);
      base = Math.max(62, Math.min(140, base + delta));
      hrEl.textContent = base;
    }, 1800);
  }

  // ---------- Toggle haptic feel (visual press) ----------
  function initToggles() {
    $$('.toggle input').forEach((cb) => {
      cb.addEventListener('change', () => {
        const track = cb.parentElement.querySelector('.toggle-track');
        if (!track) return;
        track.animate(
          [{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }],
          { duration: 180, easing: 'ease-out' }
        );
      });
    });
  }

  // ---------- Bottom nav active state ----------
  function initBottomNav() {
    $$('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        $$('.nav-item').forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // ---------- Theme toggle (cycles dark → light → glass, persist) ----------
  function initThemeToggle() {
    const KEY = 'aervinex-theme';
    const MODES = ['dark', 'light', 'glass'];
    const stored = localStorage.getItem(KEY);
    const body = document.body;
    const apply = (mode) => {
      MODES.forEach(m => body.classList.toggle('theme-' + m, m === mode));
    };
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

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    setGreetDate();
    initTabs();
    initLiveMetrics();
    initToggles();
    initBottomNav();
  });
})();
