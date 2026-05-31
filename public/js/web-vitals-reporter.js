/* AERVINEX Web Vitals Reporter
   ----------------------------------------------------------
   Captures Core Web Vitals (LCP, FID/INP-proxy, CLS) using
   the browser PerformanceObserver API and logs them to the
   Firestore collection `web_vitals` (or to console if the
   Firebase SDK is not loaded on the page).

   Usage:
     <script src="/js/web-vitals-reporter.js" defer></script>

   The reporter is sampled at 10% to avoid Firestore write
   pressure. Override via:
     <script>window.__WV_SAMPLE_RATE__ = 1.0;</script>
   before this file loads.

   No external dependency. Pure DOM APIs.
*/
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  var SAMPLE = typeof window.__WV_SAMPLE_RATE__ === 'number' ? window.__WV_SAMPLE_RATE__ : 0.10;
  if (Math.random() > SAMPLE) return;

  var SESSION_ID = (function () {
    try {
      var k = 'aervinex-wv-session';
      var v = sessionStorage.getItem(k);
      if (!v) {
        v = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(k, v);
      }
      return v;
    } catch (_) { return 'anon-' + Date.now(); }
  })();

  var metrics = {
    lcp: null,   // Largest Contentful Paint (ms)
    fid: null,   // First Input Delay (ms) — legacy, INP-like via event timing
    inp: null,   // Interaction to Next Paint (ms) — captured via PerformanceEventTiming
    cls: 0,      // Cumulative Layout Shift (unitless)
    ttfb: null,  // Time To First Byte (ms)
    fcp: null,   // First Contentful Paint (ms)
  };

  function safeObserve(type, cb, opts) {
    try {
      var obs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(cb);
      });
      obs.observe(Object.assign({ type: type, buffered: true }, opts || {}));
      return obs;
    } catch (e) {
      return null;
    }
  }

  // LCP
  safeObserve('largest-contentful-paint', function (e) {
    metrics.lcp = Math.round(e.renderTime || e.loadTime || e.startTime);
  });

  // FCP (paint)
  safeObserve('paint', function (e) {
    if (e.name === 'first-contentful-paint') metrics.fcp = Math.round(e.startTime);
  });

  // CLS — sum of layout-shift entries without recent user input
  safeObserve('layout-shift', function (e) {
    if (!e.hadRecentInput) metrics.cls += e.value;
  });

  // FID-like + INP via event timing
  safeObserve('first-input', function (e) {
    metrics.fid = Math.round(e.processingStart - e.startTime);
  });
  safeObserve('event', function (e) {
    var dur = Math.round(e.duration || 0);
    if (dur > (metrics.inp || 0)) metrics.inp = dur;
  }, { durationThreshold: 16 });

  // TTFB via Navigation Timing
  try {
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav) metrics.ttfb = Math.round(nav.responseStart);
  } catch (_) { /* ignore */ }

  function send() {
    var payload = {
      sessionId: SESSION_ID,
      path: location.pathname,
      url: location.href,
      ref: document.referrer || null,
      ua: navigator.userAgent,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      lang: navigator.language || 'unknown',
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio || 1 },
      conn: (function () {
        var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return c ? { type: c.effectiveType || 'unknown', rtt: c.rtt || null, downlink: c.downlink || null, saveData: !!c.saveData } : null;
      })(),
      metrics: {
        lcp: metrics.lcp,
        fcp: metrics.fcp,
        cls: Number((metrics.cls || 0).toFixed(4)),
        fid: metrics.fid,
        inp: metrics.inp,
        ttfb: metrics.ttfb,
      },
      ts: Date.now(),
    };

    // Try Firestore first (compat SDK pattern used elsewhere in the app)
    try {
      if (window.firebase && firebase.firestore) {
        firebase.firestore().collection('web_vitals').add(payload).catch(function () {
          /* swallow — analytics must never break UX */
        });
        return;
      }
    } catch (_) { /* fall through */ }

    // Fallback — beacon (no-op when offline) + dev console
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/__webvitals',
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      }
    } catch (_) {}
    if (/(localhost|127\.0\.0\.1)/.test(location.hostname)) {
      // Dev visibility only.
      console.info('[web-vitals]', payload);
    }
  }

  // Flush on page hide / unload so we capture the last CLS / INP value.
  var flushed = false;
  function flushOnce() {
    if (flushed) return;
    flushed = true;
    send();
  }
  addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushOnce();
  });
  addEventListener('pagehide', flushOnce);
  // Safety: flush after 30s even if user stays on page
  setTimeout(flushOnce, 30000);
})();
