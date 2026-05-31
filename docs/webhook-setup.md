# AERVINEX — User Webhook Setup

AERVINEX can POST a JSON payload to any user-configured webhook URL
whenever a high-severity alert is generated. Common targets: Slack,
Discord, Telegram, Microsoft Teams, custom internal API.

## How it works

`functions/webhookDispatcher.js` listens on Firestore `alerts/{alertId}`
creates. For each webhook configured under `users/{uid}.webhooks`, if
the alert severity ≥ `minSeverity`, an HTTP POST is issued.

Outcome (status / error) is written back to `alerts/{alertId}.webhooks`.

## Configure a webhook from the profile page (user)

Add to your Firestore user doc (via `/profile.html` UI when wired):

```json
{
  "webhooks": [
    {
      "url": "https://hooks.slack.com/services/T0/B0/XYZ",
      "minSeverity": "warning",
      "format": "slack"
    },
    {
      "url": "https://discord.com/api/webhooks/123/abc",
      "minSeverity": "critical",
      "format": "discord"
    },
    {
      "url": "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>",
      "format": "telegram"
    }
  ]
}
```

## Slack format

```json
{ "text": "*PM2.5 Berbahaya — Jakarta Pusat*\nKonsentrasi 178 µg/m³..." }
```

## Discord format

```json
{ "content": "**PM2.5 Berbahaya — Jakarta Pusat**\nKonsentrasi 178 µg/m³..." }
```

## Telegram format

POST to `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>`:

```json
{ "text": "PM2.5 Berbahaya...", "parse_mode": "Markdown" }
```

## Custom JSON (default when `format` is unset)

```json
{
  "title": "PM2.5 Berbahaya",
  "body":  "Konsentrasi 178 µg/m³…",
  "severity": "critical",
  "riskId": "asma-exacerbation"
}
```

## Severity thresholds

| Value      | Triggered when                                         |
|------------|--------------------------------------------------------|
| `info`     | Risk pct ≥ threshold but < threshold × 1.3            |
| `warning`  | Risk pct ≥ threshold × 1.3 but < × 1.7                |
| `critical` | Risk pct ≥ threshold × 1.7 OR cardiac-event triggered  |

(Thresholds live in `ml/local-test/calibration-map.json`.)

## Security

- Webhook URLs are **secrets** — store in Firestore user doc, which
  `firestore.rules` already gates to owner+admin only.
- HMAC signing of outbound payloads: TODO (v1.1) — add
  `users/{uid}.webhookSecret` and `X-Aervinex-Signature` header.
- Dispatcher times out at 8 seconds per hook (slow targets won't
  starve the function).

## Troubleshooting

Check the alert doc post-trigger:

```
alerts/{alertId}
  webhooks: [
    { url: "https://...", status: 200 },
    { url: "https://...", error: "FetchError: timeout" }
  ]
```

If `status: 401/403` — token revoked. If `status: 429` — rate-limited
upstream; backoff happens automatically on next alert.
