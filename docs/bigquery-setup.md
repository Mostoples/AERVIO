# AERVINEX — BigQuery Analytics Setup

## Goal

Stream selected Firestore collections to BigQuery so analysts can run
SQL over the cohort without paying Firestore read costs and without
pulling everything into the browser.

## Architecture

```
Firestore  ──[Firebase Extension: Stream Firestore to BigQuery]──►  BigQuery
                                                                       │
                                                                       ├── aervinex_analytics.sessions_raw
                                                                       ├── aervinex_analytics.assessments_raw
                                                                       ├── aervinex_analytics.alerts_raw
                                                                       ├── aervinex_analytics.daily_summary_raw
                                                                       └── (manual fallback) *_manual via functions/exportToBQ.js
```

## Step 1 — Create the BigQuery dataset

```bash
gcloud config set project aervinex
bq --location=asia-southeast2 mk \
  --dataset \
  --description "AERVINEX cohort analytics" \
  aervinex:aervinex_analytics
```

## Step 2 — Install the Firebase extension (one per collection)

Open Firebase Console → Extensions → "Stream Firestore to BigQuery".

For each of the following, install once with these params:

| Collection path      | BQ Dataset             | BQ Table prefix       |
|----------------------|------------------------|-----------------------|
| `sessions`           | `aervinex_analytics`   | `sessions`            |
| `assessments`        | `aervinex_analytics`   | `assessments`         |
| `alerts`             | `aervinex_analytics`   | `alerts`              |
| `daily_summary/{uid}/days` | `aervinex_analytics` | `daily_summary` |

Region: **asia-southeast2**. Wildcard ID: leave default `{documentId}`.
The extension will create `*_raw_changelog` (append-only) and `*_raw_latest`
(view of most recent state per doc).

After install, run a backfill of historical data:

```bash
npx @firebaseextensions/fs-bq-import-collection \
  --non-interactive \
  --project=aervinex \
  --source-collection-path=sessions \
  --dataset=aervinex_analytics \
  --table-name-prefix=sessions
```

Repeat for each collection.

## Step 3 — Useful SQL

```sql
-- AFib alerts per week
SELECT
  TIMESTAMP_TRUNC(TIMESTAMP_MILLIS(CAST(JSON_VALUE(data, '$.ts') AS INT64)), WEEK) AS week,
  COUNT(*) AS n_alerts
FROM `aervinex.aervinex_analytics.alerts_raw_latest`
WHERE JSON_VALUE(data, '$.riskId') = 'afib'
GROUP BY week
ORDER BY week DESC;

-- Per-user cumulative session minutes (Strava-like leaderboard)
SELECT
  JSON_VALUE(data, '$.uid')                  AS uid,
  SUM(CAST(JSON_VALUE(data, '$.duration_min') AS FLOAT64)) AS total_min
FROM `aervinex.aervinex_analytics.sessions_raw_latest`
GROUP BY uid
ORDER BY total_min DESC
LIMIT 50;
```

## Step 4 — Manual fallback

When the extension misses a write (rare; e.g. during a deploy), call:

```js
firebase.functions().httpsCallable('exportToBQ')({
  collection: 'sessions',
  startTs: 1716000000000,
  endTs:   1717000000000,
});
```

Only admins can invoke this — see `functions/exportToBQ.js`.

## Step 5 — Cost guardrails

- Per-table partitioning **by ingestion time** (default) keeps queries cheap.
- Use `LIMIT 1000` + `--max_billed=1GB` while iterating queries.
- Set up a `BigQuery → BUDGET ALERT` at $10/month for `aervinex_analytics`.
