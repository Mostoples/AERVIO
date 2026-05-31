/* AERVINEX i18n — Bahasa Sunda (Lemes / undak-usuk halus).
   Module ini extend window.AervinexI18n dengan dictionary 'su'.
   Strategi sama dengan i18n-jv.js: key = string Indonesia,
   value = padanan Sunda lemes.

   Banyak entri butuh review penutur asli Sunda (Bandung/Priangan).
   Tanda "?" / "⚠" pada komentar = uncertain.

   Aktifkan: AervinexI18n.setLang('su').
*/
(function () {
  'use strict';
  if (!window.AervinexI18n) {
    console.warn('[i18n-su] core i18n.js belum di-load — abort');
    return;
  }

  const SU = {
    // Navigation
    'Home': 'Bumi',                               // ✓ "bumi" = rumah lemes (juga dipakai home)
    'Stats': 'Statistik',
    'Recovery': 'Pamulihan',                      // ?
    'Profile': 'Profil',
    'Dashboard': 'Dashboard',
    'Risks': 'Résiko',
    'Achievements': 'Kahontalan',                 // ?
    'Risiko': 'Résiko',
    'Bantuan': 'Bantosan',                        // ✓ lemes "bantuan"
    'Pengaturan': 'Setélan',

    // Buttons / actions
    'Masuk': 'Lebet',                             // ✓ "lebet" = masuk lemes
    'Daftar': 'Ngadaptar',
    'Mulai Gratis': 'Mimitian Gratis',            // ?
    'Mulai Monitoring': 'Mimitian Mantau',
    'Daftar Gratis': 'Ngadaptar Gratis',
    'Sudah punya akun': 'Parantos gaduh akun',    // ✓ "parantos" = sudah lemes, "gaduh" = punya lemes
    'Belum punya akun?': 'Teu acan gaduh akun?',  // ✓
    'Lihat Demo UI': 'Tingali Demo UI',           // ✓ "tingali" = lihat lemes
    'Lihat Fitur': 'Tingali Fitur',
    'Buka Preview di Tab Baru ↗': 'Buka Preview di Tab Anyar ↗',
    'Lewati ke Landing': 'Lajengkeun ka Landing',  // ?
    'Lanjut': 'Lajeng',                           // ✓
    'Lanjut →': 'Lajeng →',
    'Kembali': 'Wangsul',                         // ✓ "wangsul" = pulang/kembali lemes
    'Back': 'Wangsul',
    'Skip': 'Lompat',
    'Selesai': 'Réngsé',                          // ✓ lemes "selesai"
    'Selesai ✓': 'Réngsé ✓',
    'Simpan': 'Simpen',
    'Batalkan': 'Batalkeun',
    'Tutup': 'Tutup',
    'Mulai': 'Mimitian',                          // ✓
    'Stop': 'Eureunan',                           // ✓ "eureun" = berhenti
    'Pause': 'Reureuh',                           // ?
    'Mulai Run': 'Mimitian Lumpat',               // ? "lumpat" = lari
    'Buat Akun': 'Damel Akun',                    // ✓ "damel" = bikin lemes
    'Lanjutkan dengan Google': 'Teraskeun nganggo Google',
    'Daftar dengan Google': 'Ngadaptar nganggo Google',
    'Masuk sebagai Guest / Debug': 'Lebet salaku Sémah / Debug',  // "sémah" = tamu lemes
    'Coba dulu sebagai Guest': 'Cobian heula salaku Sémah',
    'Lupa password?': 'Hilap password?',          // ✓ "hilap" = lupa lemes
    'atau': 'atanapi',                            // ✓ lemes "atau"
    'Konfirmasi Password': 'Konfirmasi Password',
    'Email': 'Email',
    'Password': 'Password',
    'Nama': 'Nami',                               // ✓ "nami" = nama lemes
    'Nama lengkap': 'Nami lengkep',
    'Minimal 6 karakter': 'Saeutik 6 karakter',   // ?
    'Ulangi password': 'Ulang deui password',
    'Buka Ticket': 'Buka Ticket',
    'Replay Tour': 'Ulang Tur',
    'Selanjutnya': 'Salajengna',                  // ✓

    // Hero / landing
    'AERVINEX adalah smartwatch untuk': 'AERVINEX nyaéta smartwatch kanggo',  // ✓
    'pelari': 'jalmi anu lumpat',                 // ?
    'warga kota': 'warga kota',
    'Pelari & Atlet': 'Pelari & Atlit',
    'Warga Urban & Komuter': 'Warga Kota & Komuter',
    'Untuk Pelari & Warga Urban': 'Kanggo Pelari & Warga Kota',
    'Untuk Siapa?': 'Kanggo Saha?',               // ✓
    'Dua dunia, satu wearable.': 'Dua dunya, hiji wearable.',
    'Tentang Project': 'Ngeunaan Proyék',         // ✓
    'Penelitian skripsi yang nyata.': 'Panalungtikan skripsi anu nyata.',  // ✓ "panalungtikan" = penelitian
    'Berbasis Bukti': 'Dumasar Bukti',            // ✓
    'ML Pipeline Lengkap': 'ML Pipeline Lengkep',
    'Open untuk Riset': 'Kabuka pikeun Risét',
    'Energy Harvesting': 'Energy Harvesting',
    'Siap mencoba?': 'Siap nyobian?',
    'Mulai monitoring kesehatan Anda hari ini.': 'Mimitian mantau kaséhatan anjeun dinten ieu.',  // ✓
    'Apa yang dilakukan AERVINEX': 'Naon anu dilakukeun AERVINEX',
    'Lima sensor, satu ekosistem AI': 'Lima sensor, hiji ékosistém AI',

    // Greeting
    'Selamat datang,': 'Wilujeng sumping,',       // ✓ klasik lemes
    'Selamat pagi,': 'Wilujeng énjing,',          // ✓
    'Selamat datang di AERVINEX!': 'Wilujeng sumping di AERVINEX!',
    'Athlete': 'Atlit',
    'Member': 'Anggota',

    // Section titles
    'Vital Signs': 'Tanda Vital',
    'Lingkungan': 'Lingkungan',
    'Deteksi Risiko Penyakit': 'Deteksi Résiko Panyakit',
    'Rekomendasi AI · Real-time': 'Saran AI · Real-time',
    'Aksi Cepat': 'Aksi Gancang',                 // ✓ "gancang" = cepat
    'Aksi Mitigasi': 'Aksi Mitigasi',
    'Tentang Risiko Ini': 'Ngeunaan Résiko Ieu',
    'Faktor Kontribusi': 'Faktor Kontribusi',

    // Health / metrics
    'Detak Jantung': 'Detak Jajantung',           // ✓
    'Tekanan Darah': 'Tekenan Getih',             // ? "getih" = darah
    'Suhu Tubuh': 'Suhu Awak',
    'Kualitas Udara': 'Kualitas Hawa',
    'Saturasi Oksigen': 'Saturasi Oksigén',
    'Risiko Rendah': 'Résiko Handap',             // ✓ "handap" = rendah
    'Risiko Sedang': 'Résiko Sedeng',
    'Risiko Tinggi': 'Résiko Luhur',              // ✓ "luhur" = tinggi
    'Aman': 'Aman',
    'Hati-hati': 'Ati-ati',
    'Bahaya': 'Bahaya',

    // Alerts / status
    'Pemberitahuan': 'Pamberitahuan',
    'Belum ada notifikasi': 'Teu acan aya notifikasi',
    'Tandai sudah dibaca': 'Tandaan parantos diaos',
    'Lihat semua →': 'Tingali sadayana →',        // ✓ "sadayana" = semua lemes
    'Detail →': 'Rinci →',

    // Footer / misc
    'Powered by Firebase': 'Diaktipkeun ku Firebase',
    'Made with research-grade care': 'Didamel ku research-grade care',
    'Research-grade methodology': 'Metodologi research-grade',

    // Onboarding / consent
    'Saya menyetujui': 'Abdi satuju',             // ✓ "abdi" = saya lemes
    'Syarat & Ketentuan': 'Sarat & Katangtuan',
    'Kebijakan Privasi': 'Kawijakan Privasi',
    'Saya berusia di atas 18 tahun': 'Yuswa abdi parantos langkung ti 18 taun',  // ✓

    // Recovery / sleep
    'Tidur': 'Bobo',                              // ✓ "bobo" lemes (sare = standar)
    'Kualitas Tidur': 'Kualitas Bobo',
    'Pemulihan': 'Pamulihan',
    'Stress': 'Strés',
    'Skor Pemulihan': 'Skor Pamulihan',

    // Running
    'Jarak': 'Jarak',
    'Durasi': 'Lilana',                           // ? "lilana" = lamanya
    'Kecepatan': 'Gancangna',
    'Pace': 'Pace',
    'Mulai Lari': 'Mimitian Lumpat',
    'Riwayat': 'Riwayat',

    // Errors / states
    'Memuat...': 'Ngamuat...',
    'Gagal memuat': 'Gagal ngamuat',
    'Coba lagi': 'Cobian deui',                   // ✓
    'Tidak ada data': 'Teu aya data',             // ✓ "teu aya" = tidak ada
  };

  // Register
  window.AervinexI18nExt = window.AervinexI18nExt || { dicts: {}, langs: ['id', 'en'] };
  window.AervinexI18nExt.dicts['su'] = SU;
  if (!window.AervinexI18nExt.langs.includes('su')) window.AervinexI18nExt.langs.push('su');
  window.AervinexI18nExt.labels = window.AervinexI18nExt.labels || {};
  window.AervinexI18nExt.labels['su'] = 'Sunda (Lemes)';

  if (typeof window.AervinexI18n.registerLang === 'function') {
    window.AervinexI18n.registerLang('su', SU, 'Sunda (Lemes)');
  }

  window.AervinexI18nExt.stats = window.AervinexI18nExt.stats || {};
  window.AervinexI18nExt.stats['su'] = {
    total: Object.keys(SU).length,
    note: 'Banyak entri butuh review penutur asli Sunda Priangan/Bandung. Khusus tone lemes (krama-equivalent).'
  };
})();
