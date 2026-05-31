/**
 * exportToBQ — HTTPS callable (admin only) — manual fallback BigQuery export.
 * --------------------------------------------------------------
 * Preferred path is the official "Stream Firestore to BigQuery" extension
 * (see docs/bigquery-setup.md). This function provides a manual one-shot
 * dump for collections/date-ranges the extension misses.
 *
 * Inputs:
 *   { collection: 'sessions'|'assessments'|'alerts', startTs, endTs }
 *
 * Auth: only admins (allow-list checked against users/{uid}.isAdmin).
 *
 * NB: This is a *stub-grade* exporter — for production, prefer extension.
 */
'use strict';

const ADMIN_EMAILS = [
  'cooxnime@gmail.com',
  'fadli.rahman@aervi.id',
  'lukman.hadi@aervi.id',
];

module.exports = (regional, admin) => regional
  .runWith({ memory: '512MB', timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new (require('firebase-functions')).https.HttpsError(
        'unauthenticated', 'Sign-in required.');
    }
    const email = context.auth.token?.email;
    if (!email || !ADMIN_EMAILS.includes(email)) {
      throw new (require('firebase-functions')).https.HttpsError(
        'permission-denied', 'Admin only.');
    }

    const collection = data?.collection;
    const startTs = Number(data?.startTs) || 0;
    const endTs   = Number(data?.endTs)   || Date.now();
    if (!['sessions', 'assessments', 'alerts', 'health_logs'].includes(collection)) {
      throw new (require('firebase-functions')).https.HttpsError(
        'invalid-argument', 'collection must be sessions|assessments|alerts|health_logs');
    }

    // Lazy require — only needed in this function.
    let BigQuery;
    try { BigQuery = require('@google-cloud/bigquery').BigQuery; }
    catch (_) {
      return { ok: false, error: '@google-cloud/bigquery not installed (npm i @google-cloud/bigquery)' };
    }

    const db = admin.firestore();
    const snap = await db.collection(collection)
      .where('ts', '>=', startTs)
      .where('ts', '<=', endTs)
      .limit(5000)
      .get();

    const rows = snap.docs.map((d) => ({
      id: d.id,
      json: JSON.stringify(d.data()),
      ingested_at: new Date().toISOString(),
    }));
    if (!rows.length) return { ok: true, exported: 0 };

    const bq = new BigQuery();
    const dataset = bq.dataset('aervinex_analytics');
    const table = dataset.table(`${collection}_manual`);

    // Ensure table exists (idempotent create with simple schema).
    try {
      await table.get({ autoCreate: true });
    } catch (_) {
      await dataset.createTable(`${collection}_manual`, {
        schema: [
          { name: 'id', type: 'STRING' },
          { name: 'json', type: 'STRING' },
          { name: 'ingested_at', type: 'TIMESTAMP' },
        ],
      });
    }

    await table.insert(rows);
    return { ok: true, exported: rows.length, table: `aervinex_analytics.${collection}_manual` };
  });
