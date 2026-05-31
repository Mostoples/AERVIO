/**
 * sendAlert — Firestore trigger on alerts/{alertId}.
 * --------------------------------------------------------------
 * On alert doc create:
 *   1. Read alert.uid, alert.title, alert.body, alert.severity
 *   2. Lookup users/{uid}.fcmToken (or fcmTokens map for multi-device)
 *   3. Send push via admin.messaging().send(...)
 *   4. Write delivery status back to alert doc (delivered: true | error: …)
 *
 * Also dispatches to webhookDispatcher via Firestore — see that module.
 */
'use strict';

module.exports = (regional, admin) => regional
  .firestore
  .document('alerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data() || {};
    const uid = alert.uid;
    if (!uid) {
      await snap.ref.set({ delivered: false, error: 'no uid' }, { merge: true });
      return null;
    }

    try {
      const userSnap = await admin.firestore().collection('users').doc(uid).get();
      if (!userSnap.exists) {
        await snap.ref.set({ delivered: false, error: 'user not found' }, { merge: true });
        return null;
      }
      const user = userSnap.data() || {};
      // Support both legacy `fcmToken` and modern `fcmTokens: { deviceId: token }`.
      const tokens = [];
      if (typeof user.fcmToken === 'string') tokens.push(user.fcmToken);
      if (user.fcmTokens && typeof user.fcmTokens === 'object') {
        for (const t of Object.values(user.fcmTokens)) {
          if (typeof t === 'string') tokens.push(t);
        }
      }
      if (!tokens.length) {
        await snap.ref.set({ delivered: false, error: 'no fcm tokens' }, { merge: true });
        return null;
      }

      const severity = (alert.severity || 'info').toString();
      const message = {
        notification: {
          title: alert.title || 'AERVINEX Alert',
          body: (alert.body || '').slice(0, 240),
        },
        data: {
          alertId: context.params.alertId,
          severity,
          riskId: alert.riskId || '',
          deepLink: alert.deepLink || '/alerts.html',
        },
        android: {
          priority: severity === 'critical' ? 'high' : 'normal',
        },
        apns: {
          payload: { aps: { sound: severity === 'critical' ? 'default' : null } },
        },
      };

      // Send to all tokens; collect bad-token cleanups.
      const results = await Promise.allSettled(tokens.map((t) =>
        admin.messaging().send({ ...message, token: t })
      ));
      const failed = [];
      results.forEach((r, i) => {
        if (r.status === 'rejected') failed.push({ token: tokens[i], error: String(r.reason) });
      });

      await snap.ref.set({
        delivered: failed.length < tokens.length,
        delivered_count: tokens.length - failed.length,
        failed,
        deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      return null;
    } catch (err) {
      await snap.ref.set({ delivered: false, error: String(err) }, { merge: true });
      return null;
    }
  });
