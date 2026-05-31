/**
 * AERVINEX FCM Registration — client-side helper.
 * --------------------------------------------------------------
 * Usage (after Firebase Auth ready):
 *   await AervinexFCM.register();   // returns token or null
 *   await AervinexFCM.unregister(); // wipes token from user doc
 *
 * Requires:
 *   - Firebase app already initialized via firebase-config.js
 *   - VAPID public key from Firebase Console > Cloud Messaging > Web Push.
 *   - Service worker at /firebase-messaging-sw.js (or fallback to /sw.js).
 *
 * Writes to: users/{uid}.fcmTokens[deviceId] = token
 */
(function () {
  'use strict';

  // Replace with your VAPID public key (Console → Project Settings → Cloud Messaging → Web Push certificates).
  const VAPID_KEY = window.AERVINEX_VAPID_KEY || '';

  function deviceId() {
    let id = localStorage.getItem('aervinex_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem('aervinex_device_id', id);
    }
    return id;
  }

  async function getMessagingSDK() {
    // Compat (v8-style) — AERVINEX uses the compat SDK on the rest of the site.
    if (!window.firebase || !firebase.messaging) {
      console.warn('[FCM] firebase.messaging SDK not loaded.');
      return null;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[FCM] this browser does not support Web Push.');
      return null;
    }
    return firebase.messaging();
  }

  async function ensureServiceWorker() {
    // Prefer the dedicated FCM SW; fall back to the generic PWA SW.
    const candidates = ['/firebase-messaging-sw.js', '/sw.js'];
    for (const path of candidates) {
      try {
        const reg = await navigator.serviceWorker.register(path);
        return reg;
      } catch (_) { /* try next */ }
    }
    return null;
  }

  async function register() {
    try {
      const messaging = await getMessagingSDK();
      if (!messaging) return null;

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        console.info('[FCM] permission not granted.');
        return null;
      }

      const swReg = await ensureServiceWorker();
      const opts = swReg ? { serviceWorkerRegistration: swReg } : {};
      if (VAPID_KEY) opts.vapidKey = VAPID_KEY;

      const token = await messaging.getToken(opts);
      if (!token) return null;

      // Persist to user doc.
      const user = firebase.auth().currentUser;
      if (user && firebase.firestore) {
        await firebase.firestore().collection('users').doc(user.uid).set({
          fcmTokens: { [deviceId()]: token },
          fcmUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      // Foreground message handler — surface as in-app toast.
      messaging.onMessage((payload) => {
        try { window.dispatchEvent(new CustomEvent('aervinex:fcm', { detail: payload })); }
        catch (_) { /* ignore */ }
      });

      return token;
    } catch (e) {
      console.error('[FCM] register failed', e);
      return null;
    }
  }

  async function unregister() {
    try {
      const messaging = await getMessagingSDK();
      if (!messaging) return false;
      await messaging.deleteToken();
      const user = firebase.auth().currentUser;
      if (user && firebase.firestore) {
        await firebase.firestore().collection('users').doc(user.uid).update({
          [`fcmTokens.${deviceId()}`]: firebase.firestore.FieldValue.delete(),
        });
      }
      return true;
    } catch (e) {
      console.warn('[FCM] unregister failed', e);
      return false;
    }
  }

  window.AervinexFCM = { register, unregister, deviceId };
})();
