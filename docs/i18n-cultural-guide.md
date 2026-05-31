# AERVINEX i18n — Cultural Adaptation Guide

Panduan **tone, style, dan visual cues** untuk localization AERVINEX
ke bahasa daerah Indonesia. Bertujuan menjaga konsistensi register
(formal vs informal) dan menghindari false-friendly translation
yang merusak trust di domain kesehatan.

> **Prinsip dasar:** AERVINEX adalah aplikasi *health monitoring*.
> Tone wajib menyiratkan **kehati-hatian klinis**, bukan playful.
> Salah satu kegagalan localization paling umum di healthtech adalah
> menggunakan register terlalu kasual untuk komunitas yang
> mengharapkan formal/krama.

---

## 1. Bahasa Jawa (`jv` — Krama)

### Register
- **Default: Krama (halus / formal)** — bukan ngoko.
- Alasan: alert kesehatan, terms & conditions, dan diagnosis
  panel harus terasa "diucapkan dokter ke pasien", bukan
  "teman ke teman".
- **Ngoko alus diperbolehkan** untuk tooltip casual (greeting,
  toast success).
- **Hindari ngoko kasar** sepenuhnya — kasar di kontext UI
  kesehatan sangat ofensif untuk audience Jawa Tengah/Yogyakarta.

### Kosakata kunci (review utama)
| Indonesia | Krama (preferensi) | Catatan |
|---|---|---|
| selamat datang | sugeng rawuh | klasik, formal |
| anda | panjenengan | krama tinggi |
| saya | kula | krama |
| tidak | mboten | krama |
| sudah | sampun | krama |
| sehat | saras / sehat | "saras" lebih halus |
| sakit | gerah / sakit | "gerah" krama, "sakit" netral |
| jantung | jantung / atinipun | klinis pakai "jantung" |
| darah | rah | krama |

### Variasi regional Jawa
- **Jawa Tengah (Solo, Yogyakarta)**: Krama Solo-Yogya — paling
  konservatif. Kami target di sini.
- **Jawa Timur (Surabaya, Malang)**: Ngoko Suroboyoan lebih
  diterima. Bila membuka pasar Jatim, sediakan toggle "Jawa
  (Suroboyoan)" terpisah.
- **Banyumasan (Banyumas, Purwokerto)**: dialek "ngapak" —
  TIDAK bisa di-cover dengan satu dictionary Krama. Rekomendasi:
  variant terpisah jika user demand > 5% dari Banyumas.

### Visual
- **Warna**: hijau (sehat) + emas/kuning krem (formalitas Keraton).
- **Hindari**: merah terlalu mencolok — di context formal Jawa,
  merah saturasi tinggi terasa "agresif". Pakai merah Bata (#A0392E).
- **Tipografi**: serif modern (Source Serif Pro) untuk header
  klinis lebih cocok dari sans-serif.
- **Aksara Jawa (hanacaraka)**: TIDAK dipakai di UI default,
  hanya splash/header dekoratif opsional. Font: Noto Sans Javanese.

---

## 2. Bahasa Sunda (`su` — Lemes)

### Register
- **Default: Lemes (basa hormat / undak-usuk halus)** —
  setara dengan Krama Jawa.
- Audience inti: Bandung, Bogor, Sumedang, Tasikmalaya.
- **Loma (akrab)** diperbolehkan untuk tooltip casual,
  jangan di alert.
- **Kasar (basa cohag)** dilarang keras di UI.

### Kosakata kunci
| Indonesia | Lemes | Catatan |
|---|---|---|
| selamat datang | wilujeng sumping | klasik, paling tepat |
| anda | anjeun | lemes |
| saya | abdi | lemes |
| tidak | henteu / teu | "henteu" lemes formal |
| sudah | parantos | lemes |
| punya | gaduh | lemes |
| lihat | tingali | lemes |
| sehat | damang / séhat | "damang" sangat halus |
| jantung | jajantung | lemes |

### Variasi regional Sunda
- **Priangan (Bandung, Garut, Sumedang)**: Sunda lemes klasik.
  Target utama kami.
- **Banten (Serang, Lebak)**: dialek lebih dekat ke loma,
  beberapa kosakata berbeda (mis. "kuring" bukan "abdi").
- **Cirebon**: bahasa Cirebonan campur Jawa-Sunda — terlalu hybrid,
  TIDAK direkomendasikan dicover.

### Visual
- **Warna**: hijau-kuning (alam Sunda agraris), motif batik megamendung
  diperbolehkan sebagai accent dekoratif.
- **Aksara Sunda Kuna (Buhun)**: TIDAK dipakai default; opsional
  splash. Font: Noto Sans Sundanese.

---

## 3. Cross-cutting recommendations

### Number formatting
- ID/JV/SU sama-sama pakai **titik untuk ribuan, koma untuk desimal**:
  `1.234,56` bukan `1,234.56`.
- Unit metric (kg, km, °C) — bahasa daerah tidak mengubah unit.

### Time / date
- ID: `12 Juni 2026, 14:30`
- JV: `12 Juni 2026, jam 14:30` atau `tabuh 14:30` (krama: "tabuh")
- SU: `12 Juni 2026, tabuh 14:30` (sama tradisi)

### Health term policy
- **Istilah medis (mis. "atrial fibrilation", "hipertensi")**:
  jangan diterjemahkan ke bahasa daerah. Pertahankan
  bilingual: istilah klinis Indonesia/Inggris + glossary
  daerah di tooltip.
- Alasan: keamanan klinis — terjemahan kosa kata medis
  yang tidak presisi bisa berbahaya.

### Toast / alert intensity
| Severity | ID | JV | SU |
|---|---|---|---|
| info | "Info" | "Pawartos" | "Pawartos" |
| warning | "Peringatan" | "Pèngatos" | "Bewara" |
| danger | "Bahaya" | "Bebaya" | "Bahaya" |

### Audio / TTS
- Untuk feature voice-over di future versions, pastikan engine
  TTS mendukung kode bahasa: `jv-ID`, `su-ID`.
  Google Cloud TTS sudah support — Azure dan AWS belum penuh.

---

## 4. Workflow review native speaker

1. **Translator native Krama** untuk `i18n-jv.js` — minimal 2 reviewer
   independen (Solo + Yogya). Bayar/credit di CONTRIBUTORS.md.
2. **Translator native Lemes** untuk `i18n-su.js` — minimal 1 reviewer
   Priangan + 1 reviewer kontemporer Bandung urban.
3. Saat ada perubahan terjemahan, **flag uncertain entries** dulu di
   PR (regex search: `// \?` atau `// ⚠` di `i18n-{jv,su}.js`).
4. Setelah review tuntas, hapus tanda uncertainty.

---

## 5. Don'ts (pitfalls umum)

- **Don't** Google Translate bahasa daerah — hasilnya seringkali
  campur dialek atau salah register.
- **Don't** pakai ngoko/loma di alert klinis — tone-deaf.
- **Don't** force aksara native script untuk seluruh UI — adoption
  rendah, accessibility issue.
- **Don't** asumsikan satu "bahasa Jawa" — minimum cover 3 variant
  (Mataraman Krama, Suroboyoan, Banyumasan) jika serius.
- **Don't** localize istilah medis tanpa konsultasi tenaga kesehatan
  bilingual.
