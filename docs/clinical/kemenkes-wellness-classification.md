# Analisis Klasifikasi Regulasi AERVINEX — Kemenkes / BPOM

**Versi**: 1.0 · Draft analisis · Bukan saran hukum
**Catatan penting**: Dokumen ini hasil analisis berdasarkan pemahaman umum regulasi
alat kesehatan Indonesia. **Verifikasi spesifik nomor regulasi & nomor izin harus
dilakukan dengan konsultan regulatory affairs / praktisi BPOM aktual** sebelum
keputusan komersial atau klaim regulatori dibuat.

---

## 1. Tiga Skenario Klasifikasi

### Skenario (a) — Consumer Wellness App (No regulation)
**Klasifikasi**: Aplikasi kesehatan konsumer, bukan alat kesehatan.

**Karakteristik**:
- Tidak ada klaim diagnosis spesifik.
- Output dibatasi pada metrik "wellness" (skor lifestyle, awareness, tracking).
- Tidak menggantikan keputusan klinis profesional.
- Bahasa marketing mengindari kata "diagnose", "treat", "cure", "prevent disease".

**Implikasi**:
- Tidak memerlukan izin edar alkes BPOM.
- Tidak masuk regulasi PerMenkes alat kesehatan elektromedik.
- Tetap tunduk pada UU PDP (data pribadi) dan UU ITE (jika ada data sensitif).
- **Disclaimer wajib**: "Wellness tool, bukan alat medis."

**Cocok untuk**: AERVINEX di Phase 1 (saat ini) — sebagai wearable lifestyle dengan
data awareness, tanpa klaim diagnostic AFib/asma/dll.

**Risiko**: jika user dirugikan karena salah interpretasi data (mis. ER visit tidak perlu),
liability tetap ada via UU Perlindungan Konsumen. Mitigasi: disclaimer kuat + accept
acknowledgment + Adverse Event reporting form.

---

### Skenario (b) — Class A Alat Kesehatan Elektromedik Non-Steril (BPOM)
**Klasifikasi**: Alat kesehatan kategori risiko rendah (Class A), elektromedik non-steril,
membutuhkan izin edar dari Direktorat Jenderal Kefarmasian dan Alat Kesehatan (Ditjen Farmalkes)
di bawah Kementerian Kesehatan / BPOM.

**Karakteristik**:
- Mengukur parameter fisiologis (HR, SpO₂, suhu) dengan klaim akurasi.
- Tidak melakukan diagnosis otomatis, tapi data digunakan oleh dokter untuk monitoring.
- Mirip dengan oximeter consumer atau smartwatch yang advertise SpO₂ medical-grade.

**Persyaratan umum** (verify exact rules with regulatory consultant):
- Permohonan Izin Edar Alkes ke Ditjen Farmalkes.
- Sertifikat ISO 13485 (Quality Management System untuk medical devices).
- Sertifikat IEC 60601-1 (electrical safety alkes).
- Uji klinis terbatas / clinical performance evaluation report.
- Sertifikat CPAKB (Cara Pembuatan Alat Kesehatan yang Baik) jika diproduksi lokal.
- Penunjukan Penanggung Jawab Teknis (PJT) dengan latar belakang teknik biomedis.

**Implikasi**:
- Biaya: pendekatan biaya umum **Rp 50–250 juta** untuk pengurusan izin + testing
  (verify dengan konsultan).
- Waktu: 6–18 bulan.
- Bisa klaim "alat ukur fisiologis" tapi belum bisa klaim "alat diagnostik".

**Cocok untuk**: AERVINEX di Phase 2 (setelah Phase 1 validation study selesai), ketika
ada partner RS yang ingin pakai resmi.

---

### Skenario (c) — Software as Medical Device (SaMD) Class IIa
**Klasifikasi**: Software-as-Medical-Device kelas IIa (moderate risk), jika ada klaim
diagnosis atau decision support yang mempengaruhi keputusan klinis.

**Karakteristik**:
- ML output spesifik (mis. "Anda berisiko AFib") dipakai sebagai dasar tindakan medis.
- AI-based diagnostic.
- Sesuai IMDRF (International Medical Device Regulators Forum) SaMD framework, jika
  output adalah "drives clinical management" → IIa atau lebih tinggi.

**Persyaratan umum** (verify with regulatory consultant):
- Semua persyaratan Class A + Class B.
- IEC 62304 (Medical Device Software Lifecycle).
- IEC 62366 (Usability Engineering).
- ISO 14971 (Risk Management).
- Clinical validation study skala besar (n ≥ 500) dengan IRB approval.
- Post-market surveillance plan.
- Pathway potensial: **FDA 510(k) equivalence** (jika ekspor ke US) atau
  **BPOM jalur IVD/SaMD** (verify nomor regulasi terbaru).
- Untuk Indonesia: ada jalur khusus alkes berbasis software yang masih berkembang —
  perlu cek ke Ditjen Farmalkes apakah ada pedoman terbaru (verify).

**Implikasi**:
- Biaya: **Rp 500 juta – 2 miliar** total (clinical study + dossier + sertifikasi)
  (verify dengan konsultan).
- Waktu: 2–4 tahun.
- Bisa klaim "diagnostic tool" / "decision support" untuk dokter.

**Cocok untuk**: AERVINEX di Phase 3+ (setelah ada hasil clinical study sukses, partner
rumah sakit besar, dan funding besar).

---

## 2. Rekomendasi: Stay Wellness Tier Dulu

### Phase 1 (saat ini → 6 bulan ke depan): **Skenario (a) — Wellness App**
**Rationale**:
- Belum ada clinical validation skala besar — klaim diagnostic akan over-claim.
- Cost of regulatory dossier ≫ revenue potensial di stage ini.
- Disclaimer + first-time accept modal + AE reporting form sudah implementasi
  (`public/js/medical-disclaimer.js`, `public/ae-report.html`).

**Action items**:
- [x] Disclaimer di setiap risk page (auto-inject).
- [x] First-time modal acceptance.
- [x] AE report form.
- [ ] Update bahasa marketing: hindari kata "diagnose", "deteksi penyakit",
  ganti dengan "screening awareness", "lifestyle indicator", "wellness signal".
- [ ] Privacy policy update sesuai UU PDP.

### Phase 2 (6–18 bulan, setelah Phase 1 validation): **Skenario (b) — Alkes Class A**
**Trigger**:
- Selesai pilot validation (n=300, target 18 bulan).
- Mendapat partner RS yang ingin pakai resmi.
- Funding tersedia (LPDP / hibah riset).

**Action items**:
- Engage regulatory consultant (verify konsultan terdaftar di BPOM).
- Persiapan ISO 13485 (1–2 tahun untuk implementasi QMS).
- Engineering uplift firmware ke standar IEC 60601.

### Phase 3 (3–5 tahun): **Skenario (c) — SaMD Class IIa**
**Trigger**:
- Hasil clinical validation positif terpublikasi (peer-reviewed).
- Partnership dengan RS besar atau distributor alkes.
- Strategic decision: stay Indonesia-only atau ekspor (US/ASEAN).

---

## 3. Specific AERVINEX Risk Areas — Mitigasi Sekarang

| Risk Area                          | Mitigasi (Phase 1)                                              |
|------------------------------------|-----------------------------------------------------------------|
| Klaim "deteksi AFib"               | Ganti ke "screening awareness HR irregularity"                  |
| Klaim "deteksi asma"               | Ganti ke "respiratory wellness score"                           |
| Klaim "deteksi heatstroke"         | Ganti ke "heat exposure awareness"                              |
| Severity badge "Critical"          | Tambah teks "konsultasi dokter / 119 jika gejala"               |
| ML output ditampilkan tanpa context| Tambah XAI explanation + disclaimer                             |
| Data dikirim ke cloud              | Konsen eksplisit + opsi self-hosted untuk peneliti              |

---

## 4. Pertanyaan untuk Konsultan Regulatory (Action: schedule meeting)

1. Apa pedoman terbaru Ditjen Farmalkes untuk alkes berbasis software (SaMD) di Indonesia?
2. Apakah ada jalur fast-track untuk wearable consumer yang berkembang ke alkes?
3. Berapa biaya estimate Izin Edar Alkes Class A spesifik untuk wearable seperti AERVINEX?
4. Apakah Surat Keterangan Lulus Uji dari Balai/Lab terakreditasi cukup, atau perlu
   uji di lab BPOM?
5. Untuk klaim "screening awareness" non-diagnostik — apakah masih masuk wellness atau
   sudah masuk alkes Class A?
6. Apakah disclaimer "wellness tool, bukan alat medis" cukup proteksi hukum saat ini?
7. Bagaimana cara migrasi dari wellness (Skenario a) ke alkes (Skenario b) tanpa
   re-design produk dari nol?
8. Adakah pedoman GCP / IRB / clinical validation Indonesia spesifik untuk wearable?

**Catatan**: Kontak yang relevan untuk eksplorasi: Asosiasi Pengusaha Alat Kesehatan
Indonesia (Aspaki), atau konsultan regulatory dengan track record approval alkes
elektromedik (cari via networking, bukan dari list internet generik).

---

## 5. Disclaimers in Final Document

Dokumen ini:
- **Bukan saran hukum.** Untuk keputusan komersial, konsultasi dengan praktisi hukum
  yang spesialis regulasi farmasi & alat kesehatan.
- **Berdasarkan pemahaman umum regulasi yang berlaku saat dokumen ditulis (2026)**.
  Regulasi BPOM/Kemenkes sering berubah — verify saat akan submit.
- **Tidak menyebut nomor regulasi spesifik** kecuali yang sudah confirmed dengan
  sumber primer. Kalau ada nomor di dokumen ini, perlu re-verify sebelum dikutip
  resmi.
- **AERVINEX tetap dianggap wellness tool** sampai keputusan resmi tim untuk migrasi
  ke alkes (Skenario b atau c).
