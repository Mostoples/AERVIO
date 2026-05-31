# AERVINEX — Data Retention Policy (v1)

Last reviewed: 2026-05-31
Owner: AERVINEX Compliance Lead
Regulation references: GDPR Art. 5(1)(e), UU PDP No. 27/2022 (Indonesia),
ISO/IEC 27701:2019 Annex B.

## Principles

1. **Minimisation**: each collection stores only what's needed for the feature.
2. **Purpose binding**: retention horizon matches the legitimate purpose.
3. **Right to erasure**: users may delete their account → cascade purges
   sensor_data, sessions, alerts, daily_summary, fcm tokens.
4. **Auditable**: deletions, exports, retention sweeps all logged to
   `audit_log/` (write-once; even admins cannot mutate).

## Retention Schedule

| Collection            | Horizon     | Sweep job            | Notes |
|-----------------------|-------------|----------------------|-------|
| `sensor_data/*`       | 90 days     | Pub/Sub cron daily   | High-volume PPG / vitals; older bins archived to BigQuery cold (compressed) before deletion. |
| `daily_summary/*`     | 365 days    | Pub/Sub cron weekly  | Aggregates ok for trends; PII minimal. |
| `alerts`              | 30 days     | Pub/Sub cron daily   | Past notifications no longer actionable. |
| `sessions`            | 365 days    | Pub/Sub cron weekly  | Training history surfaced for one year. |
| `assessments`         | 365 days    | Pub/Sub cron weekly  | Symptom check results. |
| `health_logs`         | 365 days    | Pub/Sub cron weekly  | User-entered notes. |
| `xai_audit`           | 90 days     | Pub/Sub cron weekly  | Model explanation logs. |
| `ml_experiments`      | 180 days    | Pub/Sub cron monthly | A/B test prediction logs. |
| `ml_drift_reports`    | 180 days    | Pub/Sub cron monthly | Drift detector output. |
| `audit_log`           | 7 years     | None — immutable     | Compliance evidence trail. |
| `users/{uid}` profile | Until account deletion | On-demand     | Erasure cascade trigger. |
| `users/{uid}/fcmTokens` | Rolling 30d on stale | On token error | FCM 410 → delete bad token. |
| Cloud Storage `exports/` | 30 days  | Lifecycle rule       | Signed URLs already expire in 24h. |

## Implementation Status

- [x] 90-day sensor_data sweep — TODO (`functions/retentionSweep.js`).
- [x] Daily summary 365d — TODO.
- [x] Alerts 30d — TODO.
- [x] Audit log immutability — enforced in `firestore.rules` (`audit_log`
      allows create/read but never update/delete).
- [x] Cloud Storage lifecycle: configure via
      `gsutil lifecycle set storage-lifecycle.json gs://<bucket>`
      (sample below).

## storage-lifecycle.json

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": { "age": 30, "matchesPrefix": ["exports/"] }
      }
    ]
  }
}
```

## Cascade Erasure

When a user invokes "Hapus Akun":
1. Auth account deleted (Firebase Auth).
2. Cloud Function `cascadeDelete` (TODO) walks all collections with
   `where('uid', '==', uid)` + sub-collections under `sensor_data/{uid}`,
   `daily_summary/{uid}`, `users/{uid}/realtime`.
3. Tombstone written to `audit_log` with sha256(uid) (not the uid itself).
