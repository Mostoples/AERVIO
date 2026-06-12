/* AERVINEX Onboarding Wizard — 6-step personalization flow.
   Steps: 1) Welcome, 2) Profile, 3) Goals, 4) Health Conditions,
          5) Risk Priorities, 6) Permissions, 7) Done.
   Persists to Firestore users/{uid}.onboarding + localStorage flag.
*/
(function () {
  'use strict';

  const STEPS = ['welcome', 'profile', 'goals', 'conditions', 'priorities', 'permissions', 'done'];
  const STORAGE_KEY = 'aervinex-onboarding';

  const state = {
    step: 0,
    profile: {
      name: '',
      age: 25,
      gender: '',
      weight: 65,
      height: 168,
      city: '',
    },
    goals: [],
    conditions: [],
    priorities: [],
    permissions: { location: false, notifications: false, wearable: false, dataConsent: false },
  };

  // Restore from localStorage if user reloaded mid-flow
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (cached.profile) Object.assign(state, cached);
  } catch {}

  function persistLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  // ── Funnel analytics ─────────────────────────────────────────────
  // Writes onboarding_funnel/{uid}/steps/{stepKey} every time user enters a step.
  // Anonymous (pre-auth) users buffered locally and flushed on commit.
  function trackFunnel(stepKey, extra = {}) {
    const payload = {
      step: stepKey,
      stepIndex: STEPS.indexOf(stepKey),
      ts: Date.now(),
      page: location.pathname,
      ...extra,
    };
    const user = window.auth?.currentUser || window.AERVINEXAuth?.currentUser;
    if (user && window.db) {
      try {
        window.db.collection('onboarding_funnel').doc(user.uid)
          .collection('steps').doc(stepKey)
          .set({
            ...payload,
            createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
          }, { merge: true })
          .catch(() => {});
      } catch {}
    } else {
      try {
        const buf = JSON.parse(localStorage.getItem('aervinex-funnel-buf') || '[]');
        buf.push(payload);
        localStorage.setItem('aervinex-funnel-buf', JSON.stringify(buf.slice(-30)));
      } catch {}
    }
  }

  async function flushFunnelBuffer() {
    const user = window.auth?.currentUser || window.AERVINEXAuth?.currentUser;
    if (!user || !window.db) return;
    try {
      const buf = JSON.parse(localStorage.getItem('aervinex-funnel-buf') || '[]');
      if (!buf.length) return;
      const batch = window.db.batch();
      const base = window.db.collection('onboarding_funnel').doc(user.uid).collection('steps');
      buf.forEach(p => batch.set(base.doc(p.step), {
        ...p,
        createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
      }, { merge: true }));
      await batch.commit();
      localStorage.removeItem('aervinex-funnel-buf');
    } catch (e) { /* best-effort */ }
  }

  // ── Step Renderers ─────────────────────────────────────────────────────
  const renderers = {

    welcome(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const tt = window.AervinexI18n?.tt || ((k, v) => k);
      const fname = state.profile.name || (window.AERVINEXAuth?.currentUser?.displayName || '');
      host.innerHTML = `
        <div class="ob-step ob-welcome">
          <div class="ob-emoji">👋</div>
          <h2>${tt('Selamat datang{fname}!', { fname: fname ? ', ' + fname : '' })}</h2>
          <p class="ob-sub">${t('Kami akan ajukan beberapa pertanyaan singkat (~60 detik) untuk mempersonalisasi AERVINEX sesuai tubuh, gaya hidup, dan tujuan Anda. Semua data tersimpan aman di akun Anda.')}</p>
          <ul class="ob-bullets">
            <li><span class="ob-check">✓</span> ${t('Risiko penyakit yang dipantau disesuaikan dengan kondisi Anda')}</li>
            <li><span class="ob-check">✓</span> ${t('Alert dikalibrasi berdasarkan umur & komorbiditas')}</li>
            <li><span class="ob-check">✓</span> ${t('Rekomendasi aktivitas adaptive untuk pelari / urban')}</li>
            <li><span class="ob-check">✓</span> ${t('Data dapat di-export kapan saja')}</li>
          </ul>
          <div class="ob-trust">
            <span>🔒 ${t('Disimpan terenkripsi')}</span>
            <span>🌐 ${t('Hanya untuk akun Anda')}</span>
            <span>📤 ${t('Bisa dihapus')}</span>
          </div>
        </div>
      `;
    },

    profile(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const genderOpts = ['Pria','Wanita','Lainnya'];
      host.innerHTML = `
        <div class="ob-step">
          <h2>${t('Tentang Anda')}</h2>
          <p class="ob-sub">${t('Data dasar untuk kalibrasi model — umur, jenis kelamin, dan komposisi tubuh memengaruhi threshold risiko fisiologis.')}</p>
          <div class="ob-form">
            <label class="ob-field">
              <span>${t('Nama panggilan')}</span>
              <input type="text" id="ob-name" value="${escapeHTML(state.profile.name)}" placeholder="${t('Mis. Andi')}" maxlength="40"/>
            </label>
            <label class="ob-field">
              <span>${t('Umur (tahun)')}</span>
              <input type="number" id="ob-age" value="${state.profile.age}" min="13" max="100"/>
            </label>
            <div class="ob-field">
              <span>${t('Jenis kelamin')}</span>
              <div class="ob-segments">
                ${genderOpts.map(g => `
                  <button type="button" class="ob-seg ${state.profile.gender===g?'active':''}" data-gender="${g}">${t(g)}</button>
                `).join('')}
              </div>
            </div>
            <label class="ob-field">
              <span>${t('Berat (kg)')}</span>
              <input type="number" id="ob-weight" value="${state.profile.weight}" min="30" max="200" step="0.5"/>
            </label>
            <label class="ob-field">
              <span>${t('Tinggi (cm)')}</span>
              <input type="number" id="ob-height" value="${state.profile.height}" min="120" max="220"/>
            </label>
            <label class="ob-field">
              <span>${t('Kota tinggal')}</span>
              <input type="text" id="ob-city" value="${escapeHTML(state.profile.city)}" placeholder="${t('Mis. Jakarta, Surabaya')}" maxlength="60"/>
            </label>
          </div>
        </div>
      `;
      host.querySelectorAll('.ob-seg[data-gender]').forEach(btn => {
        btn.addEventListener('click', () => {
          host.querySelectorAll('.ob-seg[data-gender]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.profile.gender = btn.dataset.gender;
        });
      });
    },

    goals(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const GOALS = [
        { id: 'urban-safety', icon: '🏙️', title: t('Lindungi diri di kota'), desc: t('Polusi, panas, UV saat komuting') },
        { id: 'runner-train', icon: '🏃', title: t('Latihan lari yang aman'), desc: t('Zona HR, recovery, EPO pace adapt') },
        { id: 'health-monitor', icon: '❤️', title: t('Monitor kesehatan harian'), desc: t('HR, SpO₂, HRV, stres, sleep') },
        { id: 'chronic-mgmt', icon: '🩺', title: t('Kelola kondisi kronis'), desc: t('Asma, hipertensi, diabetes risk') },
        { id: 'fitness-improve', icon: '💪', title: t('Tingkatkan VO₂max & fitness'), desc: t('Cardiorespiratory progression') },
        { id: 'family-safe', icon: '👨‍👩‍👧', title: t('Pantau keluarga'), desc: t('Anak, orang tua, alert real-time') },
      ];
      host.innerHTML = `
        <div class="ob-step">
          <h2>${t('Apa tujuan utama Anda?')}</h2>
          <p class="ob-sub">${t('Pilih satu atau beberapa. Kami akan susun homepage, alert priority, dan rekomendasi sesuai pilihan Anda.')}</p>
          <div class="ob-cards">
            ${GOALS.map(g => `
              <button type="button" class="ob-card ${state.goals.includes(g.id)?'selected':''}" data-goal="${g.id}">
                <div class="ob-card-icon">${g.icon}</div>
                <div class="ob-card-title">${g.title}</div>
                <div class="ob-card-desc">${g.desc}</div>
                <div class="ob-card-tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      host.querySelectorAll('.ob-card[data-goal]').forEach(c => {
        c.addEventListener('click', () => {
          const id = c.dataset.goal;
          const idx = state.goals.indexOf(id);
          if (idx >= 0) { state.goals.splice(idx, 1); c.classList.remove('selected'); }
          else { state.goals.push(id); c.classList.add('selected'); }
        });
      });
    },

    conditions(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const CONDS = [
        { id: 'none', icon: '✅', label: t('Tidak ada'), exclusive: true },
        { id: 'asma', icon: '🌬️', label: t('Asma') },
        { id: 'hipertensi', icon: '❤️', label: t('Hipertensi') },
        { id: 'diabetes', icon: '🩸', label: t('Diabetes') },
        { id: 'jantung', icon: '💓', label: t('Penyakit jantung') },
        { id: 'copd', icon: '🫁', label: t('COPD/PPOK') },
        { id: 'alergi', icon: '🤧', label: t('Alergi musiman') },
        { id: 'kehamilan', icon: '🤰', label: t('Hamil') },
        { id: 'lainnya', icon: '⋯', label: t('Lainnya') },
      ];
      host.innerHTML = `
        <div class="ob-step">
          <h2>${t('Kondisi kesehatan')}</h2>
          <p class="ob-sub">${t('Opsional. Membantu kami sesuaikan threshold alert (mis. asma → PM2.5 lebih ketat). Pilih semua yang relevan, atau "Tidak ada".')}</p>
          <div class="ob-chips">
            ${CONDS.map(c => `
              <button type="button" class="ob-chip ${state.conditions.includes(c.id)?'selected':''}" data-cond="${c.id}" data-exclusive="${c.exclusive?1:0}">
                <span>${c.icon}</span>${c.label}
              </button>
            `).join('')}
          </div>
          <div class="ob-info-note">
            💡 ${t('Data ini hanya digunakan untuk personalisasi di akun Anda. Tidak dibagikan ke pihak ketiga.')}
          </div>
        </div>
      `;
      host.querySelectorAll('.ob-chip[data-cond]').forEach(c => {
        c.addEventListener('click', () => {
          const id = c.dataset.cond;
          const isExcl = c.dataset.exclusive === '1';
          if (isExcl) {
            state.conditions = state.conditions.includes(id) ? [] : [id];
          } else {
            state.conditions = state.conditions.filter(x => x !== 'none');
            const idx = state.conditions.indexOf(id);
            if (idx >= 0) state.conditions.splice(idx, 1);
            else state.conditions.push(id);
          }
          renderers.conditions(host);
        });
      });
    },

    priorities(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const PRIO = [
        { id: 'air', icon: '💨', title: t('Kualitas udara'), desc: t('PM2.5, PM10, NO₂, CO') },
        { id: 'heat', icon: '🌡️', title: t('Suhu & heat index'), desc: t('Heat stress, dehidrasi') },
        { id: 'uv', icon: '☀️', title: t('Sinar UV'), desc: t('Sunburn, photokeratitis') },
        { id: 'cardio', icon: '💗', title: t('Jantung & HRV'), desc: t('AFib, takikardia, stres') },
        { id: 'respiratory', icon: '🫁', title: t('Pernapasan'), desc: t('SpO₂, RR, asma, pneumonia') },
        { id: 'mental', icon: '🧠', title: t('Mental & sleep'), desc: t('Anxiety, burnout, insomnia') },
      ];
      host.innerHTML = `
        <div class="ob-step">
          <h2>${t('Apa yang paling penting dipantau?')}</h2>
          <p class="ob-sub">${t('Pilih 2-3 kategori utama. Card prioritas akan diletakkan di atas dashboard Anda.')}</p>
          <div class="ob-cards">
            ${PRIO.map(p => `
              <button type="button" class="ob-card compact ${state.priorities.includes(p.id)?'selected':''}" data-prio="${p.id}">
                <div class="ob-card-icon">${p.icon}</div>
                <div class="ob-card-title">${p.title}</div>
                <div class="ob-card-desc">${p.desc}</div>
                <div class="ob-card-tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      host.querySelectorAll('.ob-card[data-prio]').forEach(c => {
        c.addEventListener('click', () => {
          const id = c.dataset.prio;
          const idx = state.priorities.indexOf(id);
          if (idx >= 0) { state.priorities.splice(idx, 1); c.classList.remove('selected'); }
          else { state.priorities.push(id); c.classList.add('selected'); }
        });
      });
    },

    permissions(host) {
      const t = window.AervinexI18n?.t || (k => k);
      host.innerHTML = `
        <div class="ob-step">
          <h2>${t('Izin perangkat')}</h2>
          <p class="ob-sub">${t('Bisa diatur ulang kapan saja di Profil. Tanpa izin ini, beberapa fitur akan dinonaktifkan.')}</p>
          <div class="ob-perms">
            <label class="ob-perm">
              <div class="ob-perm-icon">📍</div>
              <div class="ob-perm-text">
                <strong>${t('Lokasi (GPS)')}</strong>
                <span>${t('Untuk overlay kualitas udara stasiun terdekat & rute lari aman.')}</span>
              </div>
              <input type="checkbox" class="ob-toggle" id="perm-location" ${state.permissions.location?'checked':''}/>
              <span class="ob-toggle-track"></span>
            </label>
            <label class="ob-perm">
              <div class="ob-perm-icon">🔔</div>
              <div class="ob-perm-text">
                <strong>${t('Notifikasi push')}</strong>
                <span>${t('Alert real-time saat polusi/heat/UV berbahaya atau anomali detak jantung.')}</span>
              </div>
              <input type="checkbox" class="ob-toggle" id="perm-notif" ${state.permissions.notifications?'checked':''}/>
              <span class="ob-toggle-track"></span>
            </label>
            <label class="ob-perm">
              <div class="ob-perm-icon">⌚</div>
              <div class="ob-perm-text">
                <strong>${t('Wearable Bluetooth')}</strong>
                <span>${t('Pairing smartwatch AERVINEX atau watch lain (Garmin/Apple/Fitbit).')}</span>
              </div>
              <input type="checkbox" class="ob-toggle" id="perm-wear" ${state.permissions.wearable?'checked':''}/>
              <span class="ob-toggle-track"></span>
            </label>
            <label class="ob-perm">
              <div class="ob-perm-icon">📊</div>
              <div class="ob-perm-text">
                <strong>${t('Riset anonim (opsional)')}</strong>
                <span>${t('Kontribusikan data terdeidentifikasi untuk perbaikan model. Bisa dicabut kapan saja.')}</span>
              </div>
              <input type="checkbox" class="ob-toggle" id="perm-data" ${state.permissions.dataConsent?'checked':''}/>
              <span class="ob-toggle-track"></span>
            </label>
          </div>
        </div>
      `;
      const bind = (id, key) => {
        const el = host.querySelector('#' + id);
        if (el) el.addEventListener('change', () => state.permissions[key] = el.checked);
      };
      bind('perm-location', 'location');
      bind('perm-notif', 'notifications');
      bind('perm-wear', 'wearable');
      bind('perm-data', 'dataConsent');
    },

    done(host) {
      const t = window.AervinexI18n?.t || (k => k);
      const goalLabels = state.goals.length ? state.goals.length + ' ' + t('tujuan') : t('belum dipilih');
      const priLabels = state.priorities.length ? state.priorities.length + ' ' + t('kategori') : t('belum dipilih');
      const condLabels = state.conditions.length && !state.conditions.includes('none') ? state.conditions.length + ' ' + t('kondisi') : t('tanpa komorbid');
      host.innerHTML = `
        <div class="ob-step ob-done">
          <div class="ob-success-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(0,229,212,0.2)" stroke-width="4"/>
              <circle cx="40" cy="40" r="35" fill="none" stroke="#00e5d4" stroke-width="4" stroke-linecap="round" stroke-dasharray="220" stroke-dashoffset="0" style="transform:rotate(-90deg);transform-origin:center;animation:obDraw 0.9s ease-out"/>
              <path d="M28 42l9 9 16-18" fill="none" stroke="#00e5d4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:60;stroke-dashoffset:0;animation:obDraw 1.2s ease-out"/>
            </svg>
          </div>
          <h2>${t('Personalisasi selesai!')}</h2>
          <p class="ob-sub">${t('AERVINEX siap melindungi Anda. Berikut profil yang tersimpan:')}</p>
          <div class="ob-summary">
            <div class="ob-summary-row"><span>👤 ${t('Nama')}</span><strong>${escapeHTML(state.profile.name||'-')}</strong></div>
            <div class="ob-summary-row"><span>🎂 ${t('Umur')}</span><strong>${state.profile.age} ${t('thn')}</strong></div>
            <div class="ob-summary-row"><span>🎯 ${t('Tujuan')}</span><strong>${goalLabels}</strong></div>
            <div class="ob-summary-row"><span>🩺 ${t('Kondisi')}</span><strong>${condLabels}</strong></div>
            <div class="ob-summary-row"><span>📊 ${t('Prioritas')}</span><strong>${priLabels}</strong></div>
          </div>
          <p class="ob-sub" style="margin-top:14px;font-size:12.5px;opacity:0.7">${t('Dashboard Anda akan otomatis disesuaikan. Anda bisa ubah preferensi kapan saja di menu Profil.')}</p>
        </div>
      `;
    },
  };

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function captureCurrentStep() {
    if (STEPS[state.step] === 'profile') {
      const $ = sel => document.getElementById(sel);
      state.profile.name = $('ob-name')?.value.trim() || state.profile.name;
      state.profile.age = parseInt($('ob-age')?.value || state.profile.age, 10);
      state.profile.weight = parseFloat($('ob-weight')?.value || state.profile.weight);
      state.profile.height = parseInt($('ob-height')?.value || state.profile.height, 10);
      state.profile.city = $('ob-city')?.value.trim() || state.profile.city;
    }
    persistLocal();
  }

  function canAdvance() {
    const cur = STEPS[state.step];
    if (cur === 'profile') {
      return state.profile.name.trim().length > 0
        && state.profile.age >= 13 && state.profile.age <= 100
        && state.profile.gender;
    }
    if (cur === 'goals') return state.goals.length > 0;
    if (cur === 'priorities') return state.priorities.length > 0;
    return true;
  }

  async function commitProfile() {
    const user = window.AERVINEXAuth?.currentUser;
    if (!user) {
      try { localStorage.setItem(STORAGE_KEY + '-pending', '1'); } catch {}
      return;
    }
    try {
      await db.collection('users').doc(user.uid).set({
        name: state.profile.name,
        age: state.profile.age,
        gender: state.profile.gender,
        weight: state.profile.weight,
        height: state.profile.height,
        city: state.profile.city,
        onboarding: {
          completed: true,
          completedAt: firebase.firestore.FieldValue.serverTimestamp(),
          goals: state.goals,
          conditions: state.conditions,
          priorities: state.priorities,
          permissions: state.permissions,
        },
      }, { merge: true });
      try {
        localStorage.setItem('aervinex-onboarded', '1');
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      // Flush funnel buffer + final "done" event
      trackFunnel('done', { completed: true });
      flushFunnelBuffer();
    } catch (e) {
      console.warn('[onboarding] save failed:', e);
    }
  }

  // ── Wizard Driver ──────────────────────────────────────────────────────
  function render() {
    const host = document.getElementById('ob-content');
    const renderer = renderers[STEPS[state.step]];
    if (renderer) renderer(host);
    updateProgress();
    updateButtons();
    host.scrollIntoView({behavior:'smooth', block:'start'});
    // Funnel: record that this step was reached
    trackFunnel(STEPS[state.step], { reachedAt: Date.now() });
  }

  function updateProgress() {
    const dotsHost = document.getElementById('ob-dots');
    if (!dotsHost) return;
    dotsHost.innerHTML = STEPS.map((_, i) => {
      const cls = i < state.step ? 'done' : (i === state.step ? 'active' : '');
      return `<span class="ob-dot ${cls}"></span>`;
    }).join('');
    const pct = ((state.step) / (STEPS.length - 1)) * 100;
    const bar = document.getElementById('ob-bar-fill');
    if (bar) bar.style.width = pct + '%';
    const counter = document.getElementById('ob-counter');
    const tt = window.AervinexI18n?.tt || ((k, v) => k);
    if (counter) counter.textContent = tt('Langkah {step} dari {total}', { step: state.step + 1, total: STEPS.length });
  }

  function updateButtons() {
    const prev = document.getElementById('ob-prev');
    const next = document.getElementById('ob-next');
    if (!prev || !next) return;
    prev.disabled = state.step === 0;
    const t = window.AervinexI18n?.t || (k => k);
    const isLast = state.step === STEPS.length - 1;
    next.querySelector('span')?.remove();
    const txt = isLast ? t('Masuk Dashboard') : (state.step === 0 ? t('Mulai') : t('Lanjut'));
    next.innerHTML = `<span>${txt}</span><svg viewBox="0 0 24 24" class="ico"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
  }

  async function nextStep() {
    captureCurrentStep();
    if (!canAdvance()) {
      shake(document.getElementById('ob-content'));
      return;
    }
    if (state.step === STEPS.length - 1) {
      const t = window.AervinexI18n?.t || (k => k);
      const next = document.getElementById('ob-next');
      next.disabled = true; next.innerHTML = `<span>${t('Menyimpan…')}</span>`;
      await commitProfile();
      location.href = '/dashboard.html';
      return;
    }
    state.step++;
    render();
  }

  function prevStep() {
    captureCurrentStep();
    if (state.step > 0) { state.step--; render(); }
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('ob-shake');
    void el.offsetWidth;
    el.classList.add('ob-shake');
  }

  function skipAll() {
    const t = window.AervinexI18n?.t || (k => k);
    if (!confirm(t('Lewati personalisasi? Anda bisa lakukan ulang kapan saja di Profil.'))) return;
    location.href = '/dashboard.html';
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function init() {
    // Pre-fill name from auth if available
    if (!state.profile.name && window.AERVINEXAuth?.userProfile?.name) {
      state.profile.name = window.AERVINEXAuth.userProfile.name;
    } else if (!state.profile.name && window.AERVINEXAuth?.currentUser?.displayName) {
      state.profile.name = window.AERVINEXAuth.currentUser.displayName;
    }
    document.getElementById('ob-next')?.addEventListener('click', nextStep);
    document.getElementById('ob-prev')?.addEventListener('click', prevStep);
    document.getElementById('ob-skip')?.addEventListener('click', skipAll);
    render();
  }

  window.AervinexOnboarding = { init, state };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
