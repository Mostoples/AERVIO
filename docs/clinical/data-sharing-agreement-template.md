# Data Sharing Agreement (DSA) — Template

**Antara**: AERVINEX Research (selanjutnya disebut "AERVINEX") dan
**[Nama Institusi Partner]** (selanjutnya disebut "PARTNER").

**Versi**: 1.0 · Template draft · 2026
**Catatan**: Template ini adalah skeleton legal. Sebelum tanda tangan, dokumen harus
diserahkan ke kuasa hukum institusi untuk review dan disesuaikan dengan konteks.

---

## 1. Tujuan Perjanjian

Perjanjian ini mengatur:
- Pertukaran data wearable, klinis, dan riset antara AERVINEX dan PARTNER dalam
  rangka kolaborasi penelitian.
- Hak penggunaan, kerahasiaan, dan publikasi.
- Pembagian kekayaan intelektual yang dihasilkan.

---

## 2. Definisi

- **Data Mentah (Raw Data)**: sensor stream, video, audio, lab result, EHR yang
  belum di-anonymisasi.
- **Data Anonim (Anonymized Data)**: data dengan identitas personal dihilangkan,
  tidak dapat di-link kembali ke individu.
- **Data Agregat (Aggregated Data)**: data statistik populasi tanpa baris individual.
- **Hasil Penelitian (Research Outputs)**: paper, code, dataset publikasi, paten,
  produk turunan.

---

## 3. Lingkup Data yang Di-share

### 3.1 AERVINEX ke PARTNER
- Sensor stream wearable (PPG, env, motion) — Data Anonim
- ML model output (TEPRS, AFib score, dll) — Data Anonim
- Aggregated dashboard untuk site PARTNER

### 3.2 PARTNER ke AERVINEX
- 12-lead ECG reading (de-identified)
- Spirometry result (de-identified)
- Lab darah (de-identified)
- Diagnosis dokter (untuk validation ground truth) — de-identified

### 3.3 Bridge File
- Mapping study_id ↔ identitas pasien disimpan oleh PARTNER (sebagai data controller
  primary), tidak di-share ke AERVINEX kecuali untuk audit dengan persetujuan IRB.

---

## 4. Standard Privasi & Keamanan

### 4.1 Compliance
- UU 27/2022 — Pelindungan Data Pribadi (UU PDP) Indonesia
- WHO research ethics for digital health
- IRB approval dari kedua belah pihak

### 4.2 Technical Safeguards
- Encryption at rest: AES-256 minimum
- Encryption in transit: TLS 1.3 minimum
- Access control: role-based dengan 2FA wajib
- Audit log: semua akses ter-log dengan retention 5 tahun
- Backup: encrypted, off-site, retention 10 tahun

### 4.3 Insider Risk Mitigation
- Setiap staff dengan akses data harus tanda tangan NDA individu.
- Akses revoke segera saat staff keluar dari project.

---

## 5. Penggunaan Data

### 5.1 Lingkup Penggunaan
Data yang di-share **HANYA** dipakai untuk:
- (a) Tujuan penelitian sesuai protocol IRB approved
- (b) Analisis untuk publikasi joint
- (c) Internal QA / debugging dengan tetap menjaga privacy

### 5.2 Larangan
Data **TIDAK boleh** dipakai untuk:
- ❌ Komersialisasi langsung tanpa amandemen perjanjian
- ❌ Dijual atau di-license ke pihak ketiga
- ❌ Training model komersial selain AERVINEX (kecuali eksplisit disetujui)
- ❌ Marketing tanpa konsen ulang
- ❌ Identifikasi individu (re-identification)

---

## 6. Kekayaan Intelektual (Intellectual Property)

### 6.1 Background IP
- IP yang sudah dimiliki masing-masing pihak sebelum perjanjian (mis. AERVINEX
  firmware, RS clinical protocols) tetap milik pihak masing-masing.

### 6.2 Foreground IP (dihasilkan selama kerjasama)
- **Joint inventions**: hak bersama, dengan share default 50/50 kecuali ada
  kontribusi material yang jelas berbeda.
- **AERVINEX-only contribution**: tetap milik AERVINEX.
- **PARTNER-only contribution**: tetap milik PARTNER.

### 6.3 Komersialisasi
- Apabila Foreground IP dikomersialisasi, royalty disepakati di amandemen
  terpisah (typical 30–50% net revenue untuk creator partner setelah cost recovery).

---

## 7. Publikasi & Diseminasi

### 7.1 Hak Publikasi
- Kedua pihak berhak co-publish hasil joint study.
- Author list ditentukan berdasarkan ICMJE authorship criteria.
- Corresponding author: PI yang paling banyak kontribusi (default).

### 7.2 Review Sebelum Publikasi
- Draft manuscript di-circulate ke kedua pihak minimal 30 hari sebelum submission.
- Hak veto **terbatas**: hanya untuk masalah factual error, IP leakage, atau
  privacy breach — bukan untuk content disagreement.

### 7.3 Pre-prints
- Boleh upload ke bioRxiv / arXiv / medRxiv setelah kedua pihak review draft final.

---

## 8. Durasi & Terminasi

### 8.1 Durasi
Perjanjian berlaku **3 tahun** sejak tanggal tanda tangan, dengan opsi perpanjangan
2 tahun melalui amandemen tertulis.

### 8.2 Terminasi
- **Material breach**: pihak yang dirugikan boleh terminate setelah notice 30 hari
  dan periode cure tidak terpenuhi.
- **Convenience**: salah satu pihak boleh terminate dengan notice 90 hari, tapi
  obligasi data privacy dan publication review tetap berlaku.
- **Force majeure**: bencana, pandemi, regulasi memaksa terminate — diatur fair.

### 8.3 Pasca Terminasi
- Data yang sudah di-aggregate atau dipublikasi: tetap di public domain.
- Raw data yang belum dipakai: dihapus dari sistem penerima dalam 90 hari.
- Bridge file: PARTNER tetap simpan untuk archival riset (10 tahun).

---

## 9. Confidentiality

- Informasi non-publik (manuscript draft, business plan, internal data) bersifat
  rahasia selama 5 tahun setelah terminasi.
- Pengecualian: informasi yang sudah publik bukan karena pihak ini, sudah dimiliki
  sebelumnya, atau diperoleh dari pihak ketiga yang berhak.

---

## 10. Liability & Indemnification

### 10.1 Limited Liability
Liability masing-masing pihak dibatasi pada (a) damages aktual yang dapat dibuktikan,
(b) tidak melebihi total value perjanjian (mis. nilai grant atau fee), kecuali untuk
gross negligence atau willful misconduct.

### 10.2 Indemnification
Setiap pihak meng-indemnify pihak lain untuk klaim yang muncul dari pelanggaran
kewajiban dari pihak tersebut (mis. data breach karena pihak A → A indemnify B).

### 10.3 Pengecualian
Liability untuk death / personal injury karena negligence **tidak dibatasi** sesuai
hukum yang berlaku.

---

## 11. Dispute Resolution

- **Step 1**: Negosiasi langsung dengan good faith selama 60 hari.
- **Step 2**: Mediasi dengan mediator yang disepakati bersama.
- **Step 3**: Arbitrase di Badan Arbitrase Nasional Indonesia (BANI), tempat Jakarta,
  bahasa Indonesia (dengan terjemahan English jika diperlukan).

---

## 12. Hukum yang Berlaku
- Hukum Indonesia berlaku untuk perjanjian ini.
- Yurisdiksi: pengadilan negeri Jakarta Pusat (jika arbitrasi gagal).

---

## 13. Pemberitahuan (Notices)
Notice resmi dikirim ke alamat masing-masing pihak yang tercantum di lampiran A,
melalui surat tercatat + email konfirmasi.

---

## 14. Amandemen
Hanya melalui dokumen tertulis bertanda tangan kedua pihak.

---

## 15. Lampiran (Schedule)
- Lampiran A: Kontak resmi & alamat
- Lampiran B: Detail data fields yang di-share
- Lampiran C: Diagram alur data + storage location
- Lampiran D: IRB approval documents kedua belah pihak

---

## Tanda Tangan

| Pihak                 | Nama                | Posisi                  | Tanda Tangan | Tgl       |
|-----------------------|---------------------|-------------------------|--------------|-----------|
| AERVINEX              | [Nama PI]           | Principal Investigator  | ____________ | ________  |
| PARTNER               | [Nama Direktur]     | Direktur Penelitian     | ____________ | ________  |
| Saksi (AERVINEX)      | [Nama]              | [Posisi]                | ____________ | ________  |
| Saksi (PARTNER)       | [Nama]              | [Posisi]                | ____________ | ________  |

---

## Disclaimer Template

Dokumen ini adalah **template skeleton, bukan dokumen hukum siap pakai**. Sebelum
tanda tangan:
1. Review oleh kuasa hukum / legal counsel kedua belah pihak.
2. Sesuaikan dengan konteks spesifik project + budget + IP yang relevan.
3. Disesuaikan dengan persyaratan unit Komite Etik / Hukum institusi PARTNER.
4. Filing administrasi internal sesuai aturan institusi.
