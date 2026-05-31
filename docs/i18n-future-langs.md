# AERVINEX i18n — Roadmap Bahasa Daerah Berikutnya

Setelah Jawa (`jv`) dan Sunda (`su`) shipped, expansion direncanakan
mengikuti urutan **populasi penutur, kompleksitas script, dan
sponsor availability**.

## Priority Tier

### Tier 1 — Q1 2027 (target)
1. **Bahasa Minangkabau** (`min`)
2. **Bahasa Bali** (`ban`)

### Tier 2 — Q3 2027
3. **Batak Toba** (`bbc`)
4. **Batak Karo** (`btx`)

### Tier 3 — kemudian
5. **Batak Mandailing** (`btm`)
6. **Bahasa Madura** (`mad`)
7. **Bahasa Bugis** (`bug`)
8. **Bahasa Makassar** (`mak`)

---

## Per-language Requirements

### 1. Bahasa Minangkabau (`min`)

- **Penutur**: ~6 juta (Sumatra Barat, Riau, perantauan).
- **Native reviewer**: 1 dari Padang/Bukittinggi + 1 dari Riau coastal
  (akomodasi dialek perantauan).
- **Script**: Latin (sama dengan ID). Tidak butuh font khusus.
- **Register**: Bahasa Minang **lebih egaliter** dari Jawa/Sunda —
  tidak ada undak-usuk halus formal. Pakai bentuk **alus/sopan**
  untuk alert, **bahasa pasar** terhindari.
- **Minimum coverage**: 80 key sesuai template `i18n-jv.js`.
- **Catatan dialek**: Padang Kota vs Pariaman vs Solok berbeda
  diction — pakai **Bahasa Minang Baku ("bahaso baku")** sebagai
  default.
- **Kosakata kunci**:
  - selamat datang → **"silakan datang"** / **"taimo"**
  - saya → **"ambo"** / **"awak"**
  - anda → **"kau"** (kasar di Sunda, netral di Minang) atau **"sanak"**
  - tidak → **"indak"**

### 2. Bahasa Bali (`ban`)

- **Penutur**: ~3.3 juta (Bali, Lombok bagian utara).
- **Native reviewer**: 1 dari Denpasar urban + 1 dari Karangasem
  (rural traditional).
- **Script**: Latin default. **Aksara Bali (Hanacaraka Bali)**
  opsional untuk splash/dekoratif — butuh font `Noto Sans Balinese`
  + special rendering test (browser support partial).
- **Register**: Bali punya **basa alus / madia / kasar** mirip Jawa.
  Default untuk app: **basa alus**. Audience target adalah
  upper-mid demografi yang mengharapkan formality.
- **Minimum coverage**: 80 key + 20 key khusus istilah upacara
  (terkait wellness traditional).
- **Kosakata kunci**:
  - selamat datang → **"om swastiastu"** (greeting) / **"sugra rauh"** (alus)
  - saya → **"titiang"** (alus) / **"tiang"** (lumayan halus)
  - anda → **"ida"** (super alus, untuk Brahmana) / **"jero"**
  - tidak → **"nenten"** (alus) / **"sing"**
- **Special**: Bali punya kalender saka — date formatting bisa
  toggle masehi/saka di future version.

### 3. Batak Toba (`bbc`)

- **Penutur**: ~2 juta.
- **Native reviewer**: 1 dari Sumatra Utara (Toba/Tarutung).
- **Script**: Latin default. **Aksara Batak (Surat Batak Toba)**
  ada Unicode plane tapi adoption rendah di UI — skip dulu.
- **Register**: Batak Toba relatif egaliter, ada bentuk **somba**
  (hormat ke yang lebih tua) tapi tidak undak-usuk seketat Jawa.
- **Kosakata kunci**:
  - selamat datang → **"horas"** (greeting standar)
  - saya → **"ahu"** / **"au"**
  - anda → **"ho"** (sebaya) / **"amang/inang"** (hormat)
  - tidak → **"ndang"**

### 4. Batak Karo (`btx`)

- **Penutur**: ~600 ribu.
- **Native reviewer**: 1 dari Karo (Brastagi/Kabanjahe).
- **Catatan**: Karo berbeda signifikan dari Toba — TIDAK boleh
  re-use dictionary Toba. Greetings:
  - "mejuah-juah" (Karo) vs "horas" (Toba)
- **Minimum coverage**: 80 key.

### 5. Batak Mandailing (`btm`)

- **Penutur**: ~1.1 juta (Tapanuli Selatan, Sumut).
- **Native reviewer**: 1 dari Padang Sidempuan.
- **Greeting standar**: **"horas tondi madingin"** atau **"horas"**.
- Mirip Toba secara struktural — extension Toba dictionary OK,
  tapi minimal 30 key wajib diverifikasi berbeda.

---

## Common Requirements (all languages)

### Process
1. **Sponsor / funding** untuk reviewer native (Rp 500k-1jt per bahasa,
   one-time + maintenance).
2. **PR template** khusus bahasa: include reviewer credit di CONTRIBUTORS.md.
3. **QA test pages**: di setiap rilis, tampilkan halaman target
   (`dashboard.html`, `running.html`, `risk-detail.html`) pakai
   bahasa baru → screenshot review.

### File structure (template)
```
public/js/i18n-min.js   # Minang
public/js/i18n-ban.js   # Bali
public/js/i18n-bbc.js   # Batak Toba
public/js/i18n-btx.js   # Batak Karo
public/js/i18n-btm.js   # Mandailing
```

Setiap file pakai pattern yang sama dengan `i18n-jv.js`:
- IIFE wrapper
- guard `if (!window.AervinexI18n) return`
- panggil `AervinexI18n.registerLang(code, dict, label)`
- minimum 80 key, flagged uncertain dengan `// ?` / `// ⚠`

### Script / font handling
| Bahasa | Script | Font default | Special render? |
|---|---|---|---|
| Minang | Latin | system | tidak |
| Bali | Latin (+ optional Aksara Bali) | system + Noto Sans Balinese | hanya splash |
| Batak Toba/Karo/Mandailing | Latin | system | tidak |
| Madura | Latin (+ Aksara Madura legacy) | system | tidak |
| Bugis/Makassar | Latin (+ Lontara) | system + Noto Sans Buginese | hanya splash |

### Lontara / Aksara Bali special handling
- Jika user pilih bahasa dengan native script optional:
  - Default: render Latin transliterasi.
  - Toggle "Aksara asli" di Settings → reload font asynchronously.
  - Font subset: hanya glyph yang dipakai dictionary (lazy load
    untuk hemat bandwidth).

### Acceptance criteria per language
- [ ] 80 key minimum diterjemahkan
- [ ] Tidak ada `[needs native speaker review]` tersisa di production
- [ ] Native reviewer credit di `CONTRIBUTORS.md`
- [ ] QA screenshot 3 halaman utama di-attach di PR
- [ ] Lighthouse accessibility score tidak turun (i18n switching tidak break ARIA)

---

## Out-of-scope (intentional)

- **Bahasa Aceh, Tetun, Papua (Melayu Papua)**: penutur kecil + akses
  reviewer sulit. Defer indefinitely.
- **Bahasa Tionghoa-Indonesia (Hokkien Medan, dll)**: code-mix high,
  tidak ada bentuk standar tertulis. Tidak feasible.
- **Cross-script (Arab Pegon, Jawi)**: niche academic, low ROI.
