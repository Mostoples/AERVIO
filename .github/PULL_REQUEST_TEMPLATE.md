## Summary
<!-- 1-3 kalimat: apa yang berubah dan kenapa -->

## Type of Change
- [ ] Bug fix (non-breaking change yang fix issue)
- [ ] New feature (non-breaking change yang nambah functionality)
- [ ] Breaking change (fix atau feature yang akan break existing functionality)
- [ ] ML model update (mengubah predictXxx, calibration map, ground truth)
- [ ] Documentation update
- [ ] Refactor (no functional change)
- [ ] Test infrastructure
- [ ] Security fix

## Related Issues
<!-- Closes #123, Refs #456 -->

## Changes
<!-- Bullet list per-file atau per-fitur -->
-
-
-

## Testing Done
- [ ] `node ml/local-test/run-tests.js` — passes (avg accuracy ≥85%)
- [ ] Manual test di Chrome desktop
- [ ] Manual test di mobile (Android Chrome / iOS Safari)
- [ ] Lighthouse audit untuk halaman yang di-touch
- [ ] Tested dengan Firebase emulator (auth + firestore)
- [ ] Screen reader spot-check (kalau touch UI)

## Lighthouse Scores (paste sebelum/sesudah)
<!-- Kalau touch halaman publik, run lighthouse -->
| Metric | Before | After |
|---|---|---|
| Performance | | |
| Accessibility | | |
| SEO | | |
| Best Practices | | |

## Screenshots (UI changes)
<!-- Drag-drop before/after -->

## Checklist
- [ ] Commit messages mengikuti [Conventional Commits](https://www.conventionalcommits.org/) format
- [ ] DCO sign-off di setiap commit (`git commit -s`)
- [ ] Code style sesuai CONTRIBUTING.md
- [ ] No unsanitized `innerHTML` dari user/Firestore input (XSS)
- [ ] User-facing strings ada entry di `public/js/i18n.js`
- [ ] Tidak commit secrets (`secrets.h`, `.env`, API keys)
- [ ] Update docs di `docs/` kalau public API/config changed
- [ ] CI passes (lihat GitHub Actions tab)

## Deployment Notes
<!-- Setelah merge, butuh action manual apa? -->
- [ ] Tidak butuh action manual
- [ ] Butuh deploy Cloud Functions: `firebase deploy --only functions:xxx`
- [ ] Butuh enable Firebase Extensions: <!-- list -->
- [ ] Butuh update Firebase Console setting: <!-- explain -->
- [ ] Butuh rotation API keys: <!-- explain -->

## Reviewer Notes
<!-- Untuk reviewer: hal khusus yang perlu di-look -->
