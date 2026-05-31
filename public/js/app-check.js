// ============================================================
// AERVINEX — Firebase App Check (reCAPTCHA v3 provider)
// ------------------------------------------------------------
// Loaded AFTER firebase-config.js (firebase.initializeApp must
// already have run). Uses compat SDK to match the rest of the app.
//
// SETUP (one-time):
//   1. Firebase Console -> Project Settings -> App Check -> Web Apps
//      -> Register dengan reCAPTCHA v3 provider
//   2. Buat reCAPTCHA v3 site key di https://www.google.com/recaptcha/admin
//      domain: aervinex.web.app + localhost (dev)
//   3. Replace `RECAPTCHA_V3_SITE_KEY_PLACEHOLDER` di bawah dengan site key
//   4. Di Firebase Console -> App Check -> Firestore -> Enforce (after testing)
//
// Lihat docs/security-appcheck.md untuk panduan lengkap.
// ============================================================

(function () {
  'use strict';

  // PLACEHOLDER — replace dengan reCAPTCHA v3 site key dari Google reCAPTCHA console
  var RECAPTCHA_V3_SITE_KEY = 'RECAPTCHA_V3_SITE_KEY_PLACEHOLDER';

  // Debug token toggle: in dev, set window.AERVINEX_APPCHECK_DEBUG = true
  // sebelum script ini load untuk auto-generate debug token (cek browser console).
  if (typeof self !== 'undefined' && self.AERVINEX_APPCHECK_DEBUG) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Guard: only run if firebase compat is loaded and appCheck is available
  if (typeof firebase === 'undefined' || typeof firebase.appCheck !== 'function') {
    // App Check SDK belum dimuat — skip silently. Tambah
    //   <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check-compat.js"></script>
    // di HTML untuk mengaktifkan.
    if (typeof console !== 'undefined') {
      console.info('[AppCheck] SDK not loaded — skipping init. See docs/security-appcheck.md');
    }
    return;
  }

  // Guard: don't double-init
  if (window.__AERVINEX_APPCHECK_INITED) return;
  window.__AERVINEX_APPCHECK_INITED = true;

  // Guard: placeholder key — refuse to enforce so dev environment doesn't break
  if (RECAPTCHA_V3_SITE_KEY === 'RECAPTCHA_V3_SITE_KEY_PLACEHOLDER') {
    console.warn(
      '[AppCheck] Site key is a PLACEHOLDER. Replace in public/js/app-check.js. ' +
      'See docs/security-appcheck.md for setup instructions.'
    );
    return;
  }

  try {
    var appCheck = firebase.appCheck();
    appCheck.activate(
      new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      /* isTokenAutoRefreshEnabled */ true
    );
    console.info('[AppCheck] activated with reCAPTCHA v3');
  } catch (err) {
    console.error('[AppCheck] activation failed', err);
  }
})();
