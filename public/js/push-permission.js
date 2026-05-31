/*!
 * AERVINEX Push Permission Flow
 * ---------------------------------------------------------------
 * Tampilkan modal "Aktifkan notifikasi" secara non-agresif:
 *   - Trigger paling cepat 2 menit setelah first login per device
 *   - Hanya 1x per session (sessionStorage flag)
 *   - Tidak ditampilkan ulang jika user sudah grant / deny permanent
 *   - Hook ke window.AervinexFCM bila tersedia (lihat fcm-register.js)
 *
 * Style: konsisten dark theme (#0f1923 + cyan #00e5d4 + violet #a78bfa)
 * Bahasa: Indonesia
 *
 * Public API:
 *   window.AervinexPush.maybeShow()  -> evaluate & maybe show
 *   window.AervinexPush.forceShow()  -> show now (untuk tombol Profile)
 */
(function () {
  'use strict';

  const SESSION_KEY = 'aervinex-push-prompt-session';
  const STORE_KEY   = 'aervinex-push-prompt-meta';
  const FIRST_LOGIN_KEY = 'aervinex-first-login-ts';
  const DELAY_MS = 2 * 60 * 1000; // 2 menit
  const COOLDOWN_DAYS = 14;

  function nowMs() { return Date.now(); }

  function readMeta() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function writeMeta(patch) {
    try {
      const cur = readMeta();
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...cur, ...patch }));
    } catch {}
  }

  function ensureFirstLoginStamp() {
    try {
      if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
        localStorage.setItem(FIRST_LOGIN_KEY, String(nowMs()));
      }
    } catch {}
  }

  function eligibleToShow() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return false;
    if (Notification.permission === 'denied') return false;
    if (sessionStorage.getItem(SESSION_KEY)) return false;

    const meta = readMeta();
    if (meta.optedOutAt) {
      const ago = nowMs() - Number(meta.optedOutAt);
      if (ago < COOLDOWN_DAYS * 86400000) return false;
    }
    const firstLogin = Number(localStorage.getItem(FIRST_LOGIN_KEY) || 0);
    if (!firstLogin) return false;
    return (nowMs() - firstLogin) >= DELAY_MS;
  }

  // ── Modal UI ──────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('aervinex-push-style')) return;
    const css = `
      .axpush-overlay {
        position: fixed; inset: 0; z-index: 9990;
        background: rgba(6, 12, 20, 0.72);
        backdrop-filter: blur(8px);
        display: flex; align-items: flex-end; justify-content: center;
        animation: axpushFade 0.25s ease-out;
        padding: 16px;
      }
      .axpush-card {
        width: 100%; max-width: 420px;
        background: linear-gradient(180deg, rgba(15,25,35,0.96), rgba(15,25,35,1));
        border: 1px solid rgba(0,229,212,0.18);
        border-radius: 20px;
        padding: 22px 20px 18px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.08);
        animation: axpushSlide 0.32s cubic-bezier(0.2,0.8,0.2,1);
        color: #e6f1f4;
      }
      @keyframes axpushFade { from { opacity: 0 } to { opacity: 1 } }
      @keyframes axpushSlide { from { transform: translateY(20px); opacity:0 } to { transform: none; opacity:1 } }
      .axpush-icon {
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, #00e5d4, #a78bfa);
        display: flex; align-items: center; justify-content: center;
        color: #0f1923; margin-bottom: 12px;
        box-shadow: 0 0 24px rgba(0,229,212,0.4);
      }
      .axpush-icon svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
      .axpush-title { font-size: 17px; font-weight: 700; margin: 0 0 6px; }
      .axpush-desc  { font-size: 13.5px; line-height: 1.55; color: #b6c4cb; margin: 0 0 14px; }
      .axpush-bullets { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
      .axpush-bullets li { font-size: 12.5px; color: #c8d6dc; display:flex; gap:8px; align-items:flex-start; }
      .axpush-bullets li::before { content: '✓'; color: #00e5d4; font-weight: 700; }
      .axpush-actions { display: flex; gap: 10px; }
      .axpush-btn {
        flex: 1; padding: 12px 14px; border-radius: 12px;
        border: none; cursor: pointer; font-weight: 600; font-size: 13.5px;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .axpush-btn.primary {
        background: linear-gradient(135deg, #00e5d4, #a78bfa);
        color: #0f1923;
        box-shadow: 0 4px 14px rgba(0,229,212,0.32);
      }
      .axpush-btn.primary:hover { transform: translateY(-1px); }
      .axpush-btn.ghost {
        background: transparent; color: #9aabb2;
        border: 1px solid rgba(255,255,255,0.1);
      }
      @media (min-width: 640px) { .axpush-overlay { align-items: center; } }
    `;
    const tag = document.createElement('style');
    tag.id = 'aervinex-push-style';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function buildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'axpush-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="axpush-card">
        <div class="axpush-icon">
          <svg viewBox="0 0 24 24"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/></svg>
        </div>
        <h3 class="axpush-title">Aktifkan notifikasi AERVINEX</h3>
        <p class="axpush-desc">Dapatkan peringatan dini saat polusi udara, panas, atau kondisi fisiologis Anda berada di luar batas aman.</p>
        <ul class="axpush-bullets">
          <li>Alert real-time PM2.5 &amp; heat extreme</li>
          <li>Recovery reminder &amp; daily summary</li>
          <li>Ringan — &lt;5 notifikasi penting per hari</li>
        </ul>
        <div class="axpush-actions">
          <button class="axpush-btn ghost" data-axpush-action="later">Nanti saja</button>
          <button class="axpush-btn primary" data-axpush-action="enable">Aktifkan</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function close(node, optedOut) {
    if (!node || !node.parentNode) return;
    node.parentNode.removeChild(node);
    if (optedOut) writeMeta({ optedOutAt: nowMs() });
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
  }

  async function requestPermission() {
    try {
      const fcm = window.AervinexFCM;
      if (fcm && typeof fcm.requestPermission === 'function') {
        return await fcm.requestPermission();
      }
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (e) {
      console.warn('[push] request permission failed:', e);
      return false;
    }
  }

  function showModal() {
    injectStyles();
    const node = buildModal();
    document.body.appendChild(node);
    node.addEventListener('click', (e) => {
      const action = e.target.closest('[data-axpush-action]')?.dataset.axpushAction;
      if (!action) {
        if (e.target === node) close(node, false); // tap outside = "later"
        return;
      }
      if (action === 'later') {
        close(node, true);
      } else if (action === 'enable') {
        requestPermission().then((ok) => {
          close(node, !ok);
          if (ok && window.AervinexToast) {
            window.AervinexToast('Notifikasi diaktifkan ✓', 'success', 2400);
          }
        });
      }
    });
  }

  function maybeShow() {
    ensureFirstLoginStamp();
    if (!eligibleToShow()) return false;
    // Defer to next idle so it doesn't block first paint
    const run = () => showModal();
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 600);
    return true;
  }

  function forceShow() { showModal(); }

  function scheduleCheck() {
    ensureFirstLoginStamp();
    const firstLogin = Number(localStorage.getItem(FIRST_LOGIN_KEY) || 0);
    const remaining = Math.max(0, DELAY_MS - (nowMs() - firstLogin));
    if (remaining <= 0) {
      maybeShow();
    } else {
      setTimeout(maybeShow, Math.min(remaining + 1000, DELAY_MS));
    }
  }

  window.AervinexPush = { maybeShow, forceShow, scheduleCheck };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleCheck);
  } else {
    scheduleCheck();
  }
})();
