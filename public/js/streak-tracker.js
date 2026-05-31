/*!
 * AERVINEX Streak Tracker
 * ---------------------------------------------------------------
 * Track daily login streak via Firestore:
 *   users/{uid}.streak = { current: number, longest: number, lastDate: 'YYYY-MM-DD' }
 *
 * Trigger: panggil window.AervinexStreak.tick() di dashboard load.
 * Setiap pembukaan dashboard akan:
 *   - Jika lastDate == today    -> tidak naik (sudah dihitung)
 *   - Jika lastDate == yesterday -> current++ (continue streak)
 *   - Else                       -> reset current = 1 (streak break)
 *   - longest = max(longest, current)
 *
 * Render badge:
 *   AervinexStreak.renderBadge(targetEl) -> set inner HTML "🔥 N hari"
 *   AervinexStreak.renderCard(targetEl)  -> compact card for profile/dashboard top
 */
(function () {
  'use strict';

  const LOCAL_KEY = 'aervinex-streak-local';

  function todayStr(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function yesterdayStr(d = new Date()) {
    const y = new Date(d);
    y.setDate(y.getDate() - 1);
    return todayStr(y);
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); }
    catch { return {}; }
  }
  function writeLocal(s) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); } catch {}
  }

  function computeNext(prev, today) {
    const prevDate = prev?.lastDate;
    if (prevDate === today) {
      return { ...prev, _unchanged: true };
    }
    let current = 1;
    if (prevDate === yesterdayStr()) {
      current = (prev?.current || 0) + 1;
    }
    const longest = Math.max(prev?.longest || 0, current);
    return { current, longest, lastDate: today };
  }

  async function tick() {
    const today = todayStr();
    let state = readLocal();
    const user = (window.auth && window.auth.currentUser) || null;

    if (user && window.db) {
      try {
        const ref = window.db.collection('users').doc(user.uid);
        const snap = await ref.get();
        const data = snap.exists ? (snap.data().streak || {}) : {};
        const next = computeNext(data, today);
        if (!next._unchanged) {
          await ref.set({ streak: { current: next.current, longest: next.longest, lastDate: next.lastDate } }, { merge: true });
        }
        const final = { current: next.current ?? data.current ?? 1, longest: next.longest ?? data.longest ?? 1, lastDate: next.lastDate ?? data.lastDate ?? today };
        writeLocal(final);
        return final;
      } catch (e) {
        console.warn('[streak] firestore failed, fallback local:', e);
      }
    }

    // Anonymous / offline fallback
    const next = computeNext(state, today);
    const final = next._unchanged ? state : { current: next.current, longest: next.longest, lastDate: next.lastDate };
    writeLocal(final);
    return final;
  }

  async function get() {
    const cached = readLocal();
    if (cached.lastDate) return cached;
    return tick();
  }

  function emoji(current) {
    if (current >= 30) return '🏆';
    if (current >= 14) return '⚡';
    if (current >= 7)  return '🔥';
    return '✨';
  }

  function renderBadge(el) {
    if (!el) return;
    get().then(s => {
      const cur = s.current || 0;
      el.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:6px;
          background:linear-gradient(135deg, rgba(0,229,212,0.18), rgba(167,139,250,0.18));
          color:#e6f1f4;font-weight:700;font-size:12px;
          padding:5px 10px;border-radius:999px;border:1px solid rgba(0,229,212,0.3)">
          <span aria-hidden="true">${emoji(cur)}</span>
          <span>${cur} hari streak</span>
        </span>
      `;
    });
  }

  function renderCard(el) {
    if (!el) return;
    get().then(s => {
      const cur = s.current || 0;
      const longest = s.longest || cur;
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;
          background:linear-gradient(135deg, rgba(0,229,212,0.10), rgba(167,139,250,0.10));
          border:1px solid rgba(0,229,212,0.18);border-radius:16px">
          <div style="font-size:32px;line-height:1">${emoji(cur)}</div>
          <div style="flex:1">
            <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9aabb2">Login Streak</div>
            <div style="font-size:22px;font-weight:800;color:#e6f1f4">${cur} <span style="font-size:13px;font-weight:500;color:#9aabb2">hari berturut-turut</span></div>
            <div style="font-size:11.5px;color:#9aabb2;margin-top:2px">Rekor terbaik: ${longest} hari</div>
          </div>
        </div>
      `;
    });
  }

  window.AervinexStreak = { tick, get, renderBadge, renderCard };

  // Auto-tick saat auth ready
  function autoTick() {
    if (window.auth && typeof window.auth.onAuthStateChanged === 'function') {
      window.auth.onAuthStateChanged(() => { tick().catch(() => {}); });
    } else {
      tick().catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoTick);
  } else {
    autoTick();
  }
})();
