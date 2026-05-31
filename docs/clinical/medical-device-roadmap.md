# AERVINEX Medical Device Classification Roadmap

**Versi**: 1.0 · Strategic roadmap · 2026 → 2030
**Status saat ini**: Wellness tier (Skenario a) — lihat `kemenkes-wellness-classification.md`

---

## Stages Overview

```
[Wellness Tool]  ──→  [Alkes Class A]  ──→  [SaMD Class IIa]  ──→  [Int'l Export]
     0–6 bulan          6–24 bulan          24–48 bulan          48+ bulan
```

---

## Stage 1 — Wellness Tool Consolidation (Bulan 0–6)

### Goal
Solidify wellness positioning, hindari klaim diagnostic, kumpulkan data lapangan.

### Deliverables
- [x] Disclaimer di setiap risk page (`medical-disclaimer.js`)
- [x] First-time modal acceptance dengan log
- [x] Adverse Event reporting form
- [ ] Marketing copy audit: hindari "diagnose", "detect disease", ganti "awareness", "screening signal"
- [ ] Privacy policy update sesuai UU PDP
- [ ] User onboarding tour menekankan "bukan alat medis"

### Budget
- Internal team time saja
- Hosting + Firebase = ~Rp 2 jt/bulan
- Total: minimal cash burn

### Exit Criteria
- ≥ 5.000 active users tanpa AE major
- Hasil pilot validation Phase 1 positif (n=300)
- Funding minimum Rp 500 juta secured

---

## Stage 2 — Alkes Class A (Bulan 6–24)

### Goal
Resmi terdaftar BPOM sebagai alat kesehatan elektromedik non-steril Class A, bisa
dipasarkan ke RS sebagai monitoring tool (bukan diagnostic).

### Persyaratan Utama
- ISO 13485:2016 — Quality Management System for Medical Devices
- IEC 60601-1 — Electrical safety untuk perangkat medis
- ISO 10993 — Biocompatibility untuk material kontak kulit
- Clinical Performance Evaluation Report (CPER)
- Penanggung Jawab Teknis (PJT) di-hire — latar biomedis/electromedik
- Izin Edar Alkes via Ditjen Farmalkes (verify nomor regulasi terbaru)

### Engineering Uplift
- Firmware: certified bootloader + signed OTA
- Hardware: pcb redesign untuk lulus EMC test
- Manufacturing partner: cari ODM/OEM dengan sertifikat CPAKB
- Documentation: technical file lengkap (block diagram, schematics, risk analysis)

### Budget Estimate
| Item                                | Estimasi (Rp)      |
|-------------------------------------|--------------------|
| ISO 13485 sertifikasi               | 50–100 jt          |
| IEC 60601-1 test (lab terakreditasi) | 80–150 jt         |
| Biocompatibility test               | 20–40 jt           |
| Clinical Performance Evaluation     | 100–300 jt         |
| Izin Edar Alkes (fee + biaya admin) | 20–50 jt           |
| Konsultan regulatory (12 bulan)     | 60–120 jt          |
| PJT salary (12 bulan)               | 120–180 jt         |
| Manufacturing setup                 | 200–500 jt         |
| **Total**                           | **650 jt – 1.5 M** |

(Verify dengan konsultan — angka ini estimate berdasarkan benchmark sektor.)

### Timeline (18 bulan)
- M1–M3: Engage konsultan, hire PJT, gap assessment
- M3–M9: ISO 13485 implementation + audit
- M6–M12: Hardware redesign + EMC/safety test
- M9–M15: Clinical performance evaluation
- M15–M18: Dossier submission + BPOM review

### Exit Criteria
- Izin Edar diterbitkan
- ≥ 3 RS partner aktif menggunakan resmi
- Revenue model jelas (per-device sale atau SaaS subscription)

---

## Stage 3 — SaMD Class IIa (Bulan 24–48)

### Goal
Klasifikasi sebagai Software-as-Medical-Device kelas IIa, bisa klaim "screening
decision support" untuk dokter (mis. AFib screening).

### Persyaratan Tambahan
- IEC 62304 — Medical Device Software Lifecycle Process
- IEC 62366 — Usability Engineering for Medical Devices
- ISO 14971 — Risk Management Application
- Clinical Validation Study skala besar (n ≥ 500, IRB approved, peer-reviewed)
- Algorithm Change Protocol (untuk ML model updates pasca-approval)
- Pathway:
  - **Indonesia**: BPOM jalur SaMD (verify pedoman terbaru — sektor berkembang)
  - **US**: FDA 510(k) equivalence (predicate device: AliveCor KardiaMobile, Apple Watch AFib feature)
  - **Eropa**: CE Mark dengan MDR (Medical Device Regulation EU 2017/745) — Class IIa Notified Body

### Engineering Uplift
- ML model lock + versioning trail
- Explainability documentation (XAI-M untuk audit trail)
- Post-market surveillance: aggregate AE telemetry
- Cybersecurity: FDA premarket cybersecurity guidance

### Budget Estimate
| Item                                | Estimasi (Rp)       |
|-------------------------------------|---------------------|
| IEC 62304 compliance                | 100–200 jt          |
| Large clinical study (n=500)        | 1.5–3 M             |
| FDA 510(k) submission (jika ekspor) | 800 jt – 1.5 M      |
| CE Mark + Notified Body fees        | 1–2 M               |
| Konsultan multi-region              | 300–600 jt          |
| **Total** (Indonesia-only path)     | **2–4 M**           |
| **Total** (with US export)          | **5–8 M**           |

### Timeline (24 bulan)
- Y1: Clinical study + dossier prep
- Y2: Submission + agency review + iteration

### Exit Criteria
- Class IIa approval diterbitkan
- Publikasi clinical study di journal terindeks Scopus Q1/Q2
- Distribusi via channel medis (apotek besar, RS, marketplace alkes resmi)

---

## Stage 4 — Int'l Expansion (Bulan 48+)

### Geografi target prioritas
1. **ASEAN**: Singapore HSA, Malaysia MDA, Thailand FDA — leverage common ASEAN MD framework
2. **AS**: FDA 510(k) dengan predicate device similar
3. **Eropa**: CE Mark MDR
4. **Australia**: TGA conformity

### Strategic Considerations
- IP protection: filing patent untuk DLSFA, TEPRS, dan novel sensor fusion
- Manufacturing scale-up: dari OEM lokal ke kontrak ODM Asia regional
- Channel: distributor medis vs direct-to-consumer hybrid

---

## Risiko Strategis & Mitigasi

| Risiko                              | Probabilitas | Impact | Mitigasi                                                              |
|-------------------------------------|--------------|--------|-----------------------------------------------------------------------|
| Funding tidak tercapai              | High         | High   | Bertahap: stay wellness sampai unit economics solid                   |
| Clinical study gagal sensitivity    | Medium       | High   | Pilot dulu n=50 sebelum full n=300; iterate ML model                  |
| Regulasi berubah                    | Medium       | Medium | Engage konsultan dengan akses ke pre-publication regulatory updates   |
| Kompetitor masuk pasar Indonesia    | Medium       | Medium | Patent filing + first-mover advantage di geospatial fusion            |
| AE serius dari produk               | Low          | Critical | AE form + monitoring proaktif + insurance liability                 |
| Tim PJT/regulatory keluar           | Medium       | High   | Cross-training + retainer dengan konsultan eksternal                  |

---

## Decision Gates (per stage)

**Setiap akhir stage, evaluasi Go/No-Go**:
- Apakah unit economics positif?
- Apakah ada clinical evidence terkumpul cukup?
- Apakah team bandwidth cukup untuk stage berikutnya?
- Apakah funding tersedia + runway 18 bulan minimum?

**No-Go scenario**: pivot ke (a) B2B SaaS untuk RS sebagai monitoring software saja
(tanpa wearable produksi sendiri), atau (b) license teknologi ke vendor wearable
yang sudah punya alkes registry.

---

## Catatan Final
- Roadmap ini **strategic**, bukan deterministik. Update tiap 6 bulan.
- Asumsi cost: berdasarkan benchmark industri 2024–2026 — perlu re-verify saat eksekusi.
- Asumsi regulasi: berdasarkan framework Kemenkes/BPOM/FDA/EU MDR yang berlaku 2026 — perlu re-verify saat eksekusi.
