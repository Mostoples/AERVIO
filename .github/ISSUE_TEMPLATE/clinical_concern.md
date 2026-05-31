---
name: Clinical Concern (HIGH PRIORITY)
about: Lapor concern medis serius (false alarm critical, missed serious event)
title: '[CLINICAL] '
labels: clinical, high-priority, needs-triage
assignees: ''
---

## ⚠️ HIGH PRIORITY TRIAGE

Issue ini akan di-review prioritas tertinggi. Untuk emergency medis nyata, **HUBUNGI 119 (PSC Kemenkes) atau ambulans terdekat dulu**, bukan submit issue.

---

## Concern Type
- [ ] False alarm critical (sistem flag heart attack/stroke padahal user sehat → ER visit tidak perlu)
- [ ] Missed serious event (user mengalami serangan tapi sistem tidak alert)
- [ ] Misleading recommendation (saran sistem membahayakan, e.g., suruh lari padahal heat illness)
- [ ] Wrong disclaimer (sistem tampil seperti claim medis, padahal seharusnya wellness)
- [ ] Privacy concern terkait data kesehatan
- [ ] Lainnya: <!-- jelaskan -->

## Apa yang Terjadi
<!-- Cerita lengkap, timeline, konteks medis -->

## Output Sistem Saat Itu
- **Risk score yang ditampilkan**: <!-- e.g., AFib 92% HIGH -->
- **Recommendation**: <!-- e.g., "Segera ke IGD" -->
- **Halaman/screen**: <!-- e.g., risk-detail.html?id=afib -->
- **Waktu kejadian**: <!-- YYYY-MM-DD HH:MM WIB -->
- **Anda lakukan apa setelah itu**: <!-- ER visit / diabaikan / konsultasi dokter -->

## Outcome Medis Aktual
<!-- Apa hasil sebenarnya? Diagnosa dokter? Hasil ECG/lab? -->

## Bukti Pendukung (Opsional)
- [ ] Screenshot risk score
- [ ] Hasil ECG/lab dari fasilitas medis
- [ ] Sensor data export (lihat profile → "Download Data Saya")

<!-- Drag-drop attachments. Hapus PII identifier (nama dokter, nomor rekam medis) -->

## Persetujuan Investigasi
- [ ] Saya bersedia tim AERVINEX kontak untuk klarifikasi via email
- [ ] Saya paham investigasi ini berdurasi 7-30 hari sesuai severity
- [ ] Saya tidak mengharapkan kompensasi finansial (project ini wellness tool open-source)
- [ ] Email kontak untuk follow-up: <!-- @aervinex.id staff only akan akses -->

## Disclaimer
AERVINEX adalah educational/wellness tool, BUKAN alat medis bersertifikasi. Output sistem tidak boleh digunakan sebagai dasar tunggal pengambilan keputusan medis. Untuk diagnosis dan treatment, selalu konsultasi dokter yang berlisensi.

Issue ini akan di-investigasi oleh tim untuk improvement model + sistem. Hasil investigasi akan di-publish (anonymized) sebagai bagian dari transparency commitment kami.

---

**Reviewer maintainer**: assign to `@clinical-triage` team, response SLA 48 jam business days.
