/**
 * exportUserData — HTTPS callable.
 * --------------------------------------------------------------
 * GDPR / UU PDP "Right to data portability" handler.
 *
 * Steps:
 *   1. Auth required — context.auth.uid only (no admin override; users
 *      ask for *their own* data).
 *   2. Walk: users/{uid}, health_logs (uid==), sessions (uid==),
 *      assessments (uid==), alerts (uid==), daily_summary/{uid}.
 *   3. Serialize to JSON, upload to gs://<bucket>/exports/{uid}/{ts}.json
 *   4. Generate signed URL valid 24h, return to caller.
 *
 * Storage path is private; signed URL is the only way to download.
 */
'use strict';

async function collectByUid(db, collection, uid) {
  const snap = await db.collection(collection).where('uid', '==', uid).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

module.exports = (regional, admin) => regional
  .runWith({ memory: '512MB', timeoutSeconds: 120 })
  .https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.uid) {
      throw new (require('firebase-functions')).https.HttpsError(
        'unauthenticated', 'Sign-in required.'
      );
    }
    const uid = context.auth.uid;
    const db = admin.firestore();

    const userDoc = await db.collection('users').doc(uid).get();
    const dump = {
      meta: {
        uid,
        exportedAt: new Date().toISOString(),
        scope: 'GDPR/UU PDP portability bundle',
      },
      profile: userDoc.exists ? userDoc.data() : null,
      health_logs: await collectByUid(db, 'health_logs', uid),
      sessions:    await collectByUid(db, 'sessions', uid),
      assessments: await collectByUid(db, 'assessments', uid),
      alerts:      await collectByUid(db, 'alerts', uid),
      xai_audit:   await collectByUid(db, 'xai_audit', uid),
    };

    // daily_summary lives at daily_summary/{uid}/days/{date}
    const daySnap = await db
      .collection('daily_summary').doc(uid)
      .collection('days').get();
    dump.daily_summary = daySnap.docs.map((d) => ({ date: d.id, ...d.data() }));

    const bucket = admin.storage().bucket();
    const ts = Date.now();
    const path = `exports/${uid}/${ts}.json`;
    const file = bucket.file(path);
    await file.save(JSON.stringify(dump, null, 2), {
      contentType: 'application/json',
      metadata: { metadata: { uid, exportedAt: String(ts) } },
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    // Audit
    await db.collection('audit_log').add({
      uid,
      action: 'exportUserData',
      path,
      ts: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, url, expires_in_seconds: 24 * 3600, path };
  });
