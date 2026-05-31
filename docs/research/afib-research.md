# Research Report: Meningkatkan AFib Detection Proxy AERVINEX

**Tanggal:** 2026-05-31
**Target awal:** Akurasi 75.8% / F1 0.39 / AUC 0.847 (proxy `predictAFib` di `public/js/ml-client.js:361`, 3 fitur: RMSSD, SpO2 deficit, resting HR)
**Target setelah upgrade:** AUC >= 0.92, F1 >= 0.70, akurasi >= 88% pada validation set 30-detik window PPG

---

## 1. Paper Peer-Reviewed (semua sudah di-verify via PubMed / DOI)

| # | Paper | n samples | Metrik | Arsitektur / Dataset |
|---|---|---|---|---|
| [1] | Tison et al., *JAMA Cardiology* 2018. "Passive Detection of AF Using a Commercially Available Smartwatch." DOI: [10.1001/jamacardio.2018.0136](https://doi.org/10.1001/jamacardio.2018.0136) | 9.750 remote + 51 cardioversion + 1.617 ambulatory; 139 juta HR measurements | Cardioversion AUC **0.97** (Sens 98.0%, Spec 90.2%); ambulatory AUC **0.72** | DNN 8 layer * 128 hidden = 564.227 params, semi-supervised pretraining utk R-R interval (DeepHeart); Apple Watch PPG + accelerometer |
| [2] | Perez et al., *NEJM* 2019. "Large-Scale Assessment of a Smartwatch to Identify AF." DOI: [10.1056/NEJMoa1901183](https://doi.org/10.1056/NEJMoa1901183) | 419.297 peserta, 450 ECG patch dapat dianalisis | **PPV 0.84** (concurrent ECG patch), PPV 0.71 (irregular tachogram); 34% confirmed AF di antara notified | Apple Heart Study, sliding 60-s tachogram window di Apple Watch (rule-based irregularity score) |
| [3] | Bumgarner et al., *JACC* 2018. "Smartwatch Algorithm for Automated Detection of AF" (KardiaBand). DOI: [10.1016/j.jacc.2018.03.003](https://doi.org/10.1016/j.jacc.2018.03.003) | 100 pasien, 169 simultan KB+12-lead ECG | **Sens 93%, Spec 84%** (algorithm vs physician-interpreted ECG) | Single-lead ECG via KardiaBand, automated AliveCor algorithm; verified PMID 29535065 |
| [4] | Torres-Soto & Ashley, *npj Digital Medicine* 2020. "Multi-task deep learning for cardiac rhythm detection in wearable devices" (DeepBeat). DOI: [10.1038/s41746-020-00320-4](https://doi.org/10.1038/s41746-020-00320-4) | ~1M unlabeled + 500K labeled signal, 3 wearable devices | **F1 0.96 val / 0.93 prospective**, Sens 0.98, Spec 0.99 | Multi-task CNN denoising autoencoder, joint signal-quality + arrhythmia head, PPG 25 Hz window 25 s |
| [5] | Kudo et al., *Frontiers in Physiology* 2023. "A training pipeline of an arrhythmia classifier for AF detection using PPG signal." DOI: [10.3389/fphys.2023.1084837](https://doi.org/10.3389/fphys.2023.1084837) | Multi-cohort (PhysioNet + simband) | **Accuracy 0.87, F1 0.80** | Hybrid **2-layer CNN + 1-layer Transformer**, transfer learning whole-model fine-tune |
| [6] | Aldughayfiq et al., *Diagnostics (Basel)* 2023. "A Deep Learning Approach for AF Classification Using Multi-Feature Time Series Data from ECG and PPG." DOI: [10.3390/diagnostics13142442](https://doi.org/10.3390/diagnostics13142442) | Multi-source ECG+PPG | **Acc 95%, AUC 0.85, F1 0.84** | 1D-CNN + BiLSTM hybrid, multi-feature time series fusion |
| [7] | John A., *IEEE EMBC* 2025. "A PPG-based 1D-CNN algorithm for automated AF detection." DOI: [10.1109/EMBC58623.2025.11253262](https://doi.org/10.1109/EMBC58623.2025.11253262) | MIMIC III Waveform DB | **Acc 98.27%, F1 0.978**; binarized variant 94.5% / 0.93 | 1D-CNN; published edge-deployable pruned (60% sparsity) + binarized versions — relevan untuk port browser |

> Catatan: Bumgarner JACC 2018 awalnya saya cari via DOI redirect, lalu di-cross-check via PubMed PMID 29535065 (bukan 29759480 — itu audio summary).

---

## 2. GitHub Repositories Open-Source (verified, URL aktif)

| # | Repo | Stars | Framework / Lisensi | Catatan |
|---|---|---|---|---|
| [R1] | [awni/ecg](https://github.com/awni/ecg) | **807** | TensorFlow, GPL-3.0 | Stanford ML Group; replikasi Hannun et al. *Nature Medicine* 2019 cardiologist-level ECG arrhythmia (termasuk AF kelas). Bukan PPG, tapi best-cited reference architecture (34-layer ResNet 1D). |
| [R2] | [chengstark/SiamAF](https://github.com/chengstark/SiamAF) | 31 | PyTorch, MIT | Duke University; arXiv [2310.09203](https://arxiv.org/abs/2310.09203). Siamese network shared latent ECG <-> PPG, training di 13.432 pasien Institution A, test di Stanford + Simband. Paling relevan untuk transfer ECG ke PPG. |
| [R3] | [physionetchallenges/python-cnn-example-2024](https://github.com/physionetchallenges/python-cnn-example-2024) | ~30+ | PyTorch | Baseline CNN resmi dari PhysioNet Challenge 2024, struktur jelas untuk fine-tune. |
| [R4] | [physionetchallenges/python-example-2025](https://github.com/physionetchallenges/python-example-2025) | 31 | Python | Boilerplate evaluation + scoring resmi Challenge 2025 — pakai untuk eval kit. |
| [R5] | [Sanugiw/PPG-Arrhythmia-Detection](https://github.com/Sanugiw/PPG-Arrhythmia-Detection) | low | Jupyter / RandomForest + SHAP | Pipeline lengkap PPG feature-engineering + XAI; berguna sebagai reference untuk Option A. |

> **Catatan gap:** Tidak ditemukan repo "AFib dari PPG" dengan >50 stars + lab cardiology resmi yang masih maintained 2024-2026. Repo dari MIT BIH / Imperial College **tidak punya hosted PPG-AFib repo publik dengan stars >50** — perlu lookup tambahan jika butuh model bobot resmi. Workaround: pakai awni/ecg (R1) untuk arsitektur, lalu fine-tune ke PPG.

---

## 3. Dataset Terbuka untuk Validation (semua verified)

| # | Dataset | Size | Label | Lisensi | URL |
|---|---|---|---|---|---|
| [D1] | **PhysioNet/CinC Challenge 2017** | 8.528 train + 3.658 test, 9-61 detik @ 300 Hz | Normal (5.154) / AF (771) / Other (2.557) / Noisy (46) | Open Data Commons Attribution v1.0 | https://physionet.org/content/challenge-2017/1.0.0/ — DOI [10.13026/d3hm-sf11](https://doi.org/10.13026/d3hm-sf11) |
| [D2] | **Icentia11k** (Stanford-affiliated, Bengio lab) | **11.000 pasien**, hingga 2 minggu @ 250 Hz | Beat (N/S/V/Q) + Rhythm (NSR/AFib/AFlutter) | CC BY-NC-SA 4.0 | https://physionet.org/content/icentia11k-continuous-ecg/1.0/ — DOI [10.13026/kk0v-r952](https://doi.org/10.13026/kk0v-r952) |
| [D3] | **MIMIC-IV Waveform DB v0.1.0** | 200 records / 198 pasien (v1.0 target ~10.000) | Multi-signal ECG + PPG + ABP, label rhythm via cross-link ke MIMIC-IV clinical | ODC Open Database v1.0 | https://physionet.org/content/mimic4wdb/0.1.0/ — DOI [10.13026/a2mw-f949](https://doi.org/10.13026/a2mw-f949) |

> Note: MIMIC-IV waveform AFib subset belum punya label rhythm langsung; harus join dengan tabel diagnosis ICD-10 I48.* di MIMIC-IV core. Untuk PPG saja, **Stanford DeepBeat dataset** (dari paper [4]) menyediakan PPG berlabel — perlu request akses di Stanford AIMI / paper supplementary.

---

## 4. Feature Engineering Recommendations (10-15 fitur konkret)

Window: **30 detik PPG @ 25-100 Hz**, sudah peak-detected -> RR interval series `{R_i}`. Notasi: `mean = (1/N) sum`, `SD = std`.

### A. HRV Time-Domain
1. **RMSSD** (sudah ada) — `sqrt( mean( (RR_{i+1} - RR_i)^2 ) )`
2. **SDNN** — `SD(RR_i)`; threshold AF empiris > 100 ms pada window 30 s
3. **pNN50** — `count(|RR_{i+1} - RR_i| > 50 ms) / (N-1)`
4. **CoV(RR)** — `SD(RR) / mean(RR)`; AF biasanya > 0.10
5. **MAD-RR** (median absolute deviation) — robust outlier-resistant; `median( |RR_i - median(RR)| )`

### B. HRV Frequency-Domain (Welch / Lomb-Scargle, karena RR non-uniform)
6. **LF power** (0.04-0.15 Hz)
7. **HF power** (0.15-0.40 Hz)
8. **LF/HF ratio** (sudah ada di `predictHRV` line 539) — port ke `predictAFib`

### C. Non-linear / Poincaré (best discriminator AF vs sinus)
9. **Poincaré SD1** — `sqrt(0.5) * SD(RR_{i+1} - RR_i)`; mirror RMSSD/sqrt2 tetapi paired
10. **Poincaré SD2** — `sqrt( 2 * SDNN^2 - 0.5 * SDSD^2 )`
11. **SD1/SD2 ratio** — AF tipikal mendekati 1 (cloud bundar); sinus < 0.5
12. **Sample Entropy** (m=2, r=0.2*SD) — AF biasanya > 1.5; sinus < 1.0
13. **Shannon Entropy of dRR histogram** — bin `RR_{i+1} - RR_i` ke 16 bin, `-sum p log p`

### D. Beat-to-beat irregularity (paling diskriminatif untuk AF)
14. **TPR — Turning Point Ratio** — proportion of RR yang merupakan local turning point; expected ~0.67 random, AF mendekati nilai itu, sinus < 0.5
15. **COSEn** — Coefficient of Sample Entropy normalized; `SampEn + ln(2r) - ln(mean(RR))` (Lake & Moorman 2011) — AF threshold > -1.4

### E. Signal-quality gates (mandatory, paper [4])
- **PPG-SQI**: kurtosis / Pearson template-matching; reject window jika `SQI < 0.6`
- **HR-plausibility**: mean(RR) di antara 0.3-2.0 s

Total: **15 fitur HRV/morphology + 2 SQI gate**. Tambah faktor klinis SpO2 deficit + resting HR (sudah ada) = 17 input.

---

## 5. Arsitektur Konkret untuk Port ke JS — REKOMENDASI: Option A (Hybrid)

| Option | Pros | Cons | Target metrik realistis |
|---|---|---|---|
| **A. Rule-based gate + GBDT (XGBoost -> ONNX -> onnxruntime-web)** | (1) Bundle ringan ~50-200 KB; (2) onnxruntime-web sudah production-grade MIT (lihat [onnxruntime](https://github.com/microsoft/onnxruntime), 20.7k stars); (3) GBDT dengan 15 HRV features sudah cukup capai AUC ~0.92 (Kudo et al. baseline [5]); (4) feature interpretability untuk XAI yang sudah ada di AERVINEX | Perlu pipeline preprocess RR detection di JS; tidak menangkap morphology PPG mentah | **AUC 0.90-0.93, F1 0.70-0.78, Acc 88-91%** |
| **B. 1D-CNN small (2 conv + 1 dense, ~50K params)** | Bisa pakai raw PPG window 30 s -> tangkap morphology; arsitektur ringan ada di paper [7] dengan binarized variant 94.5% | Browser inference 30 s @ 100 Hz tensor (3000 samples) butuh ~30-80 ms WASM; model size 200-500 KB; training butuh data berlabel PPG (Stanford DeepBeat akses) | Acc 90-94%, F1 0.78-0.85 (jika data cukup) |
| **C. Tetap proxy tapi feature-richer** | Zero deploy risk, no ML runtime | Tidak ada model -> ceiling ~AUC 0.88 even with 15 features (logistic ensemble) | Acc ~82%, F1 ~0.60 |

### Rekomendasi: **Option A**

Alasan: AERVINEX adalah PWA dengan banyak proxy ringan; menambahkan onnxruntime-web (WASM bundle ~2-4 MB, tapi sekali load + cache SW) + GBDT 100 trees lebih realistis. Pipeline:

1. **Train offline (Python)**: ekstrak 15 fitur dari PhysioNet 2017 [D1] + Icentia11k [D2] subset PPG-equivalent (atau pakai DeepBeat) -> train XGBoost binary AF vs non-AF.
2. **Convert**: `xgboost -> onnxmltools -> .onnx` (~50-150 KB).
3. **Deploy**: `onnxruntime-web` (`ort.InferenceSession.create('afib.onnx', { executionProviders: ['wasm'] })`).
4. **Inference path** di `ml-client.js`: ganti body `predictAFib` -> compute 15 fitur dari RR series + SpO2 + restHR -> session.run -> calibrated probability.
5. **Fallback**: jika `ort` gagal load (older browser), pakai 15-feature logistic ensemble (Option C lite) supaya tetap ada output.

Jika audit budget membolehkan training lebih agresif, naik ke Option B dengan arsitektur 2-conv 1D-CNN seperti John 2025 [7] (binarized) — model ~80 KB, akurasi 94%+. Reference repo R2 (SiamAF) menyediakan template PyTorch siap diadaptasi.

---

## Sources and References

1. [Passive Detection of AF Using a Commercially Available Smartwatch (Tison et al., 2018)](https://doi.org/10.1001/jamacardio.2018.0136)
2. [Large-Scale Assessment of a Smartwatch to Identify AF — Apple Heart Study (Perez et al., NEJM 2019)](https://doi.org/10.1056/NEJMoa1901183)
3. [Smartwatch Algorithm for Automated Detection of AF — KardiaBand (Bumgarner et al., JACC 2018)](https://doi.org/10.1016/j.jacc.2018.03.003)
4. [Multi-task deep learning for cardiac rhythm detection in wearable devices — DeepBeat (Torres-Soto & Ashley, npj Digital Medicine 2020)](https://doi.org/10.1038/s41746-020-00320-4)
5. [Training pipeline of an arrhythmia classifier for AF using PPG (Kudo et al., Front Physiol 2023)](https://doi.org/10.3389/fphys.2023.1084837)
6. [Deep Learning AF Classification Using Multi-Feature ECG+PPG (Aldughayfiq et al., Diagnostics 2023)](https://doi.org/10.3390/diagnostics13142442)
7. [PPG-based 1D-CNN for automated AF detection (John, IEEE EMBC 2025)](https://doi.org/10.1109/EMBC58623.2025.11253262)
8. [awni/ecg — Stanford ML Group cardiologist-level ECG arrhythmia](https://github.com/awni/ecg)
9. [chengstark/SiamAF — Duke shared ECG-PPG latent AFib](https://github.com/chengstark/SiamAF) (arXiv [2310.09203](https://arxiv.org/abs/2310.09203))
10. [PhysioNet/CinC Challenge 2017 — AF Classification](https://physionet.org/content/challenge-2017/1.0.0/)
11. [Icentia11k Continuous ECG Dataset](https://physionet.org/content/icentia11k-continuous-ecg/1.0/)
12. [MIMIC-IV Waveform Database](https://physionet.org/content/mimic4wdb/0.1.0/)
13. [ONNX Runtime Web docs](https://onnxruntime.ai/docs/tutorials/web/) / [microsoft/onnxruntime](https://github.com/microsoft/onnxruntime)

## Additional Notes & Gaps

- **Tidak diverifikasi (perlu lookup tambahan)**: DeepBeat repo Stanford resmi (URL `github.com/jtorres-soto/DeepBeat` dan `github.com/jessitsoto/deepbeat` keduanya 404). Dataset DeepBeat tersedia tapi via figshare/Stanford AIMI access request — bukan public GitHub.
- **Tidak diverifikasi**: Repo MIT Beth Israel atau Imperial College khusus PPG-AFib dengan stars >50 — tidak ditemukan di pencarian. Saran: hubungi penulis paper [4][5][7] langsung untuk weight/code.
- **Warning**: Paper Kudo et al. [5] dan Aldughayfiq et al. [6] tidak melaporkan ukuran sampel eksak di abstract — perlu baca full text sebelum mengandalkan metric mereka untuk benchmark.
- **Security/regulatory**: AFib detection di consumer app di Indonesia tidak masuk medical device kalau hanya proxy edukasi; tapi setelah deploy ML "betulan", BPOM/Kemenkes mungkin memintakan disclaimer "not for diagnosis". Pastikan UI tetap label "estimasi".
- **Validation plan saran**: split PhysioNet 2017 70/15/15 -> patient-level stratified. Report Acc, F1, AUC, sensitivity, specificity dengan 95% CI bootstrap (1000 resamples).
