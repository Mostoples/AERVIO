# Sleep & Mental Cluster Research — AERVINEX

**Tanggal:** 2026-05-31 · **Target proxy:** sleep-apnea, sleep-deprivation, stress-kronik, burnout, anxiety-panic

> WebSearch/Consensus/Scholar/PubMed-MCP **diblok** di env ini. Semua verifikasi via WebFetch ke DOI/PhysioNet/UCI/arXiv/PMC kanonik. URL 404/cert-error → **diskip**, tidak dihallucinate.

---

## 1. Paper Peer-Reviewed (7 VERIFIED)

| # | Citation | DOI / PMID | n / data | Metrics | Model |
|---|---|---|---|---|---|
| P1 | Schmidt, Reiss, Duerichen, Marberger, Van Laerhoven. **Introducing WESAD.** *ICMI 2018*. | [10.1145/3242969.3242985](https://dl.acm.org/doi/10.1145/3242969.3242985) | 15 subj; chest RespiBAN (ECG+EDA+EMG+RESP+TEMP+ACC) + wrist E4 (BVP+EDA+TEMP+ACC); 3 kelas | Stress F1 0.93 (chest) / 0.87 (wrist) | RF / AdaBoost / kNN |
| P2 | Koldijk, Sappelli, Verberne, Neerincx, Kraaij. **SWELL Knowledge Work Dataset.** *ICMI 2014*. | [10.1145/2663204.2663257](https://doi.org/10.1145/2663204.2663257) | 25 subj ×3 h; computer-log + facial + Kinect + HRV + EDA; 3 kondisi (neutral/interrupt/time-pressure) | Subject-indep stress acc ~60-70 % | SVM/NB/J48 |
| P3 | Maslach & Leiter. **Understanding the burnout experience.** *World Psychiatry* 2016;15(2):103-11. | [10.1002/wps.20311](https://doi.org/10.1002/wps.20311) · [PMID 27265691](https://pubmed.ncbi.nlm.nih.gov/27265691/) · PMC4911781 | Review | Definisi MBI 3-dim (exhaustion/cynicism/inefficacy); burnout vs depresi | — |
| P4 | Kemp et al. **Slow-wave microcontinuity of EEG.** *IEEE TBME* 2000;47(9):1185-94 (paper dasar Sleep-EDF). | [10.1109/10.867928](https://doi.org/10.1109/10.867928) · dataset [10.13026/C2X676](https://doi.org/10.13026/C2X676) | 197 PSG (SC 153 + ST 44) | Benchmark sleep-staging | — |
| P5 | Supratak, Dong, Wu, Guo. **DeepSleepNet.** *IEEE TNSRE* 2017. | [arXiv 1703.04046](https://arxiv.org/abs/1703.04046) · [10.1109/TNSRE.2017.2721116](https://doi.org/10.1109/TNSRE.2017.2721116) | MASS + Sleep-EDF, single-ch EEG | MASS acc 86.2 % / macro-F1 81.7 %; Sleep-EDF 82.0 % / 76.9 % | CNN + BiLSTM |
| P6 | Kotzen, Charlton, Salabi, Amar, Landesberg, Behar. **SleepPPG-Net.** *IEEE JBHI* 2022. | [arXiv 2202.05735](https://arxiv.org/abs/2202.05735) · [10.1109/JBHI.2022.3225363](https://doi.org/10.1109/JBHI.2022.3225363) | 2,374 pts / 23,055 jam PPG (MESA+CFS) | 4-class Cohen κ = 0.75 (baseline 0.69); transfer κ=0.74 | ResNet + Temporal CNN |
| P7 | Fabius et al. **Validation of ODI in OSA workup.** *Sleep Breath* 2019;23(1):57-63. | [10.1007/s11325-018-1654-2](https://doi.org/10.1007/s11325-018-1654-2) · [PMID 29564732](https://pubmed.ncbi.nlm.nih.gov/29564732/) | 3,413 PM recordings | ODI<5 vs AHI<5: **AUC 0.996**, sens 97.7 %, spec 97.0 % | Cutoff |

**AASM Scoring Manual V3 (Feb 2023)** — [aasm.org/scoring-manual](https://aasm.org/clinical-resources/scoring-manual/), wajib pakai per 31 Des 2023. AHI severitas: <5 normal, 5-15 mild, 15-30 moderate, ≥30 severe; apnea = ≥90 % airflow ↓ ≥10 s. Default desat threshold AASM ≥3 % (4 % opsional konservatif).

**Skipped:** Z3Score paper, "Sleep-EDF benchmark official" (yang dipakai = Kemp 2000 + dataset paper), Bayes-net/HMM PPG-staging — tak ada kandidat peer-reviewed yang URL-verified.

---

## 2. GitHub Repos (6 VERIFIED)

| Repo | URL | ★ | Framework | Catatan |
|---|---|---|---|---|
| WJMatthew/WESAD | https://github.com/WJMatthew/WESAD | 108 | Jupyter/Py | Feature extraction + binary stress CV; starter baseline |
| akaraspt/deepsleepnet | https://github.com/akaraspt/deepsleepnet | 483 | TF1 / Apache-2.0 | Supratak resmi, Sleep-EDF+MASS scripts (EEG) |
| akaraspt/tinysleepnet | https://github.com/akaraspt/tinysleepnet | 172 | TF 1.13 / Apache-2.0 | DeepSleepNet ringan, CNN+RNN single-ch EEG |
| raphaelvallat/yasa | https://github.com/raphaelvallat/yasa | 558 | Python / BSD-3 | PSG toolbox: auto-staging EEG, spindle/SW/REM, hypnogram. **Tidak** untuk PPG/wrist |
| cbrnr/sleepecg | https://github.com/cbrnr/sleepecg | 137 | Python / BSD-3 | Sleep staging dari **single-lead ECG** — cocok untuk wearable port |
| neuropsychology/NeuroKit | https://github.com/neuropsychology/NeuroKit | 2.2k | Python / MIT | Full HRV (`nk.hrv()`: SDNN, RMSSD, LF/HF, SampEn) + ECG/PPG/EDA. **Wajib untuk pipeline feature AERVINEX** |

Supporting: [Aura-healthcare/hrv-analysis](https://github.com/Aura-healthcare/hrv-analysis) (449★, GPL-3, Task-Force-1996 compliant — validasi silang HRV).

Gap: **tidak ada repo PPG-sleep-staging open yang star-banyak**. SleepPPG-Net code belum publik — kesempatan novelty untuk AERVINEX.

---

## 3. Datasets Terbuka (5 VERIFIED)

| Dataset | URL | n | Signals | Lisensi |
|---|---|---|---|---|
| WESAD | [UCI 465](https://archive.ics.uci.edu/dataset/465/wesad+wearable+stress+and+affect+detection) · [Uni-Siegen mirror](https://ubi29.informatik.uni-siegen.de/usi/data_wesad.html) | 15 | chest+wrist multimodal, 3 kelas | Non-commercial scientific |
| Sleep-EDF Expanded | https://physionet.org/content/sleep-edfx/1.0.0/ | 197 PSG | EEG Fpz-Cz+Pz-Oz, EOG, EMG; R&K stages | ODC-BY-1.0 |
| Apnea-ECG DB | https://physionet.org/content/apnea-ecg/1.0.0/ | 70 rec (35/35), 7-10 h ea, 100 Hz | Single-lead ECG + per-minute apnea anno; 8 rec respiration | PhysioNet open |
| SWELL-KW (HRV) | [Kaggle](https://www.kaggle.com/datasets/qiriro/swell-heart-rate-variability-hrv) · paper [10.1145/2663204.2663257](https://doi.org/10.1145/2663204.2663257) | 25 | computer-log + facial + Kinect + HRV + EDA | Lihat paper |
| MESA Sleep (NSRR) | https://sleepdata.org/datasets/mesa | ~2 000 PSG | PSG + 7-day actigraphy + SpO2 + ECG, multietnik | DUA — registration + IRB |

**Skipped:** DREAMER (cert-error, tidak bisa diverifikasi tanpa risiko); **Kemenkes Indonesia open sleep dataset tidak ada** yang ditemukan publik — lebih realistis training di WESAD/SWELL/MESA lalu fine-tune lokal via `consent.html`.

---

## 4. Feature Engineering — 14 features konkret

**Sleep apnea** (acc 79 / F1 84 / AUC 0.87 → target ↑)
1. **ODI-3 %** events/jam saat tidur — cutoff <5 → AHI<5 AUC 0.996 (Fabius 2019).
2. **ODI-4 %** sensor-noise-robust, ensemble dgn ODI-3.
3. **HRV irregularity** SDNN window 5 min selama estimated-sleep (low-motion + supine).
4. **Pulse-rate spike events** = PR jump >5 bpm dalam 30 s post-desat (proxy auto-arousal).
5. **BMI + neck circumference** (input `profile.html`) → STOP-BANG-like.

**Sleep deprivation** (F1 66 → ↑)
6. **TST rolling 7-day** dari hypnogram aktivitas/HR-drop.
7. **Sleep onset latency** = waktu in-bed → first stable N2 cluster.
8. **Sleep efficiency** = TST/TIB ×100 % (target ≥85 % young, ≥80 % umum).
9. **WASO** = total menit awake post-onset.
10. **Proxy N3 %** dari HRV ULF/VLF power + low-motion epoch.

**Stress/burnout/anxiety-panic** (F1 57/62/71 → ↑)
11. **LF/HF circadian slope** = regresi LF/HF rasio per jam 24 h; flat = autonomic dysregulation kronik.
12. **HRV trend 14-day RMSSD z-score** vs baseline personal (signature burnout, konsisten Maslach 2016 + Koldijk SWELL).
13. **Activity WoW decline** = step-count + active-min week-over-week; drop >20 % = behavioral proxy.
14. **PSS-10 self-report** (di `assessment.html`) → semi-supervised refiner.

Temporal aggregation: window 24 h / 7-day / 14-day → gradient boosting (export tree → JSON inference di `health-engine.js`).

---

## 5. Arsitektur Target — Realistic JS Port

**Sleep apnea:** **XGBoost ringan** (≤100 trees, depth ≤4) atas feature window (ODI-3/4, HRV-SDNN, PR-spike, BMI, neck). LSTM atas SpO2 time-series secara teori lebih ekspresif tapi tak sebanding bobotnya di browser — Fabius menunjukkan ODI cutoff sendiri AUC 0.996. **Pilih XGBoost JSON inference + rule-based fallback (ODI-3 ≥5 → pre-screen).**

**Sleep deprivation:** **Aturan + LightGBM kecil** (~50 trees). Fitur TST/SE/WASO sudah punya threshold klinis baku (SE<80 %, TST<6 h ×3 hari). Interpretable + portable; kontribusi fitur disurfacekan di `risk-detail.html`.

**Burnout + stress kronik + anxiety-panic:** **Rule-based hierarchical fusion + classifier kecil**, bukan end-to-end DL. Alasan: ground-truth burnout butuh MBI klinis, bukan label sintetis. Lapisan:
- L1 (sinyal): LF/HF circadian + RMSSD 14-day trend + activity WoW;
- L2 (self-report): PSS-10/assessment;
- L3 (fusion): weighted-sum (admin-configurable) ATAU GBM 30-trees subject-independent dilatih di SWELL/WESAD + transfer;
- XAI per-feature konsisten dengan struktur `xai.js`.

**Anxiety-panic acute event detector** (terpisah dari burnout kronik): HR>100 + RMSSD turun >40 % + ACC rendah ≥3 min + non-exercise context → rule-based, low-latency.

**Multi-modal fusion:** feature-level di JS (HRV+sleep-stage+activity sebagai vektor scalar) → ensemble per-kondisi. Hindari late-fusion neural di browser.

---

## Sumber Verified

1. [WESAD ICMI'18](https://dl.acm.org/doi/10.1145/3242969.3242985) · 2. [WESAD UCI](https://archive.ics.uci.edu/dataset/465/wesad+wearable+stress+and+affect+detection) · 3. [WESAD Uni-Siegen](https://ubi29.informatik.uni-siegen.de/usi/data_wesad.html) · 4. [SWELL-KW Kaggle](https://www.kaggle.com/datasets/qiriro/swell-heart-rate-variability-hrv) · 5. [Maslach Leiter 2016 PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4911781/) · 6. [DeepSleepNet arXiv](https://arxiv.org/abs/1703.04046) · 7. [SleepPPG-Net arXiv](https://arxiv.org/abs/2202.05735) · 8. [Fabius ODI PMID](https://pubmed.ncbi.nlm.nih.gov/29564732/) · 9. [Sleep-EDF PhysioNet](https://physionet.org/content/sleep-edfx/1.0.0/) · 10. [Apnea-ECG PhysioNet](https://physionet.org/content/apnea-ecg/1.0.0/) · 11. [MESA NSRR](https://sleepdata.org/datasets/mesa) · 12. [AASM Manual V3](https://aasm.org/clinical-resources/scoring-manual/) · 13. [YASA](https://github.com/raphaelvallat/yasa) · 14. [DeepSleepNet repo](https://github.com/akaraspt/deepsleepnet) · 15. [TinySleepNet](https://github.com/akaraspt/tinysleepnet) · 16. [WESAD repo](https://github.com/WJMatthew/WESAD) · 17. [SleepECG](https://github.com/cbrnr/sleepecg) · 18. [NeuroKit2](https://github.com/neuropsychology/NeuroKit) · 19. [hrv-analysis](https://github.com/Aura-healthcare/hrv-analysis)

---

## Caveat

- AASM V3 isinya berbayar — rule 3 % vs 4 % desat hanya di manual. Default AERVINEX: **ODI-3 %** (sensitif, AASM-recommended sejak 2012), tampilkan ODI-4 % konservatif.
- **SleepPPG-Net repo tidak publik** — port arsitektur (ResNet + Temporal CNN) sendiri dari paper, atau pakai XGBoost feature-engineered dulu.
- Kemenkes/Indonesia open-sleep tidak ditemukan; pakai consent.html untuk akuisisi lokal.
- Burnout F1 57-62 % realistis tanpa MBI ground-truth. Framing sebagai **risk score kontinu + XAI**, bukan klasifikasi diskrit. Jangan over-fit label sintetis.
- SleepPPG-Net κ=0.75 < PSG-EEG (~0.80-0.85) → treat stage dari PPG sebagai *proxy*; tonjolkan trend, bukan absolut per-epoch.
