/*!
 * AERVINEX Pricing A/B Test
 * ---------------------------------------------------------------
 * Assign user ke variant (A: Rp49.000 — control, B: Rp59.000 — high)
 * Sticky per device via localStorage.
 * Track conversion ke Firestore: pricing_experiments/{uid_or_anon}/{event}
 *
 * Usage di index.html / subscription.html:
 *   <span data-pricing-pro></span>      -> diisi harga sesuai variant
 *   data-pricing-pro-period attr        -> diisi suffix /bulan
 *   data-pricing-track="click_upgrade"  -> click event tracked
 *
 * Public API:
 *   window.AervinexPricingAB.variant()  -> 'A' | 'B'
 *   window.AervinexPricingAB.price()    -> { pro: number, family: number }
 *   window.AervinexPricingAB.track(event, meta?)
 */
(function () {
  'use strict';

  const STORE_KEY = 'aervinex-pricing-variant';
  const VARIANTS = {
    A: { pro: 49000, family: 149000, label: 'control-49k' },
    B: { pro: 59000, family: 169000, label: 'high-59k' },
  };

  function assign() {
    let v = null;
    try { v = localStorage.getItem(STORE_KEY); } catch {}
    if (v && VARIANTS[v]) return v;
    v = Math.random() < 0.5 ? 'A' : 'B';
    try { localStorage.setItem(STORE_KEY, v); } catch {}
    track('assigned', { variant: v });
    return v;
  }

  function variant() { return assign(); }
  function price() { return VARIANTS[variant()]; }

  function fmtIDR(n) {
    return 'Rp' + n.toLocaleString('id-ID');
  }

  async function track(event, meta = {}) {
    const v = variant();
    const user = window.auth?.currentUser;
    const uid = user ? user.uid : ('anon-' + (function(){
      try {
        let a = localStorage.getItem('aervinex-anon-id');
        if (!a) { a = Math.random().toString(36).slice(2, 12); localStorage.setItem('aervinex-anon-id', a); }
        return a;
      } catch { return Math.random().toString(36).slice(2, 12); }
    })());
    const payload = {
      variant: v, event, meta,
      ts: Date.now(),
      page: location.pathname,
      uid,
    };
    if (window.db) {
      try {
        await window.db.collection('pricing_experiments').doc(uid)
          .collection('events').doc(`${event}-${payload.ts}`)
          .set({ ...payload, createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date() });
      } catch (e) { /* offline / not authed: best effort */ }
    }
  }

  function applyDom() {
    const p = price();
    document.querySelectorAll('[data-pricing-pro]').forEach(el => {
      el.textContent = fmtIDR(p.pro);
    });
    document.querySelectorAll('[data-pricing-family]').forEach(el => {
      el.textContent = fmtIDR(p.family);
    });
    // Number-only variants (used inside templates where 'Rp' is already in DOM)
    document.querySelectorAll('[data-pricing-pro-raw]').forEach(el => {
      el.textContent = p.pro.toLocaleString('id-ID');
    });
    document.querySelectorAll('[data-pricing-family-raw]').forEach(el => {
      el.textContent = p.family.toLocaleString('id-ID');
    });
    document.querySelectorAll('[data-pricing-variant]').forEach(el => {
      el.textContent = variant();
    });
    // Auto-track clicks on tagged links
    document.querySelectorAll('[data-pricing-track]').forEach(el => {
      if (el.__axPricingBound) return;
      el.__axPricingBound = true;
      el.addEventListener('click', () => {
        const ev = el.getAttribute('data-pricing-track') || 'click';
        track(ev, { href: el.getAttribute('href') || null });
      });
    });
  }

  window.AervinexPricingAB = { variant, price, track, applyDom };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { assign(); applyDom(); });
  } else {
    assign(); applyDom();
  }
})();
