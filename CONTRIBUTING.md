# Contributing to AERVINEX

Terima kasih sudah tertarik berkontribusi! AERVINEX adalah project open-source health monitoring untuk pelari & warga urban Indonesia.

## Quick Start

```bash
# Clone repo
git clone https://github.com/aervinex/aervinex.git
cd aervinex

# Install dependencies (functions only — frontend pakai vanilla JS)
cd functions && npm install && cd ..

# Run Firebase emulator suite (auth + firestore + hosting + functions)
npm install -g firebase-tools
firebase emulators:start

# Open http://localhost:5000
```

## Project Structure

```
public/        Frontend — vanilla HTML/CSS/JS, no build tooling
  js/          Client logic + ML proxy + i18n
  css/         Design tokens + a11y tokens
  admin/       Admin-only pages
functions/     Cloud Functions Node 18 (Firebase Functions v4)
ml/            Python ML training + ONNX export
  training/    XGBoost training scripts
  local-test/  Node-based proxy reliability tests
firmware/      ESP32 Arduino sketch + arduino-cli scripts
docs/          Architecture, plans, research, clinical
.github/       Issue templates + CI workflows
```

## Local Test Suite

Sebelum buat PR, jalankan minimum tests:

```bash
node ml/local-test/run-tests.js       # 35 ML proxy reliability — must pass >85% avg accuracy
firebase emulators:exec --only firestore "node test/rules-test.js"  # if available
```

## Code Style

- **JavaScript**: Vanilla ES2022, no build tooling. Use `const` by default. Prefer `textContent` over `innerHTML` (XSS). Module pattern via IIFE.
- **HTML**: Semantic landmarks (`<main>`, `<nav>`, `<aside>`), ARIA labels untuk SVG informatif, `aria-current="page"` di active nav.
- **CSS**: Token-based via `css/aervinex-ui.css` + `css/a11y-tokens.css`. WCAG AA contrast wajib (≥4.5:1 untuk body text).
- **Python**: PEP 8, type hints di public functions, docstrings Google style.
- **Indonesian-first**: User-facing copy default Bahasa Indonesia. Translation key di `js/i18n.js`.

## Commit Convention

Mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ml): add Buller EKF core temp estimator to predictHeatstroke
fix(auth): handle auth/too-many-requests with friendly message
docs(clinical): expand IRB protocol section on inclusion criteria
chore(deps): bump firebase-functions to 5.0.1
test(ml): add Wilson CI assertion to calibrator test
```

Scopes umum: `ml`, `auth`, `ui`, `firmware`, `i18n`, `clinical`, `security`, `seo`, `a11y`, `perf`, `docs`, `deps`, `infra`.

## Pull Request Checklist

- [ ] Title mengikuti Conventional Commits format
- [ ] Test suite lulus (`node ml/local-test/run-tests.js` minimum)
- [ ] Lighthouse score tidak turun untuk halaman yang di-touch (gunakan `lighthouse https://aervinex.web.app/dashboard.html`)
- [ ] Tidak introduce XSS (no unsanitized `innerHTML` dari user/Firestore input)
- [ ] User-facing string punya entry di `i18n.js`
- [ ] Documentation update untuk public API / config changes
- [ ] DCO sign-off di commit message (`git commit -s`)

## Sign-off / DCO

Project mengadopsi [Developer Certificate of Origin](https://developercertificate.org/).
Setiap commit harus end dengan:

```
Signed-off-by: Nama Lengkap <email@example.com>
```

Aktifkan dengan `git commit -s` atau set di git config:
```
git config --global format.signOff true
```

## Bug Reports & Feature Requests

- **Bug**: gunakan `.github/ISSUE_TEMPLATE/bug_report.md`. Sertakan reproducible steps + browser/device info.
- **Feature**: gunakan `.github/ISSUE_TEMPLATE/feature_request.md`. Jelaskan use case.
- **ML model issue**: gunakan `.github/ISSUE_TEMPLATE/ml_model_issue.md`. Sertakan input vector + expected vs actual output.
- **Clinical concern** (false negative high-stakes risk score, salah interpretasi medis): gunakan `.github/ISSUE_TEMPLATE/clinical_concern.md`. Akan di-triage prioritas tertinggi.

## Security Issues

JANGAN buka public issue untuk vulnerability. Email langsung ke **security@aervinex.id** atau lihat [docs/SECURITY.md](docs/SECURITY.md).

## Code of Conduct

Project mengikuti [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Lihat [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Pelanggaran lapor ke **conduct@aervinex.id**.

## License

By contributing, Anda setuju kontribusi di-license under AGPL-3.0 untuk app code, dan Apache-2.0 untuk ML model weights (dual track). Lihat [LICENSE](LICENSE).

## Recognition

Contributors dengan commit yang ter-merge akan masuk `CONTRIBUTORS.md` (auto-generated) dan disebut di release notes.

Selamat berkontribusi! 🚀
