# AERVINEX

From Detection to Action - Health monitoring platform with wearable integration.

## Setup & Development

### Prerequisites
- Node.js (v18 or later)
- Firebase CLI: `npm install -g firebase-tools`

### Running Locally

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Start the local development server**
   ```bash
   firebase serve
   ```

   atau dengan port spesifik:
   ```bash
   firebase serve --port 5000
   ```

3. **Buka browser**
   ```
   http://localhost:5000
   ```

   **PENTING:** Jangan buka file HTML langsung dengan double-click! Harus menggunakan Firebase server atau web server lain karena:
   - Firebase Authentication memerlukan HTTP/HTTPS (tidak bisa `file://`)
   - CORS policy untuk API calls
   - Service Worker hanya jalan di HTTPS atau localhost

### Alternative: Menggunakan HTTP Server Lain

Jika tidak ingin menggunakan Firebase CLI, bisa pakai server lain:

```bash
# Menggunakan Python
python -m http.server 8000 --directory public

# Atau menggunakan npx
npx http-server public -p 8000

# Atau menggunakan live-server (auto-reload)
npx live-server public
```

### Deploy ke Firebase Hosting

```bash
firebase deploy --only hosting
```

## Troubleshooting Login

Jika login tidak berfungsi, cek hal berikut:

1. **Buka Browser Console (F12)** dan lihat apakah ada error
2. **Pastikan menjalankan dengan web server**, bukan membuka file HTML langsung
3. **Cek koneksi internet** - Firebase memerlukan koneksi internet
4. **Cek console logs** untuk melihat status inisialisasi:
   ```
   [Firebase] Initialized successfully
   [Firebase] Auth and Firestore ready
   [Login] Dependencies loaded successfully
   [Login] Login page initialized successfully
   ```

### Common Issues

**Error: "Firebase not defined"**
- Pastikan menggunakan web server (bukan `file://` protocol)

**Error: "auth is not defined"**
- Refresh halaman dan cek console untuk error loading script

**Login button tidak merespons**
- Buka console dan lihat error message
- Pastikan semua script dependencies sudah load

**"Cannot read property 'signInWithEmailAndPassword'"**
- Firebase Auth belum terinisialisasi dengan benar
- Cek apakah `firebase-auth-compat.js` ter-load

## Firebase Configuration

Firebase config sudah diset di `public/js/firebase-config.js` untuk project `aervinex`.

### Authentication Methods yang Enabled:
- Email/Password
- Google Sign-In
- Anonymous (Guest)

Pastikan di Firebase Console > Authentication > Sign-in methods, ketiga metode ini sudah di-enable.

## Struktur Project

```
AERVIO/
├── public/           # Frontend files (hosting root)
│   ├── js/          # JavaScript modules
│   ├── css/         # Stylesheets
│   ├── images/      # Assets
│   └── *.html       # Pages
├── functions/       # Firebase Cloud Functions
├── ml/             # Machine Learning models
└── firmware/       # Hardware firmware
```

## Links

- Production: https://aervinex.web.app
- Firebase Console: https://console.firebase.google.com/project/aervinex
