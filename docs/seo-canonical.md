# SEO — Canonical URL & hreflang Strategy

Date: 2026-05-31
Production host: `https://aervinex.web.app` (Firebase Hosting)
Custom domain (planned): `https://aervinex.id`

## Goals
1. Prevent duplicate-content penalties when both `aervinex.web.app` and
   `aervinex.id` (or `www.aervinex.id`) serve the same SPA.
2. Give Google a hint about ID ↔ EN language alternates without forking the URL.

## Canonical URL pattern

For every static HTML page that has SEO value, add inside `<head>`:

```html
<link rel="canonical" href="https://aervinex.web.app/{path}" />
```

Replace `https://aervinex.web.app` with the production domain once `aervinex.id`
DNS is live. Until then, the Firebase URL is canonical.

### Pages to update (priority order)

| Pri | Path                        | Canonical                                           |
|-----|-----------------------------|-----------------------------------------------------|
| P0  | `/`                         | `https://aervinex.web.app/`                          |
| P0  | `/dashboard.html`           | `https://aervinex.web.app/dashboard.html`            |
| P0  | `/risk-list.html`           | `https://aervinex.web.app/risk-list.html`            |
| P0  | `/ml-results-report.html`   | `https://aervinex.web.app/ml-results-report.html`    |
| P0  | `/evidence.html`            | `https://aervinex.web.app/evidence.html`             |
| P1  | `/risk-detail.html`         | `https://aervinex.web.app/risk-detail.html` (root canonical — dynamic id is just a filter; if every disease is a distinct landing target, switch to per-id canonical). |
| P1  | `/encyclopedia.html`        | `https://aervinex.web.app/encyclopedia.html`         |
| P1  | `/about.html`, `/help.html`, `/privacy-policy.html`, `/terms.html` | self |
| P2  | onboarding, login, register, alerts, history, profile | self — but consider `noindex` for personal/auth pages. |

Auth-gated pages (`/dashboard.html`, `/profile.html`, `/alerts.html`,
`/history.html`, `/edit-profile.html`, `/assessment-history.html`) should also
include `<meta name="robots" content="noindex, follow">` because crawlers see
the empty shell.

## hreflang strategy

The app is bilingual (ID default, EN via `window.AervinexI18n.setLang`). Because
both languages live behind the same URL (client-side switch), the recommended
pattern is **hreflang to itself + x-default** until separate URLs exist:

```html
<link rel="alternate" hreflang="id" href="https://aervinex.web.app/" />
<link rel="alternate" hreflang="en" href="https://aervinex.web.app/?lang=en" />
<link rel="alternate" hreflang="x-default" href="https://aervinex.web.app/" />
```

Apply to `/`, `/dashboard.html`, `/risk-list.html`, `/evidence.html`,
`/ml-results-report.html` initially. Other pages can follow once translations
ship.

If we move to true URL-segmented locales later (`/id/`, `/en/`), update both
the canonical and hreflang accordingly.

## Implementation note

Because this is a static SPA, the canonical / hreflang block is added once per
HTML file. There is no server rewrite. The block can be copy-pasted manually,
or a small node script can walk `public/*.html` and inject the block based on
filename.

Suggested helper (not yet implemented):
`scripts/inject-canonical.js` — reads file list, inserts `<link rel="canonical">`
keyed by relative path, idempotent (skips if already present).
