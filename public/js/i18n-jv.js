/* AERVINEX i18n — Bahasa Jawa (Krama campur Ngoko alus).
   Module ini extend window.AervinexI18n dengan dictionary 'jv'.
   Strategi: key tetap string Indonesia (sama dengan i18n.js master),
   value = padanan Jawa. Banyak entri ditandai
   "[needs native speaker review]" — best-effort, jangan rilis tanpa
   review penutur asli (rekomendasi: native speaker dari Jawa Tengah
   / Yogyakarta untuk konsistensi register krama).

   Loading order: i18n.js dulu, baru i18n-jv.js, lalu i18n-su.js.
   Aktifkan via: AervinexI18n.setLang('jv').
*/
(function () {
  'use strict';
  if (!window.AervinexI18n) {
    console.warn('[i18n-jv] core i18n.js belum di-load — abort');
    return;
  }

  // ── Dictionary ID → Jawa (Krama) ─────────────────────────
  // Confidence legend:
  //   ✓  high confidence (kosakata sehari-hari + standar krama)
  //   ?  medium — best-effort, butuh review halus
  //   ⚠  low — placeholder / pinjam istilah Indonesia/English
  const JV = {
    // Navigation (✓ kebanyakan standar)
    'Home': 'Beranda',
    'Stats': 'Statistik',
    'Recovery': 'Pulih',
    'Profile': 'Profil',
    'Dashboard': 'Papan Kontrol',
    'Risks': 'Risiko',
    'Achievements': 'Kaprigelan',                 // ?
    'Risiko': 'Risiko',
    'Bantuan': 'Pitulungan',                      // ✓
    'Pengaturan': 'Setelan',                      // ✓
    'Dashboard': 'Papan Kontrol',

    // Common buttons / actions
    'Masuk': 'Mlebet',                            // ✓ krama dari "mlebu"
    'Daftar': 'Ndhaftar',                         // ?
    'Mulai Gratis': 'Wiwiti Gratis',              // ?
    'Mulai Monitoring': 'Wiwiti Mantau',          // ?
    'Daftar Gratis': 'Ndhaftar Gratis',
    'Sudah punya akun': 'Sampun gadhah akun',     // ✓ krama
    'Belum punya akun?': 'Dèrèng gadhah akun?',   // ✓ krama
    'Lihat Demo UI': 'Tonton Demo UI',
    'Lihat Fitur': 'Tonton Fitur',
    'Buka Preview di Tab Baru ↗': 'Bikak Preview ing Tab Anyar ↗',  // ?
    'Lewati ke Landing': 'Langsung dhateng Landing',                 // ?
    'Lanjut': 'Lajeng',                           // ✓
    'Lanjut →': 'Lajeng →',
    'Kembali': 'Wangsul',                         // ✓
    'Back': 'Wangsul',
    'Skip': 'Lewat',
    'Selesai': 'Rampung',                         // ✓
    'Selesai ✓': 'Rampung ✓',
    'Simpan': 'Simpen',                           // ✓
    'Batalkan': 'Batalaken',                      // ?
    'Tutup': 'Tutup',                             // ✓
    'Mulai': 'Wiwit',                             // ✓
    'Stop': 'Mandheg',                            // ✓
    'Pause': 'Sela',                              // ?
    'Mulai Run': 'Wiwit Lumayu',                  // ? lumayu = lari ngoko, "mlampah-mlampah" lebih halus tapi untuk lari "lumayu" lebih tepat
    'Buat Akun': 'Damel Akun',                    // ✓ krama "damel"
    'Lanjutkan dengan Google': 'Lajengaken kaliyan Google',
    'Daftar dengan Google': 'Ndhaftar kaliyan Google',
    'Masuk sebagai Guest / Debug': 'Mlebet minangka Tamu / Debug',
    'Coba dulu sebagai Guest': 'Coba rumiyin minangka Tamu',
    'Lupa password?': 'Kesupen password?',        // ✓
    'atau': 'utawi',                              // ✓ krama
    'Konfirmasi Password': 'Konfirmasi Password',
    'Email': 'Email',
    'Password': 'Password',
    'Nama': 'Nama',
    'Nama lengkap': 'Nama jangkep',               // ✓
    'Minimal 6 karakter': 'Sak mboten-mbotenipun 6 aksara',  // ?
    'Ulangi password': 'Ambali password',
    'Buka Ticket': 'Bikak Ticket',
    'Replay Tour': 'Ngambali Tur',
    'Selanjutnya': 'Salajengipun',                // ✓

    // Hero / Landing
    'AERVINEX adalah smartwatch untuk': 'AERVINEX inggih punika smartwatch kanggé',  // ✓
    'pelari': 'tiyang lumayu',                    // ?
    'warga kota': 'warga kitha',                  // ✓
    'Pelari & Atlet': 'Tiyang Lumayu & Atlit',
    'Warga Urban & Komuter': 'Warga Kitha & Komuter',
    'Untuk Pelari & Warga Urban': 'Kanggé Tiyang Lumayu & Warga Kitha',
    'Untuk Siapa?': 'Kanggé Sinten?',             // ✓
    'Dua dunia, satu wearable.': 'Kalih jagad, satunggal wearable.',  // ?
    'Tentang Project': 'Babagan Proyek',          // ✓
    'Penelitian skripsi yang nyata.': 'Panaliten skripsi ingkang sanyata.',  // ?
    'Berbasis Bukti': 'Adhedhasar Bukti',         // ✓
    'ML Pipeline Lengkap': 'ML Pipeline Jangkep',
    'Open untuk Riset': 'Tinarbuka kanggé Riset',
    'Energy Harvesting': 'Energy Harvesting',
    'Siap mencoba?': 'Siap nyobi?',
    'Mulai monitoring kesehatan Anda hari ini.': 'Wiwiti mantau kesarasan panjenengan dinten punika.',  // ✓
    'Apa yang dilakukan AERVINEX': 'Punapa ingkang dipuntindakaken AERVINEX',
    'Lima sensor, satu ekosistem AI': 'Gangsal sensor, satunggal ekosistem AI',  // ✓

    // Greeting (✓)
    'Selamat datang,': 'Sugeng rawuh,',           // ✓ klasik krama
    'Selamat pagi,': 'Sugeng énjing,',            // ✓
    'Selamat datang di AERVINEX!': 'Sugeng rawuh ing AERVINEX!',
    'Athlete': 'Atlit',
    'Member': 'Anggota',

    // Section titles
    'Vital Signs': 'Tandha Vital',                // ?
    'Lingkungan': 'Lingkungan',
    'Deteksi Risiko Penyakit': 'Deteksi Risiko Sesakit',  // ✓ "sesakit" = penyakit krama
    'Rekomendasi AI · Real-time': 'Saran AI · Real-time',
    'Aksi Cepat': 'Tumindak Cepet',
    'Aksi Mitigasi': 'Tumindak Mitigasi',
    'Tentang Risiko Ini': 'Babagan Risiko Punika',
    'Faktor Kontribusi': 'Faktor Kontribusi',

    // Health / metrics
    'Detak Jantung': 'Detak Jantung',             // ⚠ "denyut atinipun"? terlalu literal
    'Tekanan Darah': 'Tekanan Rah',               // ? "rah" = darah krama
    'Suhu Tubuh': 'Suhu Awak',
    'Kualitas Udara': 'Kualitas Hawa',
    'Saturasi Oksigen': 'Saturasi Oksigen',
    'Risiko Rendah': 'Risiko Andhap',             // ✓
    'Risiko Sedang': 'Risiko Tengah',
    'Risiko Tinggi': 'Risiko Inggil',             // ✓ "inggil" = tinggi krama
    'Aman': 'Aman',
    'Hati-hati': 'Ngatos-atos',                   // ✓
    'Bahaya': 'Bebaya',                           // ✓

    // Alerts / status
    'Pemberitahuan': 'Pawartos',                  // ✓ "pawartos" = berita krama
    'Belum ada notifikasi': 'Dèrèng wonten pawartos',
    'Tandai sudah dibaca': 'Tandhani sampun dipunwaos',
    'Lihat semua →': 'Tonton sedaya →',
    'Detail →': 'Rinci →',

    // Footer / misc
    'Powered by Firebase': 'Dipun-aturi Firebase',  // ?
    'Made with research-grade care': 'Kadamel kanthi research-grade care',
    'Research-grade methodology': 'Metodologi research-grade',

    // Onboarding / consent (best-effort)
    'Saya menyetujui': 'Kula sarujuk',            // ✓ "sarujuk" = setuju krama
    'Syarat & Ketentuan': 'Syarat & Pranata',
    'Kebijakan Privasi': 'Kawicaksanan Privasi',
    'Saya berusia di atas 18 tahun': 'Yuswa kula sampun langkung saking 18 taun',  // ✓

    // Recovery / sleep (?)
    'Tidur': 'Tilem',                             // ✓ "tilem" = tidur krama
    'Kualitas Tidur': 'Kualitas Tilem',
    'Pemulihan': 'Pemulihan',
    'Stress': 'Stres',
    'Skor Pemulihan': 'Skor Pemulihan',

    // Running
    'Jarak': 'Tebih',                             // ? "tebih" = jauh; untuk distance kadang "jarak" dipakai
    'Durasi': 'Wektu',
    'Kecepatan': 'Kacepetan',
    'Pace': 'Pace',
    'Mulai Lari': 'Wiwit Lumayu',
    'Riwayat': 'Riwayat',

    // Errors / states
    'Memuat...': 'Ngundhuh...',                   // ? "ngundhuh" = mengunduh; loading umumnya "ngambil"
    'Gagal memuat': 'Gagal ngundhuh',
    'Coba lagi': 'Coba malih',                    // ✓
    'Tidak ada data': 'Mboten wonten data',       // ✓ "mboten" = tidak krama
  };

  // ── Register ke core i18n.js ─────────────────────────────
  // Pattern: kita patch fungsi t() lewat hook getDict.
  // Karena core i18n.js hardcode 2 bahasa, kita extend dengan
  // wrapper minimal di window.AervinexI18nExt.
  window.AervinexI18nExt = window.AervinexI18nExt || { dicts: {}, langs: ['id', 'en'] };
  window.AervinexI18nExt.dicts['jv'] = JV;
  window.AervinexI18nExt.langs.push('jv');
  window.AervinexI18nExt.labels = window.AervinexI18nExt.labels || {};
  window.AervinexI18nExt.labels['jv'] = 'Jawa (Krama)';

  // Notify core (handler ada di i18n.js extension block — see patch).
  if (typeof window.AervinexI18n.registerLang === 'function') {
    window.AervinexI18n.registerLang('jv', JV, 'Jawa (Krama)');
  }

  // Translation count + uncertain marker for debug
  window.AervinexI18nExt.stats = window.AervinexI18nExt.stats || {};
  window.AervinexI18nExt.stats['jv'] = {
    total: Object.keys(JV).length,
    note: 'Banyak entri marked [needs native speaker review] — jangan release tanpa review penutur asli Jawa Tengah/Yogyakarta.'
  };
})();
