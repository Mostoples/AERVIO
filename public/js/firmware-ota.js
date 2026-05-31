/* =============================================================================
 *  AERVINEX — Firmware OTA Admin Client
 *  -----------------------------------------------------------------------------
 *  Uploads .bin firmware files to Firebase Storage, registers metadata in
 *  Firestore (firmware_versions/{version}), and triggers a Cloud Function
 *  (stub) to broadcast FCM update notifications to paired devices.
 *
 *  Storage path : firmware/{version}/aervinex-sensor.bin
 *  Firestore    : firmware_versions/{version}
 *                   { version, channel, sha256, sizeBytes, releaseNotes,
 *                     downloadURL, releasedAt, releasedBy }
 *
 *  This file intentionally hides behind isAdmin() in firestore.rules — non-admins
 *  cannot publish.
 * =============================================================================
 */
(function (global) {
  'use strict';

  const COL = 'firmware_versions';
  const STORAGE_PREFIX = 'firmware';
  const FN_TRIGGER = '/api/notifyFirmwareUpdate'; // stub: HTTPS Function endpoint

  function db() { return global.db; }
  function storage() {
    if (!global.firebase || !global.firebase.storage) {
      throw new Error('firebase.storage SDK belum dimuat — sertakan firebase-storage-compat.js');
    }
    return global.firebase.storage();
  }
  function uid() {
    return global.auth && global.auth.currentUser ? global.auth.currentUser.uid : null;
  }
  function userEmail() {
    return global.auth && global.auth.currentUser ? global.auth.currentUser.email : null;
  }

  async function sha256(file) {
    if (!global.crypto || !global.crypto.subtle) return null;
    const buf = await file.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function validVersion(v) {
    return /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(v || '');
  }

  async function uploadFirmware({ file, version, channel = 'stable', releaseNotes = '' }, onProgress) {
    if (!file) throw new Error('File firmware (.bin) wajib');
    if (!validVersion(version)) throw new Error('Format versi harus semver (mis. 1.0.4 atau 1.1.0-beta.2)');
    if (!uid()) throw new Error('Login admin diperlukan');

    const path = `${STORAGE_PREFIX}/${version}/aervinex-sensor.bin`;
    const ref = storage().ref(path);
    const task = ref.put(file, {
      contentType: 'application/octet-stream',
      customMetadata: { version, channel, uploadedBy: userEmail() || '' },
    });

    await new Promise((resolve, reject) => {
      task.on('state_changed',
        (snap) => {
          const pct = snap.totalBytes ? (snap.bytesTransferred / snap.totalBytes) * 100 : 0;
          if (typeof onProgress === 'function') onProgress(pct);
        },
        (err) => reject(err),
        () => resolve()
      );
    });

    const downloadURL = await ref.getDownloadURL();
    const digest = await sha256(file).catch(() => null);

    await db().collection(COL).doc(version).set({
      version,
      channel,
      releaseNotes: String(releaseNotes).slice(0, 4000),
      sha256: digest,
      sizeBytes: file.size,
      downloadURL,
      storagePath: path,
      releasedAt: firebase.firestore.FieldValue.serverTimestamp(),
      releasedBy: userEmail() || null,
      uid: uid(),
    }, { merge: true });

    return { version, downloadURL, sha256: digest, sizeBytes: file.size };
  }

  async function listVersions(limit = 25) {
    const snap = await db().collection(COL).orderBy('releasedAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async function deleteVersion(version) {
    if (!validVersion(version)) throw new Error('Versi tidak valid');
    try {
      await storage().ref(`${STORAGE_PREFIX}/${version}/aervinex-sensor.bin`).delete();
    } catch (e) { /* file might already be gone — proceed */ }
    await db().collection(COL).doc(version).delete();
    return true;
  }

  // Stub: real implementation lives in Cloud Functions (notifyFirmwareUpdate)
  // which fans out FCM to all paired_devices with channel match.
  async function notifyFleet(version, channel = 'stable') {
    try {
      const res = await fetch(FN_TRIGGER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, channel }),
      });
      if (!res.ok) throw new Error('Function returned ' + res.status);
      return await res.json();
    } catch (e) {
      // Soft-fail when running locally without the function deployed
      console.warn('[ota] notifyFleet stub error:', e?.message);
      return { ok: false, queued: 0, note: 'Function tidak tersedia — versi tetap ter-publish.' };
    }
  }

  global.AervinexFirmwareOTA = {
    uploadFirmware,
    listVersions,
    deleteVersion,
    notifyFleet,
    validVersion,
  };
})(typeof window !== 'undefined' ? window : globalThis);
