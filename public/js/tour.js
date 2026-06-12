/* AERVINEX Onboarding Tour — spotlight + tooltip engine.
   Usage:
     AervinexTour.start([{ target: 'CSS_SELECTOR', title: '...', text: '...', placement: 'auto|top|bottom|left|right' }, ...]);
     AervinexTour.startDashboardTour();  // pre-defined for dashboard
*/
(function () {
  'use strict';

  const KEY_BASE = 'aervinex-tour-completed';
  const PADDING = 10;
  const TT_GAP = 18;

  let state = { steps: [], index: 0, backdrop: null, spotlight: null, tooltip: null, onComplete: null, tourId: 'dashboard' };

  // ── Tour analytics (Firestore tour_events collection) ─────
  function logEvent(event, extra = {}) {
    try {
      const user = (window.firebase?.auth?.()?.currentUser) || null;
      const payload = {
        event, // 'start' | 'step_view' | 'skip' | 'complete' | 'replay'
        tour: state.tourId,
        stepIndex: state.index,
        stepTarget: state.steps[state.index]?.target || null,
        totalSteps: state.steps.length,
        ts: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || Date.now(),
        uid: user?.uid || 'anonymous',
        isAnonymous: !!user?.isAnonymous,
        ...extra,
      };
      // Best-effort write — silent on failure (quota, offline, etc.)
      if (window.db?.collection) {
        window.db.collection('tour_events').add(payload).catch(() => {});
      }
      // Also log locally for debugging
      const local = JSON.parse(localStorage.getItem('aervinex-tour-log') || '[]');
      local.push({ event, tourId: state.tourId, stepIndex: state.index, ts: Date.now() });
      if (local.length > 200) local.splice(0, local.length - 200);
      localStorage.setItem('aervinex-tour-log', JSON.stringify(local));
    } catch (_) {}
  }

  function ensureNodes() {
    if (state.backdrop) return;
    const b = document.createElement('div');
    b.className = 'tour-backdrop';
    const s = document.createElement('div');
    s.className = 'tour-spotlight pulse';
    b.appendChild(s);
    const t = document.createElement('div');
    t.className = 'tour-tooltip';
    document.body.appendChild(b);
    document.body.appendChild(t);
    state.backdrop = b;
    state.spotlight = s;
    state.tooltip = t;
  }

  function destroy() {
    state.backdrop?.remove();
    state.tooltip?.remove();
    state.backdrop = state.spotlight = state.tooltip = null;
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onResize, true);
  }

  function onResize() { if (state.steps.length) render(); }

  function getTargetRect(selector) {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { el, x: r.left - PADDING, y: r.top - PADDING, w: r.width + PADDING * 2, h: r.height + PADDING * 2 };
  }

  function positionTooltip(rect, placement) {
    const tt = state.tooltip;
    tt.style.visibility = 'hidden';
    tt.style.opacity = '1';
    tt.classList.add('show');
    const tw = tt.offsetWidth;
    const th = tt.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;

    let top, left, arrowClass = '';

    // Auto placement: pick whichever side has more room
    if (placement === 'auto' || !placement) {
      const space = { bottom: vh - (rect.y + rect.h), top: rect.y, right: vw - (rect.x + rect.w), left: rect.x };
      placement = Object.keys(space).reduce((a, b) => space[a] > space[b] ? a : b);
    }

    if (placement === 'bottom') {
      top = rect.y + rect.h + TT_GAP;
      left = Math.max(10, Math.min(rect.x + rect.w / 2 - tw / 2, vw - tw - 10));
      arrowClass = 'top';
    } else if (placement === 'top') {
      top = rect.y - th - TT_GAP;
      left = Math.max(10, Math.min(rect.x + rect.w / 2 - tw / 2, vw - tw - 10));
      arrowClass = 'bottom';
    } else if (placement === 'right') {
      left = rect.x + rect.w + TT_GAP;
      top = Math.max(10, Math.min(rect.y + rect.h / 2 - th / 2, vh - th - 10));
      arrowClass = 'left';
    } else {
      left = rect.x - tw - TT_GAP;
      top = Math.max(10, Math.min(rect.y + rect.h / 2 - th / 2, vh - th - 10));
      arrowClass = 'right';
    }

    tt.style.left = left + 'px';
    tt.style.top = top + 'px';
    tt.style.visibility = 'visible';
    const oldArrow = tt.querySelector('.tour-arrow');
    if (oldArrow) oldArrow.className = 'tour-arrow ' + arrowClass;
  }

  function scrollIntoViewIfNeeded(el) {
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight - 80) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function render() {
    const step = state.steps[state.index];
    if (!step) return;
    ensureNodes();
    state.backdrop.classList.add('active');

    const rect = getTargetRect(step.target);
    if (!rect) {
      // Target not found — skip to next or end
      console.warn('Tour target not found:', step.target);
      next();
      return;
    }
    scrollIntoViewIfNeeded(rect.el);

    // After scroll, recompute
    setTimeout(() => {
      const r2 = getTargetRect(step.target);
      if (!r2) return;
      const sp = state.spotlight;
      sp.style.left = r2.x + 'px';
      sp.style.top = r2.y + 'px';
      sp.style.width = r2.w + 'px';
      sp.style.height = r2.h + 'px';
      sp.style.borderRadius = (step.radius || 18) + 'px';

      const tt = state.tooltip;
      const t = (k) => window.AervinexI18n?.t(k) || k;
      tt.innerHTML = `
        <div class="tour-arrow"></div>
        <span class="tour-step-badge">${state.index + 1} / ${state.steps.length}</span>
        <div class="tour-title">${step.title}</div>
        <div class="tour-text">${step.text}</div>
        <div class="tour-actions">
          <div class="tour-progress">${state.steps.map((_, i) => `<span class="tour-dot ${i === state.index ? 'active' : i < state.index ? 'done' : ''}"></span>`).join('')}</div>
          <div class="tour-btns">
            ${state.index > 0 ? `<button class="tour-btn back" data-tour="back">${t('Back')}</button>` : `<button class="tour-btn skip" data-tour="skip">${t('Skip')}</button>`}
            <button class="tour-btn next" data-tour="next">${state.index === state.steps.length - 1 ? t('Selesai ✓') : t('Lanjut →')}</button>
          </div>
        </div>
      `;
      positionTooltip(r2, step.placement);
    }, 250);
  }

  function next() {
    if (state.index >= state.steps.length - 1) {
      end(true);
    } else {
      state.index++;
      logEvent('step_view');
      render();
    }
  }
  function back() { if (state.index > 0) { state.index--; logEvent('step_view', { direction: 'back' }); render(); } }
  function skip() {
    logEvent('skip');
    // Mark as completed even if skipped, so tour won't auto-show again
    localStorage.setItem(KEY_BASE + '-' + state.tourId, '1');
    end(false);
  }
  function end(completed) {
    if (completed) {
      localStorage.setItem(KEY_BASE + '-' + state.tourId, '1');
      logEvent('complete');
    }
    state.backdrop?.classList.remove('active');
    state.tooltip?.classList.remove('show');
    setTimeout(destroy, 350);
    if (state.onComplete) state.onComplete(completed);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-tour]');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.tour === 'next') next();
    else if (a.dataset.tour === 'back') back();
    else if (a.dataset.tour === 'skip') skip();
  });

  function isCompletedFor(tourId) { return localStorage.getItem(KEY_BASE + '-' + tourId) === '1'; }

  window.AervinexTour = {
    start(steps, opts = {}) {
      if (!steps?.length) return;
      state.steps = steps;
      state.index = 0;
      state.tourId = opts.tourId || 'dashboard';
      state.onComplete = opts.onComplete || null;
      logEvent('start');
      window.addEventListener('resize', onResize);
      window.addEventListener('scroll', onResize, true);
      setTimeout(() => { render(); logEvent('step_view'); }, 300);
    },
    end,
    reset(tourId) {
      if (tourId) localStorage.removeItem(KEY_BASE + '-' + tourId);
      else ['dashboard', 'running', 'recovery', 'history'].forEach(t => localStorage.removeItem(KEY_BASE + '-' + t));
    },
    isCompleted(tourId = 'dashboard') { return isCompletedFor(tourId); },

    // ── DASHBOARD TOUR ────────────────────────────────────
    startDashboardTour(force = false) {
      if (!force && isCompletedFor('dashboard')) return;
      const t = (k) => window.AervinexI18n?.t(k) || k;
      this.start([
        { target: '.greeting',                title: t('Selamat datang di AERVINEX!'),     text: t('Mari saya pandu fitur utama. Tour ini cuma 10 step — Anda bisa skip kapan saja.') },
        { target: '.hero-card',               title: t('TEPRS · Skor Risiko Lingkungan'), text: t('Total Environment-induced Physiological Risk Score — ML kalibrasi dari PM2.5, suhu, UV, kondisi tubuh. Tap kartu untuk detail faktor.') },
        { target: '.grid-2:first-of-type',    title: t('Vital Signs'),                     text: t('Heart Rate, SpO₂, Respiratory, Hidrasi — sensor onboard. Tap kartu untuk drill-in chart 24 jam + insight.'), placement: 'top' },
        { target: '.grid-2:nth-of-type(2)',   title: t('Lingkungan'),                      text: t('UV Index, PM2.5, Heat Index — dikalibrasi stasiun BMKG/IQAir terdekat via GPS.'), placement: 'top' },
        { target: '.aura-coral.list-card',    title: t('Deteksi Risiko Penyakit'),         text: t('5 kondisi real-time: asma, heatstroke, dehidrasi, aritmia, sunburn. Tap row untuk faktor kontribusi + mitigasi.'), placement: 'top' },
        { target: '#recPanel',                title: t('Rekomendasi AI'),                  text: t('Saran kontekstual: pindah area, minum air, kurangi intensitas. Update tiap 2 detik berdasar sensor.'), placement: 'top' },
        { target: '.quick-actions',           title: t('Aksi Cepat'),                      text: t('Mulai Run, Recovery, atau lihat History dengan satu tap.'), placement: 'top' },
        { target: '.bottom-nav',              title: t('Bottom Navigation'),               text: t('Home · Stats · ▶ Start (FAB) · Recovery · Profile.'), placement: 'top' },
        { target: '.theme-toggle',            title: t('Theme: 3 mode'),                   text: t('Tap untuk cycle Dark → Light → Glass ✨ — tersimpan otomatis.') },
        { target: 'a[href="/profile.html"][aria-label="Profil"]', title: t('Profil & Settings'), text: t('Edit profil, device, privasi, FAQ. Tour Dashboard selesai!') },
      ], { tourId: 'dashboard', onComplete: (c) => { if (c) AervinexToast?.(t('Tour Dashboard selesai · tour halaman lain akan muncul saat Anda buka'), 'success', 4000); } });
    },

    // ── RUNNING TOUR ──────────────────────────────────────
    startRunningTour(force = false) {
      if (!force && isCompletedFor('running')) return;
      const t = (k) => window.AervinexI18n?.t(k) || k;
      this.start([
        { target: '.run-map-card', title: t('Smart Route Map'), text: t('GPS rute real-time + overlay PM2.5 (chip kanan atas). Marker pengguna update tiap 1.5s.') },
        { target: '.hero-card', title: t('Active Session'), text: t('Distance, time, pace — semua live tracking. Pace dihitung dari GPS distance / elapsed time.'), placement: 'bottom' },
        { target: '.grid-2', title: t('Live Metrics'), text: t('Heart Rate (zone), Heat Index (EPO adjust), Power Output, AIRI Injury Risk — semua ML-driven.'), placement: 'top' },
        { target: '.aura-cyan.card:not(.run-map-card):not(.hero-card)', title: t('RPAE Zone Timer'), text: t('Waktu di zona Z1/Z2/Z3 dihitung otomatis. Target adaptif sesuai EPO + heat index.'), placement: 'top' },
        { target: '.action-grid', title: t('Kontrol Sesi'), text: t('Pause atau Stop & Save. Stop akan auto-save ke history + hitung RRSS reward.'), placement: 'top' },
        { target: '.bottom-nav', title: t('Navigation'), text: t('Selesai sesi? Tap Home untuk kembali ke dashboard. Tour Running selesai!'), placement: 'top' },
      ], { tourId: 'running', onComplete: (c) => { if (c) AervinexToast?.(t('Tour Running selesai · safe running!'), 'success'); } });
    },

    // ── RECOVERY TOUR ─────────────────────────────────────
    startRecoveryTour(force = false) {
      if (!force && isCompletedFor('recovery')) return;
      const t = (k) => window.AervinexI18n?.t(k) || k;
      this.start([
        { target: '.hero-card', title: t('RRSS · Recovery Readiness Score'), text: t('ML XGBoost yang menggabungkan HRV (RMSSD, SDNN, LF/HF), resting HR, dan stres autonomic. Skor 0-100.'), placement: 'bottom' },
        { target: '.grid-2', title: t('HRV Breakdown'), text: t('RMSSD (vagal tone), SDNN (global ANS), LF/HF (sympathetic balance), Resting HR. Tap kartu untuk detail.'), placement: 'top' },
        { target: '.list-card', title: t('Rekomendasi Personal'), text: t('AI memberi saran spesifik: latihan intensitas tinggi besok, tidur 7+ jam, hidrasi prep. Berdasar trend HRV 7 hari.'), placement: 'top' },
        { target: '.bottom-nav', title: t('Done'), text: t('Recovery dipantau 24 jam. Tour Recovery selesai!'), placement: 'top' },
      ], { tourId: 'recovery', onComplete: (c) => { if (c) AervinexToast?.(t('Tour Recovery selesai!'), 'success'); } });
    },

    // ── HISTORY TOUR ──────────────────────────────────────
    startHistoryTour(force = false) {
      if (!force && isCompletedFor('history')) return;
      const t = (k) => window.AervinexI18n?.t(k) || k;
      this.start([
        { target: '.chart-card', title: t('TEPRS & HR Trend'), text: t('Sliding window chart — titik tertua hilang, titik baru muncul tiap 1.8s. Bukan animasi palsu — data ML real.') },
        { target: '.tab-nav', title: t('Time Range'), text: t('Switch 7d / 30d / 1y. Dataset regenerate dengan jitter berbeda — 1y lebih volatile.'), placement: 'bottom' },
        { target: '.aura-cyan.list-card', title: t('Sesi Terbaru'), text: t('Tap row untuk detail: map rute, splits per km, HR chart, calories, environment context.'), placement: 'top' },
        { target: '.bottom-nav', title: t('Done'), text: t('History tersinkronisasi cloud · valid sampai 90 hari. Tour History selesai!'), placement: 'top' },
      ], { tourId: 'history', onComplete: (c) => { if (c) AervinexToast?.(t('Tour History selesai!'), 'success'); } });
    },
  };
})();
