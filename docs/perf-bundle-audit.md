# Performance — JS Bundle Audit & Lazy Load Plan

Date: 2026-05-31
Scope: all scripts under `public/js/` and `public/admin/` referenced from HTML.

## Why
Audit which JS files exceed the 50 KB suggested budget for blocking shell
scripts and document which can be deferred or route-loaded.

## Sizes (production source, unminified)

> Sizes derived from on-disk source. Minification + gzip will roughly halve.

| File                          | Approx size | Used by                      | Action                |
|-------------------------------|-------------|------------------------------|-----------------------|
| `js/disease-list.js`          | ~30 KB      | risk-list, risk-detail, encyclopedia | Keep eager (data tabel inti). |
| `js/aervinex-app.js`          | ~25-40 KB   | every page                   | Keep eager (shell).   |
| `js/health-engine.js`         | ~25 KB      | dashboard, running, recovery | Defer on landing.     |
| `js/ml-client.js`             | ~40 KB      | dashboard, risk-detail, assessment | Lazy-load when ML panel opens. |
| `js/ml-test-runner.js`        | **>60 KB**  | ml-results-report.html only  | Already isolated to that page — keep, but mark `defer`. |
| `js/admin.js`                 | ~30-50 KB   | `admin/*` pages              | Code-split per admin sub-route. |
| `js/encyclopedia.js`          | ~20 KB      | encyclopedia.html            | Defer.                |
| `js/onboarding.js`            | ~25 KB      | onboarding.html, register flow | Defer.                |
| `js/sensor-sim.js`            | ~20 KB      | dashboard sim mode           | Conditional import (only when `?sim=1`). |
| `js/xai.js`                   | ~15 KB      | risk-detail                  | Defer.                |
| `js/tour.js`                  | ~10 KB      | onboarding + dashboard       | Defer + load on idle. |

## Lazy-load recipe

```html
<script>
  // Load only when user opens the ML panel
  document.getElementById('openML')?.addEventListener('click', async () => {
    if (!window.MLClient) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = '/js/ml-client.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    window.MLClient.openPanel();
  });
</script>
```

## Recommendations (Lighthouse-relevant)

1. Add `defer` to all `<script src="/js/*">` that are not inline-dependent.
2. Move Firebase SDK scripts below the fold or use `type="module"` ES imports.
3. Split `ml-test-runner.js` into `core.js` + `report-renderer.js` so the report
   page becomes interactive faster (TTI win ~200-400 ms on mid-tier mobile).
4. Admin bundle should not be loaded by any non-admin route — verify via
   `grep -R "/js/admin.js" public --include="*.html"`.
5. Consider migrating to native ES modules + `import()` for true on-demand loading.

## Tracking

When implemented, link the relevant PR / commit here:

- [ ] defer attr added to non-critical shell scripts
- [ ] ml-client lazy-loaded on dashboard
- [ ] ml-test-runner split
- [ ] admin route guard verified
