# Firebase App Check — Setup Guide (AERVINEX)

App Check melindungi backend Firebase dari abuse client (script kiddie, bot, replay attack) dengan attestation token yang dikirim setiap request ke Firestore / Cloud Functions / Storage.

## Prasyarat
- Akses Firebase Console: project `aervinex` (atau `aervi-id` kalau migrasi)
- Akses Google reCAPTCHA admin: <https://www.google.com/recaptcha/admin>
- Hak `Editor` atau `Owner` di GCP project

## Langkah 1 — Daftar reCAPTCHA v3 Site Key
1. Buka <https://www.google.com/recaptcha/admin/create>
2. Label: `AERVINEX Web — Production`
3. Type: **reCAPTCHA v3**
4. Domains (wajib tambah semua):
   - `aervinex.web.app`
   - `aervinex.firebaseapp.com`
   - custom domain kalau ada (mis. `app.aervinex.id`)
   - `localhost` (untuk dev/CI)
5. Submit. Simpan **Site Key** (public) dan **Secret Key** (server-side, jangan commit).

## Langkah 2 — Register App Check di Firebase Console
1. Firebase Console → Project Settings → **App Check** tab
2. Klik web app entry (kalau belum ada, register Web app dulu di General tab)
3. Pilih provider: **reCAPTCHA v3**
4. Paste Site Key dari Langkah 1
5. TTL: default 1 hour (aman)
6. Save

## Langkah 3 — Hardcode Site Key di Repo
Edit `public/js/app-check.js`:
```js
var RECAPTCHA_V3_SITE_KEY = '6Lc-XXXXXXXXXXXXXXXXXXX'; // dari Langkah 1
```

> Site key reCAPTCHA v3 **boleh public** (didesign untuk itu). Secret key jangan
> pernah masuk repo — itu cuma untuk server-side verification kalau ada.

## Langkah 4 — Load App Check SDK di HTML
Tambah script tag di `index.html`, `dashboard.html`, `login.html`, `register.html`,
dll. (semua halaman yang load `firebase-config.js`), **setelah** firebase SDK
tapi **sebelum** `firebase-config.js`:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="/js/firebase-config.js"></script>
<script src="/js/app-check.js"></script>
```

## Langkah 5 — Test (Monitor mode)
1. Firebase Console → App Check → Firestore → **Monitor** (jangan Enforce dulu)
2. Deploy: `firebase deploy --only hosting`
3. Buka site, login, lakukan operasi normal
4. Tunggu 5–15 menit, cek metric "Requests with App Check token" di console
5. Target: **>99% verified** dalam 24h

## Langkah 6 — Enforce
Hanya setelah Monitor menunjukkan traffic stabil:
1. Firebase Console → App Check → **Enforce** untuk:
   - Cloud Firestore
   - Cloud Functions (kalau dipakai)
   - Cloud Storage (kalau dipakai)
2. Monitor error rate 24h pertama — kalau spike, kembali ke Monitor mode.

## Debug Token (Development)
Untuk dev lokal yang tidak mau lewat reCAPTCHA tiap reload:
```js
// di console DevTools sebelum reload pertama:
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
```
Atau set `window.AERVINEX_APPCHECK_DEBUG = true` sebelum `app-check.js` load.
Setelah reload, copy debug token dari Console → daftarkan di
Firebase Console → App Check → web app → "Manage debug tokens".

## Troubleshooting
| Gejala | Fix |
|---|---|
| `appCheck/recaptcha-error` | Domain belum didaftar di reCAPTCHA admin |
| `appCheck/fetch-status-error 403` | Site key salah / belum di-link di Firebase Console |
| Firestore 401 Unauthorized | Enforce sudah aktif tapi token tidak terkirim (cek SDK load order) |
| 100% traffic unverified | `firebase-app-check-compat.js` belum di-load di HTML |

## References
- <https://firebase.google.com/docs/app-check/web/recaptcha-provider>
- <https://firebase.google.com/docs/app-check/web/debug-provider>
