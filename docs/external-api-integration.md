# AERVINEX — External Wearable API Integration

This document describes how AERVINEX integrates with third-party
wearable platforms (Garmin Health API, Apple HealthKit, Fitbit Web API).

## 1. Garmin Health API

### 1.1 Developer registration

1. Sign up at https://developer.garmin.com/gc-developer-program/.
2. Create an "API Client" — choose **OAuth 2.0 with PKCE** flow.
3. Whitelist redirect URI:
   `https://aervinex.web.app/oauth/garmin/callback`
   (also the Cloud Function endpoint `oauthCallback?provider=garmin`).

### 1.2 Scopes

- `HEALTH_API.HEART_RATE`
- `HEALTH_API.PULSE_OX`
- `HEALTH_API.STRESS`
- `HEALTH_API.SLEEP`
- `HEALTH_API.STEPS`
- `HEALTH_API.RESPIRATION`

### 1.3 OAuth flow (PKCE)

```
1. Client generates code_verifier + code_challenge (S256).
2. Open: https://connect.garmin.com/oauth2Confirm?
         response_type=code&
         client_id=AERVINEX_GARMIN_KEY&
         redirect_uri=https://aervinex.web.app/oauth/garmin/callback&
         code_challenge=<...>&
         code_challenge_method=S256&
         state=<csrf-token>
3. User consents → Garmin redirects with ?code=<...>&state=<...>
4. Cloud Function exportCallback POSTs to:
      https://connectapi.garmin.com/oauth-service/oauth/access_token
   with code + code_verifier → access_token + refresh_token.
5. Stored at users/{uid}/integrations/garmin {access, refresh, expires_at}.
```

### 1.4 Webhook receiver

Garmin pushes new data via webhook every ~1 min. Configure:
- Webhook URL: `https://us-central1-aervinex.cloudfunctions.net/garminWebhook` (TODO)
- Verify HMAC signature header `X-Garmin-Signature`.
- Map payload → AERVINEX sensor_data schema (see `functions/ingestSensor.js`).

### 1.5 Sample Cloud Function stub

See `functions/index.js` — `exports.oauthCallback`. Production version
should:
- Validate `state` against a short-TTL CSRF token in Firestore.
- Exchange code for token using `node-fetch`.
- Encrypt tokens at rest with KMS-managed key.

## 2. Apple HealthKit

HealthKit is **iOS-only** and requires a native app. AERVINEX path:
1. Ship a Capacitor or React Native wrapper of the PWA.
2. Use `@capacitor-community/health` plugin OR `react-native-health`.
3. Bridge JS → native: read HKQuantityType samples (heart rate, SpO2,
   VO2max, sleep analysis) on a 5-min interval.
4. Push frames to AERVINEX via `ingestSensor` callable (same schema).

**Cannot be done in a pure web PWA.** Targeted for AERVINEX v3.0 (Q1
2027 per IMPLEMENTATION_PLAN.md).

## 3. Fitbit Web API

Fitbit acquired by Google in 2021; current API at https://dev.fitbit.com.
OAuth 2.0 flow analogous to Garmin. Lower priority — Indonesian device
penetration <2% (Statista 2024). Defer.

## 4. Polar AccessLink

https://www.polar.com/accesslink-api/. Similar OAuth 2.0. Roadmap:
add after Garmin is stable (Q3 2026).

## 5. Security checklist

- [ ] All third-party tokens encrypted at rest (Firestore field-level
      encryption via KMS).
- [ ] Refresh tokens rotated proactively (≤30 days lifetime).
- [ ] Per-provider revocation endpoint surfaced on `/profile.html`.
- [ ] Webhook payload signatures verified before write.
- [ ] Failed-auth retry capped at 3, then user notified.
