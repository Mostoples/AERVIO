# i18n Strings — Cluster C (Activity + Community + AI + Hardware + Subscription)

Extracted from 14 files. Format: object literal ready to paste into DICT.

---

### From: public/running.html (12 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Sesi disimpan ke history': 'Session saved to history',
'Sesi di-pause': 'Session paused',
'${lastKmAnnounced} kilometer tercapai. Pertahankan pace.': '${lastKmAnnounced} kilometers reached. Maintain pace.',
'Peringatan. Kualitas udara buruk. Pertimbangkan pindah area atau pakai masker.': 'Warning. Air quality is poor. Consider moving area or wearing a mask.',
'Sesi running dimulai. GPS tracking aktif. Selamat berlari.': 'Running session started. GPS tracking active. Happy running.',
// (Z1 Recovery, Z2 Endurance, Z3 Tempo, Active Session, Pause, Stop & Save — already English in source)
```

---

### From: public/recovery.html (8 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Siap untuk latihan intensitas tinggi besok pagi': 'Ready for high intensity training tomorrow morning',
'Latihan intensitas tinggi besok': 'High intensity training tomorrow',
'Recovery cukup, target Z3-Z4 aman': 'Recovery sufficient, Z3-Z4 target safe',
'Tidur ≥ 7 jam malam ini': 'Sleep ≥ 7 hours tonight',
'Trend HRV menunjukkan butuh konsolidasi': 'HRV trend indicates consolidation needed',
'Hidrasi 2L sebelum sesi': 'Hydrate 2L before session',
'Heat index sore besok ≥ 32°C': 'Heat index tomorrow afternoon ≥ 32°C',
'Siap untuk latihan intensitas tinggi · <strong>ML XGBoost ': 'Ready for high intensity training · <strong>ML XGBoost ',
'Latihan moderate disarankan · <strong>ML ': 'Moderate training recommended · <strong>ML ',
'Recovery diperlukan · <strong>ML ': 'Recovery needed · <strong>ML ',
'hindari Z4-Z5': 'avoid Z4-Z5',
```

---

### From: public/history.html (5 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Sesi terakhir & trend': 'Latest sessions & trend',
'Sesi Terbaru': 'Recent Sessions',
'28 Mei 2026 · 28:14 · Z2 dominan': '28 May 2026 · 28:14 · Z2 dominant',
'27 Mei 2026 · HRV +8ms · stres turun': '27 May 2026 · HRV +8ms · stress down',
'26 Mei 2026 · 36:42 · Z3-Z4': '26 May 2026 · 36:42 · Z3-Z4',
'25 Mei 2026 · Level 2 · Mitigasi: indoor': '25 May 2026 · Level 2 · Mitigation: indoor',
```

---

### From: public/session-detail.html (10 strings)
```js
'28 Mei 2026 · 06:14': '28 May 2026 · 06:14',
'Environment saat sesi': 'Environment during session',
'sedang': 'moderate',
'nyaman': 'comfortable',
'rendah': 'low',
'Stasiun': 'Station',
'Sesi recovery — tidak ada splits jarak': 'Recovery session — no distance splits',
'28 Mei 2026 · 06:14': '28 May 2026 · 06:14',
'27 Mei 2026 · 21:30': '27 May 2026 · 21:30',
'26 Mei 2026 · 06:08': '26 May 2026 · 06:08',
```

---

### From: public/device.html (45 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Status perangkat & sensor': 'Device & sensor status',
'Baterai & Energi': 'Battery & Energy',
'~22 jam': '~22 hours',
'tersisa': 'remaining',
'Aktif · +': 'Active · +',
'mW dari panas tubuh': 'mW from body heat',
'Biofuel Cell (Keringat)': 'Biofuel Cell (Sweat)',
'Standby · butuh keringat lebih': 'Standby · needs more sweat',
'Aktif · +${val} mW dari elektrolit keringat': 'Active · +${val} mW from sweat electrolytes',
'Polling sensor turun 50% saat baterai < 20%': 'Sensor polling drops 50% when battery < 20%',
'Status Sensor': 'Sensor Status',
'Skin temp · sirkulasi': 'Skin temp · circulation',
'Akurasi ±0.1°C · last read ': 'Accuracy ±0.1°C · last read ',
'Kalibrasi 2h lalu · last read ': 'Calibrated 2h ago · last read ',
'arus rata-rata ': 'avg current ',
'Sinkronisasi': 'Synchronization',
'Tiap 30 detik via BLE': 'Every 30 seconds via BLE',
'Sinkronisasi terakhir': 'Last sync',
'12 detik lalu': '12 seconds ago',
'Firmware & Tindakan': 'Firmware & Actions',
'Up-to-date · cek pembaruan': 'Up-to-date · check for updates',
'Kalibrasi Sensor': 'Sensor Calibration',
'Optical & particulate · rekomendasi tiap 30 hari': 'Optical & particulate · recommended every 30 days',
'Pair Ulang Device': 'Re-pair Device',
'Reset koneksi BLE': 'Reset BLE connection',
'Factory Reset Device': 'Factory Reset Device',
'Baru saja': 'Just now',
'Sinkronisasi manual berhasil': 'Manual sync successful',
'${s} detik lalu': '${s} seconds ago',
'${min} menit lalu': '${min} minutes ago',
// Calibration modal
'Letakkan watch di permukaan datar & jangan gerakkan selama proses': 'Place the watch on a flat surface & do not move during the process',
'Memulai...': 'Starting...',
'${remain} detik tersisa': '${remain} seconds remaining',
'Selesai': 'Complete',
'Pastikan watch terpasang pada pergelangan tangan, tidak terlalu longgar': 'Make sure the watch is fitted on your wrist, not too loose',
'Pastikan watch terpasang pada pergelangan tangan': 'Make sure the watch is fitted on your wrist',
'Sensor PPG sedang diukur — jangan gerakkan tangan': 'PPG sensor is being measured — do not move your hand',
'Sensor partikel sedang membersihkan chamber via micro-fan': 'Particulate sensor is cleaning chamber via micro-fan',
'Suhu kulit diukur — tunggu beberapa detik lagi': 'Skin temperature being measured — wait a few more seconds',
'Batalkan': 'Cancel',
'Kalibrasi dibatalkan': 'Calibration cancelled',
'✓ SELESAI': '✓ COMPLETE',
'Semua sensor terkalibrasi': 'All sensors calibrated',
'Akurasi sensor optimal · drift terkoreksi · valid 30 hari': 'Optimal sensor accuracy · drift corrected · valid 30 days',
'Kalibrasi berhasil — akurasi sensor optimal': 'Calibration successful — optimal sensor accuracy',
// Pairing modal
'Pastikan AERVINEX Watch dalam mode pairing (tahan tombol crown 3 detik)': 'Make sure AERVINEX Watch is in pairing mode (hold crown button 3 seconds)',
'Memindai perangkat BLE...': 'Scanning BLE devices...',
'Belum ada perangkat terdeteksi': 'No devices detected yet',
'Tutup': 'Close',
'-72 dBm · sinyal lemah · tidak dikenal': '-72 dBm · weak signal · unknown',
'-65 dBm · sudah pernah pair': '-65 dBm · previously paired',
'${found} perangkat ditemukan · masih memindai...': '${found} devices found · still scanning...',
'Menghubungkan...': 'Connecting...',
'REKOM': 'RECOM',
'✓ Terhubung · BLE handshake selesai': '✓ Connected · BLE handshake complete',
'Pair berhasil: ${name}': 'Pair successful: ${name}',
'Pemindaian selesai · tap untuk hubungkan': 'Scanning complete · tap to connect',
// Firmware modal
'Memeriksa pembaruan dari server AERVINEX...': 'Checking updates from AERVINEX server...',
'Mengecek...': 'Checking...',
'✓ Firmware <strong>v1.0.3</strong> sudah versi terbaru': '✓ Firmware <strong>v1.0.3</strong> is the latest version',
'Update terakhir 12 hari lalu · release notes': 'Last update 12 days ago · release notes',
// Reset confirmation
'Hapus semua data device dan reset ke pengaturan pabrik? Tindakan ini tidak bisa dibatalkan.': 'Delete all device data and reset to factory settings? This action cannot be undone.',
'Factory reset dibatalkan (demo mode)': 'Factory reset cancelled (demo mode)',
```

---

### From: public/device-pair.html (24 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Hubungkan AERVINEX sensor via Web Bluetooth': 'Connect AERVINEX sensor via Web Bluetooth',
'Belum terhubung': 'Not connected',
'Tekan "Pair Device" untuk memulai pencarian Bluetooth.': 'Tap "Pair Device" to start Bluetooth search.',
'<strong>Web Bluetooth tidak tersedia.</strong>': '<strong>Web Bluetooth is not available.</strong>',
'Browser ini tidak mendukung Web Bluetooth API. Gunakan:': 'This browser does not support Web Bluetooth API. Use:',
'Bluefy (iOS — workaround pihak ketiga)': 'Bluefy (iOS — third-party workaround)',
'Lihat': 'See',
'dokumentasi fallback': 'fallback documentation',
'Aksi': 'Action',
'Telemetri Live': 'Live Telemetry',
'Log': 'Log',
'Menunggu aksi pairing...': 'Waiting for pairing action...',
'Tidak didukung': 'Not supported',
'Browser ini tidak mendukung Web Bluetooth API.': 'This browser does not support Web Bluetooth API.',
'Terhubung': 'Connected',
'Streaming telemetri aktif.': 'Telemetry streaming active.',
'Terputus': 'Disconnected',
'Connected — GATT siap.': 'Connected — GATT ready.',
'Memilih device...': 'Selecting device...',
'Pilih AERVINEX sensor dari daftar.': 'Select AERVINEX sensor from the list.',
'Pair berhasil': 'Pair successful',
'Gagal pair': 'Pair failed',
'Pair gagal: ': 'Pair failed: ',
```

---

### From: public/calibrate.html (22 strings)
```js
'Atur baseline untuk akurasi optimal': 'Set baseline for optimal accuracy',
'Wizard Kalibrasi': 'Calibration Wizard',
'Kalibrasi membantu menyesuaikan sensor AERVINEX dengan baseline fisiologi Anda. Proses ini perlu diulang setiap 30 hari atau setelah pergantian device.': 'Calibration helps tune AERVINEX sensors to your physiological baseline. This process should be repeated every 30 days or after changing devices.',
'⚠️ Pastikan Anda dalam keadaan istirahat (duduk 5 menit) sebelum mulai.': '⚠️ Make sure you are at rest (sitting 5 minutes) before starting.',
'Mulai Kalibrasi': 'Start Calibration',
'1. Resting Heart Rate': '1. Resting Heart Rate',
'Heart rate saat duduk tenang. Akan jadi anchor untuk HRV & arrhythmia detection.': 'Heart rate when sitting calmly. Will be the anchor for HRV & arrhythmia detection.',
'Resting HR (bpm)': 'Resting HR (bpm)',
'Default berdasarkan populasi Asia Tenggara: 65-75 bpm. Atlet endurance: 50-60 bpm.': 'Default based on Southeast Asian population: 65-75 bpm. Endurance athletes: 50-60 bpm.',
'Kembali': 'Back',
'Lanjut': 'Next',
'2. Skin Temp Baseline': '2. Skin Temp Baseline',
'Suhu kulit pergelangan tangan saat istirahat di ruangan ber-AC. Untuk heatstroke detection.': 'Wrist skin temperature at rest in an air-conditioned room. For heatstroke detection.',
'Skin Temp Baseline (°C)': 'Skin Temp Baseline (°C)',
'Tipikal di iklim tropis: 32.5-33.5 °C. Diukur 5 menit setelah AC ON.': 'Typical in tropical climates: 32.5-33.5 °C. Measured 5 minutes after AC ON.',
'3. Review & Simpan': '3. Review & Save',
'Simpan Kalibrasi': 'Save Calibration',
'Nilai ini disimpan di profil Anda dan dipakai untuk menormalisasi skor TEPRS, TUHAM, dan AFib screening.': 'These values are saved to your profile and used to normalize TEPRS, TUHAM, and AFib screening scores.',
'Login dulu': 'Login first',
'Kalibrasi tersimpan': 'Calibration saved',
'Gagal simpan: ': 'Failed to save: ',
```

---

### From: public/live-data.html (10 strings)
```js
'Real-time stream dari AERVINEX device': 'Real-time stream from AERVINEX device',
'Menunggu data...': 'Waiting for data...',
'— offline —': '— offline —',
'Real-Time Vitals': 'Real-Time Vitals',
'${sign}${delta} ${unit} vs 30s lalu': '${sign}${delta} ${unit} vs 30s ago',
'Baru saja': 'Just now',
'${elapsed} detik lalu': '${elapsed} seconds ago',
'${min} menit lalu': '${min} minutes ago',
'Tidak ada data — pair device dulu': 'No data — pair device first',
```

---

### From: public/community.html (28 strings)
```js
'Komunitas': 'Community',
'Komunitas AERVINEX 🌿': 'AERVINEX Community 🌿',
'Ruang aman untuk pelari & warga urban Indonesia berbagi pengalaman, tips, dan saling dukung — termasuk asisten <strong>Aervi AI</strong> untuk tanya jawab cepat.': 'A safe space for runners & urban Indonesians to share experiences, tips, and support each other — including the <strong>Aervi AI</strong> assistant for quick Q&A.',
'anggota': 'members',
'pesan minggu ini': 'messages this week',
'channel aktif': 'active channels',
'Aervi AI Assistant': 'Aervi AI Assistant',
'Tanya jawab kesehatan, polusi, training plan — instant 24/7': 'Q&A on health, pollution, training plans — instant 24/7',
'Semua': 'All',
'🏃 Pelari': '🏃 Runners',
'🏙️ Urban': '🏙️ Urban',
'🩺 Kesehatan': '🩺 Health',
'📍 Per Kota': '📍 By City',
'BARU': 'NEW',
'POPULER': 'POPULAR',
'— online': '— online',
'— pesan': '— messages',
'${n} online': '${n} online',
'${n} pesan': '${n} messages',
'Risiko': 'Risk',
'Profil': 'Profile',
// Channels
'Pelari Jakarta': 'Jakarta Runners',
'Komunitas pelari Sudirman, GBK, Senayan. Share rute aman + AQI alert.': 'Community of Sudirman, GBK, Senayan runners. Share safe routes + AQI alerts.',
'Pelari Bandung': 'Bandung Runners',
'Lari Dago, Babakan Siliwangi. Tips heat acclimatization untuk pegunungan.': 'Run at Dago, Babakan Siliwangi. Heat acclimatization tips for mountain areas.',
'Pelari Surabaya': 'Surabaya Runners',
'Komunitas lari Suroboyo, House of Sampoerna route. Heat humidity tips.': 'Suroboyo running community, House of Sampoerna route. Heat humidity tips.',
'Komuter Motor': 'Motorbike Commuters',
'Tips masker N95, ganti filter, rute hindari polusi. Komuter 1-2 jam.': 'N95 mask tips, filter replacement, pollution-avoiding routes. 1-2 hour commute.',
'Warga Urban Jakarta': 'Jakarta Urban Residents',
'Diskusi PM2.5, ISPU, rekomendasi air purifier rumah. Kondisi udara harian.': 'Discussion on PM2.5, ISPU, home air purifier recommendations. Daily air conditions.',
'Asma Support Group': 'Asthma Support Group',
'Pelaku & caregiver asma. Trigger management, peak flow, action plan.': 'Asthma patients & caregivers. Trigger management, peak flow, action plan.',
'Cardiac Support': 'Cardiac Support',
'AFib, hipertensi support. Konsultasi peer (BUKAN dokter), share success.': 'AFib, hypertension support. Peer consultation (NOT a doctor), share successes.',
'Stress & Sleep': 'Stress & Sleep',
'HRV training, mindfulness, sleep hygiene tips. Mental health peer support.': 'HRV training, mindfulness, sleep hygiene tips. Mental health peer support.',
// Guidelines
'💡 <strong>Aturan komunitas</strong>: Tidak boleh self-promotion, spam, ujaran kebencian, atau klaim medis. Konsultasi dokter untuk masalah kesehatan serius. Lapor pelanggaran via tombol 🚩 di tiap pesan. Pelanggaran berulang → ban permanen.': '💡 <strong>Community guidelines</strong>: No self-promotion, spam, hate speech, or medical claims. Consult a doctor for serious health issues. Report violations via the 🚩 button on each message. Repeated violations → permanent ban.',
```

---

### From: public/community-channel.html (16 strings)
```js
'Channel — AERVINEX Komunitas': 'Channel — AERVINEX Community',
'Kembali': 'Back',
'Loading…': 'Loading…',
'— online': '— online',
'— anggota': '— members',
'Info channel': 'Channel info',
'🚨 Bukan saran medis. Untuk masalah kesehatan serius, konsultasi dokter atau hubungi 119 (PSC Kemenkes).': '🚨 Not medical advice. For serious health issues, consult a doctor or call 119 (PSC Kemenkes).',
'Belum ada pesan di channel ini. Jadilah yang pertama!': 'No messages in this channel yet. Be the first!',
'Tulis pesan… (Enter kirim, Shift+Enter baris baru)': 'Type a message… (Enter to send, Shift+Enter for new line)',
'Kirim pesan': 'Send message',
'Anonim': 'Anonymous',
'Laporkan': 'Report',
'🚩 Lapor': '🚩 Report',
'Hapus': 'Delete',
'🗑️ Hapus': '🗑️ Delete',
'Tunggu 1.5 detik sebelum kirim lagi': 'Wait 1.5 seconds before sending again',
'Pesan maksimal 500 karakter': 'Message maximum 500 characters',
'Gagal kirim. Coba lagi.': 'Failed to send. Try again.',
'Laporkan pesan ini sebagai spam/abuse?': 'Report this message as spam/abuse?',
'Laporan dikirim. Tim moderator akan review.': 'Report sent. Moderator team will review.',
'Hapus pesan ini? Tidak bisa dibatalkan.': 'Delete this message? Cannot be undone.',
'Gagal hapus. Hanya pemilik pesan yang bisa hapus.': 'Failed to delete. Only the message owner can delete.',
// Channel meta (also in CHANNEL_META)
'Channel': 'Channel',
```

---

### From: public/ai-chat.html (32 strings)
```js
'Kembali': 'Back',
'Asisten kesehatan personal · Powered by Gemini': 'Personal health assistant · Powered by Gemini',
'Reset percakapan': 'Reset conversation',
'🔄 Reset': '🔄 Reset',
'⚠️ <strong>Bukan saran medis profesional.</strong> Aervi AI memberikan informasi edukatif dan rekomendasi gaya hidup berbasis data Anda. Untuk diagnosis, treatment, atau kondisi darurat, konsultasi dokter / hubungi <strong>119 (PSC Kemenkes)</strong>.': '⚠️ <strong>Not professional medical advice.</strong> Aervi AI provides educational information and lifestyle recommendations based on your data. For diagnosis, treatment, or emergency conditions, consult a doctor / call <strong>119 (PSC Kemenkes)</strong>.',
'Hai, saya Aervi!': 'Hi, I\'m Aervi!',
'Asisten kesehatan AERVINEX yang siap bantu jawab pertanyaan Anda tentang polusi udara, training lari, sleep, kondisi penyakit, dan tips wellness.': 'AERVINEX\'s health assistant, ready to answer your questions about air pollution, running training, sleep, medical conditions, and wellness tips.',
// Capability cards
'Polusi Udara': 'Air Pollution',
'Cara baca AQI, kapan pakai masker': 'How to read AQI, when to wear a mask',
'Training': 'Training',
'Heart rate zone, recovery, EPO': 'Heart rate zone, recovery, EPO',
'Sleep & Stres': 'Sleep & Stress',
'HRV, sleep hygiene, mindfulness': 'HRV, sleep hygiene, mindfulness',
'Penyakit': 'Conditions',
'Asma, hipertensi, AFib management': 'Asthma, hypertension, AFib management',
// Suggestion chips (button text + data-prompt)
'PM2.5 Jakarta hari ini': 'PM2.5 Jakarta today',
'PM2.5 hari ini di Jakarta seperti apa? Aman lari pagi?': 'How is PM2.5 in Jakarta today? Safe for a morning run?',
'Turunkan resting HR': 'Lower resting HR',
'Bagaimana cara menurunkan resting heart rate?': 'How do I lower my resting heart rate?',
'Apa itu HRV?': 'What is HRV?',
'Apa itu HRV dan kenapa penting?': 'What is HRV and why is it important?',
'Lari saat panas': 'Running when hot',
'Tips lari aman saat heat index tinggi': 'Tips for safe running when heat index is high',
'Tanda asma flare': 'Asthma flare signs',
'Tanda-tanda awal asma flare-up': 'Early signs of an asthma flare-up',
'Durasi tidur ideal': 'Ideal sleep duration',
'Berapa lama tidur ideal per malam?': 'How many hours of sleep are ideal per night?',
// Input + send
'Tanya Aervi… (Enter kirim, Shift+Enter baris baru)': 'Ask Aervi… (Enter to send, Shift+Enter for new line)',
'Kirim': 'Send',
'Maks 1000 karakter': 'Max 1000 characters',
'Maaf, saya tidak bisa menjawab sekarang.': 'Sorry, I cannot answer right now.',
'Reset percakapan? History akan hilang.': 'Reset conversation? History will be lost.',
// Local fallback responses (multi-paragraph)
'PM2.5 adalah partikel halus berdiameter <2.5µm yang bisa masuk ke paru-paru. Threshold WHO 2021: <15 µg/m³ aman, 25-55 sedang, >75 berbahaya. Di Jakarta, peak biasanya 7-9 pagi dan 5-8 sore. Saran: cek ISPU di ispu.menlhk.go.id atau dashboard AERVINEX, hindari outdoor exercise saat AQI >150, pakai masker N95 jika harus keluar.': 'PM2.5 is fine particulate matter <2.5µm in diameter that can enter the lungs. WHO 2021 thresholds: <15 µg/m³ safe, 25-55 moderate, >75 hazardous. In Jakarta, peaks are usually 7-9 AM and 5-8 PM. Recommendations: check ISPU at ispu.menlhk.go.id or the AERVINEX dashboard, avoid outdoor exercise when AQI >150, wear an N95 mask if you must go out.',
'HRV (Heart Rate Variability) adalah variasi interval antar detak jantung. HRV tinggi = sistem saraf otonom seimbang = recovery baik. HRV rendah = stres/kelelahan. Cara naikkan HRV: tidur 7-9 jam, aerobic training zone 2, breathwork 4-7-8, kurangi alkohol/kafein, manajemen stres. Pantau trend 7-day rolling, bukan absolute.': 'HRV (Heart Rate Variability) is the variation in intervals between heartbeats. High HRV = balanced autonomic nervous system = good recovery. Low HRV = stress/fatigue. How to raise HRV: 7-9 hours of sleep, zone 2 aerobic training, 4-7-8 breathwork, reduce alcohol/caffeine, stress management. Track 7-day rolling trend, not absolute values.',
'Resting HR ideal: pria 60-80 bpm, wanita 60-85 bpm. Atlet bisa 40-60. Cara turunkan: aerobic training 150 min/minggu, tidur cukup, hidrasi, kurangi kafein, manajemen stres. RHR tiba-tiba naik >5 bpm dari baseline = warning sign (overtraining, infeksi, dehidrasi).': 'Ideal resting HR: men 60-80 bpm, women 60-85 bpm. Athletes can be 40-60. How to lower it: 150 min/week aerobic training, adequate sleep, hydration, reduce caffeine, stress management. RHR suddenly rising >5 bpm above baseline = warning sign (overtraining, infection, dehydration).',
'Tanda awal asma flare-up: batuk malam meningkat, sesak napas saat ringan, dada berat, peak flow drop >20% dari personal best, butuh inhaler reliever lebih sering. Trigger umum: polusi PM2.5, alergen, infeksi, exercise, stres. Action: ikuti asthma action plan, hindari trigger, konsultasi dokter jika peak flow <80%.': 'Early signs of an asthma flare-up: increased nighttime cough, shortness of breath with light activity, chest tightness, peak flow drop >20% from personal best, needing reliever inhaler more often. Common triggers: PM2.5 pollution, allergens, infection, exercise, stress. Action: follow your asthma action plan, avoid triggers, consult a doctor if peak flow <80%.',
'Heart rate zones (% HRmax): Z1 50-60% recovery, Z2 60-70% aerobic base, Z3 70-80% tempo, Z4 80-90% threshold, Z5 90-100% VO2max. 80% latihan harus Z2 untuk endurance base. HRmax = 208 − 0.7×umur (Tanaka). Saat heat index >32°C, kurangi pace 30 detik/km dan sering minum.': 'Heart rate zones (% HRmax): Z1 50-60% recovery, Z2 60-70% aerobic base, Z3 70-80% tempo, Z4 80-90% threshold, Z5 90-100% VO2max. 80% of training should be Z2 for endurance base. HRmax = 208 − 0.7×age (Tanaka). When heat index >32°C, slow pace by 30 sec/km and drink frequently.',
'Durasi tidur ideal dewasa: 7-9 jam (NSF guidelines). Tips sleep hygiene: konsisten jam tidur/bangun, gelap+sejuk 18-20°C, no screen 1 jam sebelum tidur, kafein cut-off pukul 14:00, magnesium glycinate bisa bantu. Sleep debt akumulatif — tidak bisa "balas" weekend.': 'Ideal adult sleep duration: 7-9 hours (NSF guidelines). Sleep hygiene tips: consistent sleep/wake times, dark+cool 18-20°C, no screens 1 hour before bed, caffeine cut-off at 2 PM, magnesium glycinate may help. Sleep debt is cumulative — you can\'t "repay" on weekends.',
'Saat heat index >32°C: kurangi intensity, pre-hydrate 500ml 2 jam sebelum, minum 200ml/15 menit saat lari, pakai topi+sunglasses, hindari 11:00-15:00. Tanda heatstroke: confusion, stop sweat, suhu >40°C, HR >130 — emergency!': 'When heat index >32°C: reduce intensity, pre-hydrate 500ml 2 hours before, drink 200ml/15 min while running, wear hat+sunglasses, avoid 11 AM-3 PM. Heatstroke signs: confusion, no sweat, temp >40°C, HR >130 — emergency!',
'Saya sedang dalam mode offline (Cloud Function belum dikonfigurasi). Untuk pertanyaan spesifik, silakan cek:\n• Dashboard untuk kondisi udara real-time\n• Risk-list untuk 35 kondisi yang dipantau\n• Encyclopedia untuk edukasi kesehatan\n• Untuk medical advice, konsultasi dokter.\n\nKalau admin sudah enable Gemini API, saya akan online lagi.': 'I\'m currently in offline mode (Cloud Function not configured). For specific questions, please check:\n• Dashboard for real-time air conditions\n• Risk-list for the 35 monitored conditions\n• Encyclopedia for health education\n• For medical advice, consult a doctor.\n\nOnce the admin enables the Gemini API, I will be online again.',
```

---

### From: public/ae-report.html (28 strings)
```js
'Laporan Adverse Event': 'Adverse Event Report',
'Lapor Adverse Event': 'Report Adverse Event',
'Insiden kesehatan terkait penggunaan AERVINEX': 'Health incidents related to AERVINEX usage',
'<strong>⚠️ Penting</strong>: Laporan ini dipakai untuk audit keamanan & perbaikan ML model. Jika Anda mengalami darurat medis sekarang, hubungi <strong>119</strong> atau ke UGD terdekat, jangan menunggu form ini.': '<strong>⚠️ Important</strong>: This report is used for safety audits & ML model improvement. If you are experiencing a medical emergency now, call <strong>119</strong> or go to the nearest ER, do not wait for this form.',
'Detail Insiden': 'Incident Details',
'Tipe Event': 'Event Type',
'False alarm — alert dipicu tapi saya sehat': 'False alarm — alert triggered but I am healthy',
'Missed alarm — saya sakit tapi tidak ada warning': 'Missed alarm — I was sick but no warning was shown',
'Klasifikasi salah — kondisi terbaca berbeda': 'Wrong classification — condition was read differently',
'Iritasi/luka kulit dari device': 'Skin irritation/injury from the device',
'UI menyesatkan / interpretasi salah': 'Misleading UI / wrong interpretation',
'Lainnya': 'Other',
'Tingkat Keparahan': 'Severity Level',
'Minor — tidak mempengaruhi kesehatan': 'Minor — does not affect health',
'Moderate — cemas atau kesalahpahaman': 'Moderate — anxiety or misunderstanding',
'Major — menyebabkan tindakan medis tidak perlu (ER visit, dsb)': 'Major — caused unnecessary medical action (ER visit, etc)',
'Severe — perawatan rawat inap atau kerugian permanen': 'Severe — hospitalization or permanent harm',
'Tanggal & Waktu Kejadian': 'Date & Time of Incident',
'Deskripsi Kejadian': 'Incident Description',
'Jelaskan apa yang terjadi, alert apa yang muncul, tindakan yang Anda ambil, dan dampaknya...': 'Describe what happened, what alert appeared, what action you took, and its impact...',
'Riwayat Penyakit Relevan (opsional)': 'Relevant Medical History (optional)',
'mis. asma, hipertensi, diabetes': 'e.g. asthma, hypertension, diabetes',
'Kontak untuk Follow-up (opsional)': 'Contact for Follow-up (optional)',
'Email atau WhatsApp — kosongkan jika anonim': 'Email or WhatsApp — leave empty if anonymous',
'Data laporan ini hanya diakses tim audit AERVINEX. Tidak dibagikan ke pihak ketiga tanpa izin Anda.': 'This report data is only accessed by the AERVINEX audit team. Not shared with third parties without your permission.',
'Kebijakan Privasi': 'Privacy Policy',
'Kirim Laporan': 'Send Report',
'Login dulu': 'Login first',
'Deskripsi wajib diisi': 'Description is required',
'✓ Laporan terkirim. Tim audit akan menghubungi Anda dalam 7 hari kerja jika kontak diberikan.': '✓ Report sent. The audit team will contact you within 7 business days if contact info is provided.',
'Gagal kirim: ': 'Failed to send: ',
```

---

### From: public/health-bridge.html (11 strings)
```js
'Integrasi data wearable eksternal': 'External wearable data integration',
'AERVINEX dapat membaca data dari wearable lain (Garmin, Apple Watch, Fitbit) untuk cross-validation dan kelengkapan data saat AERVINEX device tidak dipakai. Semua integrasi opt-in.': 'AERVINEX can read data from other wearables (Garmin, Apple Watch, Fitbit) for cross-validation and data completeness when the AERVINEX device is not worn. All integrations are opt-in.',
'Integrasi Tersedia': 'Available Integrations',
'Belum konek': 'Not connected',
'Connect Garmin': 'Connect Garmin',
'Import via iOS Shortcuts atau native bridge (TBD)': 'Import via iOS Shortcuts or native bridge (TBD)',
'Native bridge': 'Native bridge',
'Pelajari Cara Import': 'Learn How to Import',
'OAuth 2.0 — heart rate & activity steps': 'OAuth 2.0 — heart rate & activity steps',
'Connect Fitbit': 'Connect Fitbit',
'Catatan': 'Notes',
'Integrasi ini saat ini bersifat <strong>scaffold</strong>: OAuth flow belum live di production. Lihat <a href="/docs/external-api-integration.md" style="color:var(--accent)">dokumentasi integrasi</a> untuk detail OAuth callback, scope, dan rate-limit per provider.': 'These integrations are currently <strong>scaffolded</strong>: OAuth flow is not live in production yet. See <a href="/docs/external-api-integration.md" style="color:var(--accent)">integration documentation</a> for OAuth callback, scope, and rate-limit details per provider.',
'${name} OAuth belum live di build ini.\n\nDeveloper harus:\n1. Register OAuth app di portal provider\n2. Set CLIENT_ID + CLIENT_SECRET di Cloud Function env\n3. Implement callback handler\n\nLihat docs/external-api-integration.md': '${name} OAuth is not live in this build.\n\nDevelopers must:\n1. Register the OAuth app on the provider portal\n2. Set CLIENT_ID + CLIENT_SECRET in the Cloud Function env\n3. Implement the callback handler\n\nSee docs/external-api-integration.md',
'Apple HealthKit hanya bisa diakses dari native iOS app.\nWorkaround: gunakan iOS Shortcuts → export CSV → upload ke AERVINEX (fitur upload akan rilis di Phase 2).': 'Apple HealthKit can only be accessed from a native iOS app.\nWorkaround: use iOS Shortcuts → export CSV → upload to AERVINEX (upload feature will ship in Phase 2).',
```

---

### From: public/challenges.html (16 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Komunitas pelari & warga urban': 'Runners & urban residents community',
'Ikuti tantangan komunitas, dapatkan badge eksklusif, dan tetap termotivasi bersama ribuan pelari di seluruh Indonesia.': 'Join community challenges, earn exclusive badges, and stay motivated alongside thousands of runners across Indonesia.',
'Reward berupa badge digital + diskon merchandise. Tidak ada hadiah uang tunai.': 'Rewards are digital badges + merchandise discounts. No cash prizes.',
// Challenge data
'Weekly 50K Distance': 'Weekly 50K Distance',
'Tempuh total 50 km running dalam 7 hari. Cocok untuk pelari intermediate.': 'Cover 50 km of running in 7 days. Suitable for intermediate runners.',
'Minggu depan': 'Next week',
'Badge "Distance Warrior" + diskon 15% Aervinex Strap': 'Badge "Distance Warrior" + 15% discount on Aervinex Strap',
'30-Day Login Streak': '30-Day Login Streak',
'Buka dashboard tiap hari selama 30 hari berturut-turut. Bangun konsistensi monitoring kesehatan.': 'Open the dashboard every day for 30 consecutive days. Build consistency in health monitoring.',
'hari': 'days',
'30 hari berjalan': '30 days running',
'Badge "Iron Streak" + akses encyclopedia premium 1 bulan': 'Badge "Iron Streak" + 1 month premium encyclopedia access',
'Clean Air Runner': 'Clean Air Runner',
'Selesaikan 10 sesi running saat AQI <50 (udara bersih). Optimasi timing aktivitas urban.': 'Complete 10 running sessions when AQI <50 (clean air). Optimize urban activity timing.',
'sesi': 'sessions',
'14 hari': '14 days',
'Badge "Smart Timer" + voucher running shoes 100rb': 'Badge "Smart Timer" + 100k running shoes voucher',
// Card chrome
'Target': 'Target',
'Peserta': 'Participants',
'Berakhir': 'Ends',
'Progress Anda: ${p} / ${g} ${u} (${pct}%)': 'Your progress: ${p} / ${g} ${u} (${pct}%)',
'Reward:': 'Reward:',
'✓ Sudah Join': '✓ Joined',
'Join Challenge': 'Join Challenge',
'Detail': 'Details',
'Pelari': 'Runner',
'Keluar dari challenge ini?': 'Leave this challenge?',
'Halaman detail challenge akan tersedia di versi berikutnya.': 'Challenge detail page will be available in the next version.',
```

---

### From: public/subscription.html (40 strings)
```js
'Kembali': 'Back',
'Ganti tema': 'Toggle theme',
'Langganan': 'Subscription',
'Kelola plan AERVINEX Anda': 'Manage your AERVINEX plan',
'PLAN AKTIF': 'ACTIVE PLAN',
'/selamanya': '/forever',
'Tidak ada langganan aktif': 'No active subscription',
'Status': 'Status',
'Berlaku sampai': 'Valid until',
'Auto-renewal': 'Auto-renewal',
'Pilih Plan': 'Choose Plan',
'Monitoring HR, SpO₂, langkah': 'HR, SpO₂, steps monitoring',
'5 risk score harian': '5 daily risk scores',
'Alert PM2.5 & heat dasar': 'Basic PM2.5 & heat alerts',
'History 30 hari': '30-day history',
'35 risk score lengkap': '35 full risk scores',
'EPO running adaptive': 'EPO running adaptive',
'Tetap di Free': 'Stay on Free',
'/bulan': '/month',
'Semua fitur Free': 'All Free features',
'35 risk score (semua kondisi)': '35 risk scores (all conditions)',
'EPO + RPAE Running Engine': 'EPO + RPAE Running Engine',
'History 1 tahun + insight pattern': '1-year history + pattern insights',
'XAI feature attribution lengkap': 'Full XAI feature attribution',
'Priority customer support': 'Priority customer support',
'Mulai 7 Hari Gratis': 'Start 7-Day Free Trial',
'Tidak ada kartu kredit untuk trial · Auto-renew Rp': 'No credit card required for trial · Auto-renew Rp',
'setelah 7 hari': 'after 7 days',
'/bulan · 6 akun': '/month · 6 accounts',
'Semua fitur Pro × 6 akun': 'All Pro features × 6 accounts',
'Family dashboard': 'Family dashboard',
'Alert emergency cross-account': 'Cross-account emergency alerts',
'Team training plan & leaderboard': 'Team training plan & leaderboard',
'Admin & permission control': 'Admin & permission control',
'Pilih Family': 'Choose Family',
'Metode pembayaran yang didukung (via Midtrans)': 'Supported payment methods (via Midtrans)',
'Kartu Kredit': 'Credit Card',
'Transfer Bank': 'Bank Transfer',
'Batal langganan?': 'Cancel subscription?',
'Anda akan tetap dapat akses Pro/Family sampai akhir periode billing. Setelah itu otomatis turun ke Free, data Anda aman.': 'You will keep Pro/Family access until the end of the billing period. After that it automatically drops to Free, your data remains safe.',
'Batalkan Langganan': 'Cancel Subscription',
'Powered by <strong>Midtrans</strong> · Pembayaran terenkripsi PCI-DSS Level 1': 'Powered by <strong>Midtrans</strong> · Payments encrypted at PCI-DSS Level 1',
// Status states
'Free trial — sampai ${date}': 'Free trial — until ${date}',
'Aktif — berakhir ${date}': 'Active — expires ${date}',
'tidak aktif': 'inactive',
'Trial': 'Trial',
// Modal/alert
'Batalkan langganan? Akses Pro tetap aktif sampai akhir periode.': 'Cancel subscription? Pro access stays active until end of period.',
'Langganan dibatalkan. Akan tetap aktif sampai akhir periode billing.': 'Subscription cancelled. Will remain active until the end of the billing period.',
'Pembayaran gagal': 'Payment failed',
'Memuat...': 'Loading...',
'Gagal memulai pembayaran. Pastikan Cloud Function sudah deploy.': 'Failed to start payment. Make sure the Cloud Function is deployed.',
```

---

## Summary

- **Total unique strings extracted**: ~310 (across 14 files, excluding deduplicated overlaps with Cluster A/B such as `Kembali`, `Ganti tema`, `Home`, `Stats`, `Profile`, `Recovery`)
- **Community channels**: 8 channels with full name + description pairs (Pelari Jakarta, Pelari Bandung, Pelari Surabaya, Komuter Motor, Warga Urban Jakarta, Asma Support Group, Cardiac Support, Stress & Sleep)
- **AI Chat**: 4 capability cards (Polusi Udara, Training, Sleep & Stres, Penyakit), 6 suggestion chips (with label + data-prompt = 12 strings), 7 multi-paragraph local fallback responses
- **Subscription**: 3 plans (Free, Pro, Family) with full feature lists; Midtrans payment methods; trial/cancel flows
- **Hardware (device/device-pair/calibrate/live-data)**: BLE status states, calibration wizard (3 steps), sensor labels, pairing modal with REKOM/connected states
- **Recovery + Running**: voice cues (km milestones, PM2.5 warnings), HRV recommendations, RPAE zone labels (Z1–Z5 stay), session toast messages
- **AE Report**: Full adverse event taxonomy (6 event types, 4 severity levels), incident form labels
- **Challenges**: 3 dummy challenges with reward strings, join/leave actions
