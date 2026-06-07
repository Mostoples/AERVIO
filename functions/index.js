/**
 * AERVINEX — Cloud Functions Entry Point (Node.js 18, CommonJS)
 * ----------------------------------------------------------------
 * Region : asia-southeast2 (Jakarta) — co-located with Firestore.
 * Modules:
 *   - ingestSensor       : HTTPS callable, validate + write sensor_data
 *   - computeRisk        : HTTPS callable, calibrated-proxy risk scoring
 *   - aggregateDaily     : Pub/Sub cron (every 24h)
 *   - aggregateRealtime  : Firestore trigger (1-min rolling stats)
 *   - sendAlert          : Firestore trigger → FCM push
 *   - exportUserData     : HTTPS callable, GDPR/UU PDP data dump → Storage
 *   - exportToBQ         : HTTPS callable (admin), manual BigQuery export
 *   - webhookDispatcher  : Firestore trigger on alerts → user webhook URL
 *   - mlDriftDetector    : Pub/Sub cron (weekly), KS-test feature drift
 *   - oauthCallback      : HTTPS handler stub (Garmin OAuth2)
 *   - fcmRegisterStub    : (client only — see public/js/fcm-register.js)
 *
 * Init pattern: each module exports a builder fn `(functions, admin) => Function`
 * so admin SDK is initialized exactly once in this entry file.
 */

'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Init admin SDK exactly once (idempotent guard for emulator hot-reload).
if (!admin.apps.length) {
  admin.initializeApp();
}

const REGION = 'asia-southeast2';
const regional = functions.region(REGION);

// ── Cloud Function exports ────────────────────────────────────────────────
exports.ingestSensor      = require('./ingestSensor')(regional, admin);
exports.computeRisk       = require('./computeRisk')(regional, admin);
exports.aggregateDaily    = require('./aggregateDaily')(regional, admin);
exports.aggregateRealtime = require('./aggregateRealtime')(regional, admin);
exports.sendAlert         = require('./sendAlert')(regional, admin);
exports.exportUserData    = require('./exportUserData')(regional, admin);
exports.exportToBQ        = require('./exportToBQ')(regional, admin);
exports.webhookDispatcher = require('./webhookDispatcher')(regional, admin);
exports.mlDriftDetector   = require('./mlDriftDetector')(regional, admin);

// ── Aervi AI chatbot (Gemini-powered) ──
exports.aiChat            = require('./aiChat').aiChat;

// ── Midtrans payments (subscription, webhook, dunning) ──
const midtransModule         = require('./midtrans')(regional, admin);
exports.createSubscription   = midtransModule.createSubscription;
exports.cancelSubscription   = midtransModule.cancelSubscription;
exports.midtransWebhook      = require('./midtrans/webhook')(regional, admin);
exports.dunningManagement    = require('./midtrans/dunning')(regional, admin);

// Garmin / Apple HealthKit OAuth callback stub (HTTPS endpoint).
exports.oauthCallback = regional.https.onRequest((req, res) => {
  // Stub: real impl validates state, exchanges code → token, stores in
  // users/{uid}/integrations/{provider}. See docs/external-api-integration.md
  const { provider = 'garmin', code, state } = req.query;
  if (!code) {
    res.status(400).json({ ok: false, error: 'missing code' });
    return;
  }
  res.status(200).json({
    ok: true,
    provider,
    note: 'OAuth callback stub. Implement token exchange in production.',
    state,
  });
});
