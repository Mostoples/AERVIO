# Outline Pitch Deck — Hospital Partnership

**Audience**: RSCM (RS Cipto Mangunkusumo), RSPI Sulianti Saroso, RSUP Fatmawati,
RS Persahabatan, atau RS pendidikan lain dengan unit kardiologi / respirologi /
emergensi yang riset-active.

**Tujuan**: Menjadikan rumah sakit partner sebagai (a) site untuk Phase 1 validation
study, (b) co-author publikasi, (c) reference customer untuk Phase 2 alkes.

**Format target**: 12–15 slide, 20 menit presentasi + 10 menit Q&A.

---

## Slide-by-Slide Outline

### Slide 1 — Title / Hook
- Judul: **"From Detection to Action: Wearable AI untuk Validasi Klinis di Populasi Tropis"**
- Tagline: "AERVINEX × [Nama RS] — Riset, Validasi, Publikasi Bersama"
- Logo AERVINEX + space untuk logo RS partner
- Tanggal + presenter

### Slide 2 — The Problem
- **3 statistik shock**:
  - PM2.5 Jakarta rata-rata 35–55 μg/m³ vs WHO 5 μg/m³ (700–1100% over)
  - Penyakit kardiovaskular #1 penyebab kematian (SKI 2018)
  - Heat-related illness underdiagnosed di Indonesia (komuter motor, outdoor labor)
- "Wearable consumer di Indonesia divalidasi di populasi Kaukasian — gap signifikan untuk pasien Asia Tenggara"

### Slide 3 — AERVINEX Overview
- Smartwatch + ML + edge sensor fusion
- 6 sensor onboard: PPG, BME280, SDS011, GUVA UV, skin temp, battery
- 13 fitur novelty akademis (TEPRS, DLSFA, AARC, dll)
- 35 health conditions classified
- ML accuracy 86% di internal benchmark
- 33 peer-reviewed papers referenced

### Slide 4 — Why Now (Market Timing)
- Wearable adoption Indonesia tumbuh ~30% YoY
- Kemenkes mendukung digital health (mengikuti tren ASEAN)
- Telemedicine pasca-COVID tinggi — kontinuum data wearable + telekonsul
- LPDP / hibah riset Kemendikbud mendukung penelitian terapan

### Slide 5 — Validation Study Proposal (Phase 1)
- **Studi**: AERVINEX-VAL Phase 1 (lihat IRB protocol full)
- **Design**: Prospective observational, n=300, 90 hari
- **Primary endpoint**: AFib sensitivity vs 12-lead ECG
- **Secondary**: Respiratory cluster vs spirometry, TEPRS vs subjective heat strain
- **Site count target**: 2–3 RS (RSCM + Surabaya site + opsi 3rd)

### Slide 6 — Apa Yang Kami Tawarkan ke RS Partner
- ✅ **Wearable gratis** untuk semua staff + students (≥ 100 unit per site selama studi)
- ✅ **EKG/spirometri/lab darah gratis** untuk peserta studi di RS partner
- ✅ **Co-authorship** di publikasi primer & sekunder (journal Q1/Q2 target)
- ✅ **Data analytics dashboard** untuk pelajari pola partisipan (anonymized)
- ✅ **CME credit** untuk dokter yang involved sebagai investigator
- ✅ **Subscription gratis** akses platform AERVINEX selama 3 tahun pasca-studi

### Slide 7 — Apa Yang Kami Butuhkan dari RS Partner
- 🤝 IRB facilitation — co-submission dengan IRB RS partner
- 🤝 Akses ruang klinik untuk visit D0/D45/D90 (1.5 jam per partisipan)
- 🤝 Clinician evaluator (blinded) — 1 kardiolog + 1 paru per site
- 🤝 Recruitment access — outpatient cardiac/respiratory clinic
- 🤝 Use of EKG/spirometri equipment RS (atau kami bawa portable)
- 🤝 IT integration ringan untuk import data ke sistem RS bila relevan

### Slide 8 — Timeline Partnership
- Bulan 0–2: MoU + IRB submission
- Bulan 2–3: Site setup, staff training, soft launch
- Bulan 3–9: Rolling recruitment + data collection
- Bulan 9–12: Follow-up + database lock
- Bulan 12–15: Joint analysis
- Bulan 15–18: Manuscript drafting + submission
- **Total**: 18 bulan dari MoU sampai publikasi

### Slide 9 — Publication Strategy
- **Primary paper**: validation clinical study → JMIR mHealth uHealth atau npj Digital Medicine
- **Secondary paper**: methodology paper (DLSFA + ONNX deployment) → IEEE TBME atau Sensors
- **Tertiary paper**: case series unik (kontribusi RS partner)
- Semua dengan author list yang fair (RS clinician investigator tinggi)

### Slide 10 — Data Privacy & Security
- UU 27/2022 (UU PDP) compliant
- Firebase Firestore enterprise: encryption at rest + TLS 1.3
- Per-uid Firestore rules
- Audit trail untuk akses peneliti
- IRB-approved bridge file (study ID ↔ identitas)
- Right to be forgotten guaranteed
- Data retention: 10 tahun (sesuai standar arsip riset Indonesia)

### Slide 11 — Team & Track Record
- PI AERVINEX: mahasiswa S1 riset health tech + sport science
- Pembimbing skripsi: [Nama Pembimbing]
- ML / Data Science: track record [list publikasi/competition]
- Hardware Engineering: ESP32 firmware sudah mature (firmware/aervinex-sensor)
- Co-investigators target: 1 kardiolog + 1 paru per site

### Slide 12 — Beyond Phase 1
- **Phase 2**: alkes Class A registration → wearable jadi resmi monitoring tool RS
- **Phase 3**: SaMD Class IIa → decision support untuk dokter
- RS partner = early-adopter customer di Phase 2 dengan diskon signifikan
- Potensi joint patent untuk metodologi unik dari kontribusi RS partner

### Slide 13 — Risk Mitigation
- AE reporting form sudah implementasi
- DSMB (Data Safety Monitoring Board) akan dibentuk dengan 3 anggota independen
- Insurance liability untuk partisipan studi
- Disclaimer kuat: AERVINEX bukan pengganti dokter

### Slide 14 — Ask
- "Bersediakah [Nama RS] menjadi site partner Phase 1?"
- "Apa langkah next dari sisi RS untuk MoU + IRB submission?"
- Kontak person + timeline follow-up

### Slide 15 — Appendix (untuk Q&A)
- Detailed Statistical Analysis Plan
- Sample CRF (Case Report Form)
- Sample informed consent (Bahasa Indonesia)
- Budget breakdown
- Reference papers list (33 verified)

---

## Catatan Persiapan Sebelum Pitch

### Pre-Pitch Research
- Cari tahu publikasi terbaru RS target di sektor digital health / wearable / cardiology
- Identifikasi 1–2 dokter senior yang menjadi key advocate potensial
- Pelajari struktur IRB RS target + waktu typical approval
- Cek apakah RS target sedang ikut grant LPDP / hibah Kemendikbud — bisa joint funding

### Pitch Logistics
- Minta meeting 60 menit dengan Direktur Penelitian / Wakil Direktur Layanan + Kepala Unit Klinis
- Bawa demo unit AERVINEX physical kalau ada — visceral lebih powerful dari slide
- Live demo aplikasi (`/dashboard.html` dengan data sim atau real)
- Cetak protocol + consent form versi singkat (4 halaman ringkas)

### Soft Asks (avoid hard asks at first meeting)
- "Apakah ada kepala unit yang mau brainstorming dengan kami selama 30 menit lebih lanjut?"
- "Apa concern utama dari sisi RS untuk model kerjasama seperti ini?"
- "Adakah riset paralel di RS yang bisa kami sinergikan?"

### Hard Asks (untuk meeting follow-up)
- MoU
- IRB co-submission
- Resource commitment (ruang + clinician time)
- Timeline commitment

---

## Template Email Initial Outreach

```
Subjek: Proposal Kerjasama Validasi Wearable Health Monitoring — AERVINEX × [Nama RS]

Yth. Bapak/Ibu [Nama],

Perkenalkan, saya [Nama] dari tim AERVINEX — wearable smartwatch berbasis ML
yang dikembangkan sebagai implementasi skripsi di [Universitas]. AERVINEX
sudah mencapai kematangan internal (firmware ESP32 + aplikasi web + 13 fitur
novelty akademis) dan kami sedang mempersiapkan validation study Phase 1.

Kami ingin mengeksplorasi kemungkinan kerjasama dengan [Nama RS] sebagai
site partner dalam studi prospektif observasional (n=300, 90 hari) untuk
validasi sensitivitas AERVINEX AFib screening vs 12-lead ECG.

Apakah Bapak/Ibu bersedia menjadwalkan meeting singkat (45 menit) untuk
kami presentasikan proposal lengkap? Kami siap bertemu di lokasi RS,
sesuai jadwal yang nyaman.

Terlampir: 1-pager executive summary.

Hormat saya,
[Nama Lengkap]
[Posisi]
[Email] · [WhatsApp]
[Link demo: aervinex.web.app]
```

---

## Catatan Final

- **Outreach realistic**: jangan ekspektasi MoU di meeting pertama. Cycle 3–6 bulan typical untuk RS partnership.
- **Multi-site fallback**: kalau RSCM tidak respon, paralelkan ke RSPI / Fatmawati / RS swasta dengan unit riset (mis. Siloam, Mayapada Tahir).
- **Budget allocation untuk partnership facilitator**: kadang RS punya komite kerjasama yang minta facilitator/agen — verify policy RS target.
