/*!
 * AERVINEX In-App NPS Feedback Prompt
 * ---------------------------------------------------------------
 * Trigger: setiap 30 hari, atau setelah 5 sesi running tercatat.
 * Tulis ke Firestore: feedback/{uid}/{timestamp}.
 *
 * Public API:
 *   window.AervinexFeedback.recordRunning()   -> increment running counter
 *   window.AervinexFeedback.maybeShow()       -> evaluate & maybe show modal
 *   window.AervinexFeedback.forceShow()       -> open prompt manually (Settings)
 */
(function () {
  'use strict';

  const STORE_KEY = 'aervinex-feedback-meta';
  const SESSION_KEY = 'aervinex-feedback-session-shown';
  const INTERVAL_MS = 30 * 86400000;   // 30 hari
  const RUN_THRESHOLD = 5;

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

  function recordRunning() {
    const m = readMeta();
    const next = (m.runs || 0) + 1;
    writeMeta({ runs: next });
    if (next >= RUN_THRESHOLD) maybeShow();
  }

  function eligible() {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    const m = readMeta();
    const lastShown = Number(m.lastShownAt || 0);
    const dueByTime = !lastShown || (nowMs() - lastShown) >= INTERVAL_MS;
    const dueByRuns = (m.runs || 0) >= RUN_THRESHOLD;
    // Don't show same week if user already dismissed/submitted
    if (lastShown && (nowMs() - lastShown) < 7 * 86400000) return false;
    return dueByTime || dueByRuns;
  }

  // ── Styles ────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('aervinex-fb-style')) return;
    const css = `
      .axfb-overlay {
        position: fixed; inset: 0; z-index: 9988;
        background: rgba(6,12,20,0.72);
        backdrop-filter: blur(8px);
        display: flex; align-items: flex-end; justify-content: center;
        padding: 16px;
        animation: axfbFade 0.25s;
      }
      .axfb-card {
        width: 100%; max-width: 440px;
        background: linear-gradient(180deg, #131e29, #0f1923);
        border: 1px solid rgba(167,139,250,0.25);
        border-radius: 22px;
        padding: 22px 20px 18px;
        color: #e6f1f4;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        animation: axfbSlide 0.32s cubic-bezier(0.2,0.8,0.2,1);
      }
      @keyframes axfbFade { from { opacity:0 } to { opacity:1 } }
      @keyframes axfbSlide { from { transform: translateY(20px); opacity:0 } to { transform:none; opacity:1 } }
      .axfb-title { font-size: 17px; font-weight: 800; margin: 0 0 6px; }
      .axfb-desc { font-size: 13.5px; color: #b6c4cb; margin: 0 0 14px; line-height:1.5; }
      .axfb-scale { display: grid; grid-template-columns: repeat(11, 1fr); gap: 5px; margin-bottom: 14px; }
      .axfb-num {
        aspect-ratio: 1; border-radius: 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        color: #c8d6dc; font-size: 12.5px; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
        display:flex; align-items:center; justify-content:center;
      }
      .axfb-num:hover { background: rgba(0,229,212,0.12); border-color: rgba(0,229,212,0.4); color:#fff; }
      .axfb-num.selected { background: linear-gradient(135deg, #00e5d4, #a78bfa); color:#0f1923; border-color: transparent; }
      .axfb-labels { display:flex; justify-content:space-between; font-size:10.5px; color:#7d8d94; margin-bottom: 14px; }
      .axfb-comment {
        width: 100%; box-sizing: border-box;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 10px 12px; color: #e6f1f4;
        font-size: 13px; resize: vertical; min-height: 60px;
        margin-bottom: 12px;
      }
      .axfb-comment:focus { outline: none; border-color: rgba(0,229,212,0.5); }
      .axfb-actions { display: flex; gap: 10px; }
      .axfb-btn {
        flex: 1; padding: 11px 14px; border-radius: 12px; border: none;
        cursor: pointer; font-weight: 600; font-size: 13px;
      }
      .axfb-btn.primary { background: linear-gradient(135deg,#00e5d4,#a78bfa); color:#0f1923; }
      .axfb-btn.primary[disabled] { opacity:0.4; cursor:not-allowed; }
      .axfb-btn.ghost { background: transparent; color:#9aabb2; border:1px solid rgba(255,255,255,0.1); }
    `;
    const s = document.createElement('style');
    s.id = 'aervinex-fb-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  let pickedScore = null;
  function buildModal() {
    const wrap = document.createElement('div');
    wrap.className = 'axfb-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = `
      <div class="axfb-card">
        <h3 class="axfb-title">Bagaimana pengalaman Anda dengan AERVINEX?</h3>
        <p class="axfb-desc">Seberapa besar kemungkinan Anda merekomendasikan AERVINEX ke teman atau kolega? Skor jujur Anda membantu kami berkembang.</p>
        <div class="axfb-scale" id="axfbScale">
          ${Array.from({length:11}, (_, i) => `<button type="button" class="axfb-num" data-score="${i}">${i}</button>`).join('')}
        </div>
        <div class="axfb-labels"><span>Tidak mungkin</span><span>Sangat mungkin</span></div>
        <textarea class="axfb-comment" id="axfbComment" placeholder="Apa yang bisa ditingkatkan? (opsional)" maxlength="500"></textarea>
        <div class="axfb-actions">
          <button class="axfb-btn ghost" data-act="dismiss">Nanti</button>
          <button class="axfb-btn primary" data-act="submit" disabled>Kirim</button>
        </div>
      </div>
    `;
    return wrap;
  }

  async function submit(score, comment) {
    const user = (window.auth && window.auth.currentUser) || null;
    const payload = {
      score, comment: comment.slice(0, 500),
      uid: user ? user.uid : 'anon',
      page: location.pathname,
      ts: Date.now(),
      createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
    };
    if (user && window.db) {
      try {
        await window.db.collection('feedback').doc(user.uid)
          .collection('responses').doc(String(payload.ts))
          .set(payload);
      } catch (e) { console.warn('[feedback] write failed', e); }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem('aervinex-feedback-anon') || '[]');
        local.push(payload);
        localStorage.setItem('aervinex-feedback-anon', JSON.stringify(local.slice(-20)));
      } catch {}
    }
    writeMeta({ lastShownAt: nowMs(), runs: 0, lastScore: score });
  }

  function close(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
  }

  function show() {
    injectStyles();
    pickedScore = null;
    const node = buildModal();
    document.body.appendChild(node);
    const submitBtn = node.querySelector('[data-act="submit"]');

    node.addEventListener('click', (e) => {
      const numBtn = e.target.closest('.axfb-num');
      if (numBtn) {
        pickedScore = parseInt(numBtn.dataset.score, 10);
        node.querySelectorAll('.axfb-num').forEach(b => b.classList.toggle('selected', b === numBtn));
        submitBtn.disabled = false;
        return;
      }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'dismiss') {
        writeMeta({ lastShownAt: nowMs() });
        close(node);
      } else if (act === 'submit' && pickedScore != null) {
        const comment = node.querySelector('#axfbComment').value.trim();
        submit(pickedScore, comment).finally(() => {
          if (window.AervinexToast) window.AervinexToast('Terima kasih atas feedback Anda 🙏', 'success', 2500);
          close(node);
        });
      }
    });
  }

  function maybeShow() {
    if (!eligible()) return false;
    setTimeout(show, 800);
    return true;
  }

  window.AervinexFeedback = { recordRunning, maybeShow, forceShow: show };

  // Auto eligibility check after small delay (let page settle)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(maybeShow, 4000));
  } else {
    setTimeout(maybeShow, 4000);
  }
})();
