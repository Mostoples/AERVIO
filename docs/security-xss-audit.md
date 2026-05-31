# XSS Audit — AERVINEX `public/js/` (May 2026)

Scope: every `innerHTML` assignment in `public/js/*.js`. Total: **40 occurrences across 13 files**.

Risk taxonomy:
- **HIGH** — interpolates Firestore data, URL params, user input, OR external API responses (attacker-controllable).
- **MED** — interpolates app-state derived from sensors / dynamic strings the user can indirectly affect (e.g. device name, station name).
- **LOW** — fully static markup or only interpolates numeric / hardcoded enum values.

Default mitigation, in preference order:
1. Use `textContent` instead of `innerHTML` when no markup is needed.
2. Build sub-trees with `document.createElement` + `textContent` and `appendChild`.
3. Sanitize via DOMPurify (`https://cdn.jsdelivr.net/npm/dompurify@3.0/dist/purify.min.js`) before assigning to `innerHTML`.
4. Where markup must remain (template literals with static HTML + numeric data only), keep `innerHTML` but document why it's safe.

---

## Inventory & Risk

| # | File:Line | Source of interpolated data | Risk | Status |
|---|-----------|------------------------------|------|--------|
| 1 | `app.js:70` | `msg` arg to `toast()` (callers pass error strings, sometimes user-derived emails / station names) | **HIGH** | **FIXED** — rewritten with `createElement` + `textContent` |
| 2 | `history.js:64` | static fallback | LOW | reviewed (no change needed, but refactored together with row builder) |
| 3 | `history.js:67` | Firestore `sessions` doc fields (distance, HR, pm25, trimp) | **HIGH** | **FIXED** — replaced with DOM construction + `textContent` |
| 4 | `running.js:405` | `envData.source` from external weather/AQI API | **HIGH** | **FIXED** — replaced with DOM construction + `textContent` |
| 5 | `i18n.js:388` | `lang` (hardcoded enum 'id'/'en') | LOW | safe |
| 6 | `aervinex-app.js:70` | `logo` SVG markup constant from same file | LOW | safe |
| 7 | `aervinex-app.js:244` | `lang` (hardcoded enum) | LOW | safe |
| 8 | `encyclopedia.js:65` | static labels from `aq.by_health_class` (hardcoded JSON dataset shipped in `public/data/`) | MED | acceptable for now — dataset is build-time, not user-mutable. Add sanitize wrapper if dataset ever exposed via Firestore. |
| 9 | `encyclopedia.js:92` | same as above (`correlations` keys) | MED | same |
| 10 | `encyclopedia.js:110` | static row labels | LOW | safe |
| 11 | `encyclopedia.js:136` | dataset keys | MED | as above |
| 12 | `encyclopedia.js:206, 232, 261, 280, 305, 350` | dataset interpolations | MED | as above |
| 13 | `dashboard.js:48` | bar metrics (numeric only) | LOW | safe |
| 14 | `dashboard.js:231` | static "all safe" markup | LOW | safe |
| 15 | `dashboard.js:234` | `alerts[]` from app-state (severity, message — may include device label) | MED | mitigation: sanitize `a.message` via `escapeHtml` helper before next iteration |
| 16 | `dashboard.js:248` | `rec.title`, `rec.msg` from hardcoded recommendation table | LOW | safe |
| 17 | `dashboard.js:328` | `recs[]` hardcoded enum | LOW | safe |
| 18 | `running.js:225, 234` | alerts hardcoded keys | LOW | safe |
| 19 | `tour.js:151` | static tooltip template + step content (build-time) | LOW | safe |
| 20 | `admin.js:36` | `lang` enum | LOW | safe |
| 21 | `admin.js:95` | `html.join('')` — built from Firestore user docs (display name, email) | **HIGH** | **TODO** — admin-only surface but should still escape. Tracked. |
| 22 | `xai.js:115` | feature names from hardcoded ML output schema | LOW | safe |
| 23 | `recovery.js:93` | `analysis.rec` hardcoded enum | LOW | safe |
| 24 | `onboarding.js:43, 64, 118, 156, 198, 225, 283, 380, 400, 411` | static step templates | LOW | safe |
| 25 | `icon-lib.js:1025` | `this.fromEmoji(txt)` returns sanitized SVG markup from internal map | LOW | safe |

---

## Fixed in This Pass (Top-3)
1. `public/js/app.js` — `toast()` rewritten to use `createElement` + `textContent`. The toast helper is called from many call sites, some of which pass server-derived strings (e.g. station names from weather API, error messages).
2. `public/js/history.js` — `renderTable()` rewritten to build `<tr>` elements via DOM APIs. Previously interpolated raw Firestore field values into a template literal — a malicious or buggy write could have stored markup.
3. `public/js/running.js` — `fetchEnv()` env-bar build rewritten to DOM API. Previously interpolated `envData.source` returned by Open-Meteo / IQAir nearest-station response into `innerHTML`.

## Outstanding (next pass)
- `admin.js:95` — escape user-provided fields (`name`, `email`, `photoURL`) before injecting into the admin user-list HTML. Even though admin-only, defense-in-depth.
- `dashboard.js:234` — escape `a.message` in alert items in case alerts originate from upstream alert pipeline.
- Encyclopedia dataset interpolation — currently MED-risk because data ships from `public/data/` (build-time). If `public/data/` is ever generated from Firestore (`public/{docId}` collection), promote to HIGH and route through `escapeHtml` or DOMPurify.

## Recommended Shared Helper
Add to `public/js/utils.js`:
```js
escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```
Then `${Utils.escapeHtml(s.name)}` for all remaining template-literal interpolations until they are migrated to DOM-build pattern.

## CSP Note
With the strict CSP added to `firebase.json` (no `unsafe-eval`, no remote scripts beyond Firebase/YouTube/reCAPTCHA), inline event handlers in injected HTML would be blocked even if XSS landed. Inline scripts via `<script>` insertion are also blocked. This is defense-in-depth, **not** a substitute for proper escaping.
