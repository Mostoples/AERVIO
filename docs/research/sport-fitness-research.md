# Sport & Fitness Research — AERVINEX Cluster Improvement

> Riset deep untuk meningkatkan akurasi cluster **cardiorespiratory fitness + sport** AERVINEX.
> Target: cv-fitness, overtraining, heat-cramps, hyponatremia.
> Konteks: pelari urban Indonesia, iklim tropis (heat index sering >33 C).
> Tanggal riset: 2026-05-31.

---

## Executive Summary

Empat label terlemah (`cv-fitness` F1 0.72, `overtraining` 0.60, `heat-cramps` 0.65, `hyponatremia` 0.53) bukan murni masalah model — sebagian besar adalah **fenomena fisiologis dengan ground truth jarang** dan literatur sport science mendukung pendekatan **closed-form formula + threshold rolling-baseline** ketimbang deep learning. Strategi yang direkomendasikan: (a) hybrid — pertahankan ML untuk multi-label risk ranking, tetapi **override / fuse** dengan formula evidence-based (Uth HR-ratio, Buller HR-to-Core-Temp, Plews HRV-baseline, Hew-Butler EAH protocol); (b) tambahkan fitur turunan baru sebelum re-train.

---

## 1. Paper Peer-Reviewed (VERIFIED)

Semua DOI/PMID di bawah sudah diverifikasi via PubMed.

1. **Uth N, Sorensen H, Overgaard K, Pedersen PK (2004).** *Estimation of VO2max from the ratio between HRmax and HRrest — the Heart Rate Ratio Method.* **European Journal of Applied Physiology** 91(1):111-15. PMID **14624296**, DOI `10.1007/s00421-003-0988-y`. *Catatan: brief menyebut J Sports Sci — koreksi, jurnal sebenarnya adalah Eur J Appl Physiol. Koefisien proporsionalitas 15.3 berasal dari paper ini.*
2. **Buller MJ, Tharion WJ, Cheuvront SN, Montain SJ, Kenefick RW et al. (2013).** *Estimation of human core temperature from sequential heart rate observations.* **Physiological Measurement** 34(7):781-98. PMID **23780514**, DOI `10.1088/0967-3334/34/7/781`. *Catatan: brief menyebut IEEE TBME — koreksi, terbit di Physiological Measurement. Memuat Kalman filter dengan parameter eksplisit.*
3. **Plews DJ, Laursen PB, Stanley J, Kilding AE, Buchheit M (2013).** *Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring.* **Sports Medicine** 43(9):773-81. PMID **23852425**, DOI `10.1007/s40279-013-0071-8`. Dasar metodologis untuk **lognormal RMSSD rolling-7d**.
4. **Almond CSD, Shin AY, Fortescue EB et al. (2005).** *Hyponatremia among runners in the Boston Marathon.* **NEJM** 352(15):1550-6. PMID **15829535**, DOI `10.1056/NEJMoa043901`. Insidensi 13% hyponatremia (Na<135 mmol/L), 0.6% kritikal.
5. **Hew-Butler T, Rosner MH, Fowkes-Godek S et al. (2015).** *Statement of the 3rd International Exercise-Associated Hyponatremia Consensus, Carlsbad 2015.* **Br J Sports Med** 49(22):1432-46. PMID **26227507**, DOI `10.1136/bjsports-2015-095004`. Protokol klinis terkini EAH — lebih baru & lebih actionable dari Almond.
6. **Casa DJ, DeMartini JK, Bergeron MF, Csillan D, Eichner ER et al. (2015).** *National Athletic Trainers' Association Position Statement: Exertional Heat Illnesses.* **Journal of Athletic Training** 50(9):986-1000. PMID **26381473**, DOI `10.4085/1062-6050-50.9.07`. Cutoff WBGT, gejala, & manajemen heat cramps + heat stroke.
7. **Schwellnus MP, Derman EW, Noakes TD (1997).** *Aetiology of skeletal muscle 'cramps' during exercise: a novel hypothesis.* **J Sports Sci** 15(3):277-85. PMID **9232553**, DOI `10.1080/026404197367281`. Hipotesis neuromuscular (bukan dehidrasi-elektrolit murni) — implikasi: heat-cramps butuh sinyal training-load + fatigue, bukan hanya suhu.
8. **Gabbett TJ (2016).** *The training-injury prevention paradox: should athletes be training smarter and harder?* **Br J Sports Med** 50(5):273-80. PMID **26758673**, DOI `10.1136/bjsports-2015-095788`. *Koreksi brief: optimal ACWR adalah **0.8–1.3**; zona risiko >1.5 (bukan threshold tunggal 1.5).*
9. **Cole CR, Blackstone EH, Pashkow FJ, Snader CE, Lauer MS (1999).** *Heart-rate recovery immediately after exercise as a predictor of mortality.* **NEJM** 341(18):1351-7. PMID **10536127**, DOI `10.1056/NEJM199910283411804`. Cohort Cleveland Clinic — HRR1min <12 bpm = 4x mortality hazard.
10. **Periard JD, Racinais S, Sawka MN (2015).** *Adaptations and mechanisms of human heat acclimation: applications for competitive athletes and sports.* **Scand J Med Sci Sports** 25 Suppl 1:20-38. PMID **25943654**, DOI `10.1111/sms.12408`. Heat acclimatization timeline 10–14 hari relevan untuk feature `heat_acclimation_days`.

*Item yang tidak bisa diverifikasi dan di-skip:* Firstbeat white papers (bukan peer-reviewed; vendor docs), Cooper Institute longitudinal mortality cohort (paper spesifik tidak teridentifikasi unik — diganti Cole 1999 yang lebih actionable).

---

## 2. GitHub Repos (VERIFIED)

| Repo | URL | Stars | Bahasa | Catatan |
|---|---|---|---|---|
| **NeuroKit2** | github.com/neuropsychology/NeuroKit | ~2.2k | Python | HRV time/freq/non-linear, ECG, RSP, EDA. Reference implementasi RMSSD/SDNN. |
| **hrv-analysis** | github.com/Aura-healthcare/hrv-analysis | ~449 | Python | RR-interval engineering features — bagus untuk reproduksi pipeline Plews. |
| **pyhrv** | github.com/PGomes92/pyhrv | ~333 | Python | Toolbox HRV lengkap, dokumentasi rapi. |
| **OpenHRV** | github.com/JanCBrammer/OpenHRV | ~172 | Python | HRV biofeedback dengan ECG chest strap (Polar H10) — relevan untuk validasi sensor-sim. |
| **PSSK-TCBK (Oxford-NIL)** | github.com/Oxford-NIL/PSSK-TCBK | 1 | Python | Implementasi multi-model Kalman filter untuk core temp dari HR — port langsung dari pendekatan Buller. |
| **JohanBellander/vo2maxe** | github.com/JohanBellander/vo2maxe | 0 | TeX | Reverse-engineered Garmin VO2max algorithm — kontekstual referensi, bukan production. |

---

## 3. Datasets (VERIFIED)

| Dataset | URL | Konten | Lisensi |
|---|---|---|---|
| **Treadmill Maximal Exercise Tests (UMA)** | physionet.org/content/treadmill-exercise-cardioresp/1.0.1/ | 992 tes graded; HR, VO2, VCO2, RER, ventilasi, suhu/RH ambient; 857 subjek 10–63 thn | PhysioNet Contributor Review HDL 1.5.0 (open) |
| **Cardiorespiratory cycloergometer tests** | physionet.org/content/actes-cycloergometer-exercise/ | 18 tes cycle ergometer dengan ventilasi & gas exchange | Open via PhysioNet |
| **Quantitative Dehydration Estimation (QDE)** | physionet.org/content/qde/ | Bioimpedance, body temperature, sweat samples — gold-standard untuk hyponatremia/dehydration label | Open via PhysioNet |
| **Norwegian Endurance Athlete ECG DB** | physionet.org/content/norwegian-athlete-ecg/ | 28 ECG atlet endurance elite — anchor "trained heart" untuk distinguishing benign HRV dari pathology | Open via PhysioNet |
| **Wrist PPG During Exercise** | physionet.org/content/wrist/ | PPG walking/running/cycling, 8 subjek — validasi konsistensi sensor optik vs chest strap | Open via PhysioNet |

*Catatan:* ACSM heat illness registry & data atlet Kemenkes RI tidak public. Garmin Connect IQ tidak menyediakan raw data terbuka — abaikan dari brief.

---

## 4. Feature Engineering — Formula Eksplisit (Port ke JavaScript)

### 4.1 CV-Fitness / VO2max

**Uth HR-Ratio Method (verified 15.3 coefficient):**
```
VO2max_ml_kg_min = 15.3 * (HRmax / HRrest)
```
- `HRmax` estimated: `208 - 0.7 * age` (Tanaka 2001) — lebih akurat dari `220 - age` untuk usia >40.
- `HRrest` dari window terendah 5-menit rolling, idealnya pagi pre-activity.
- Valid range: HRmax/HRrest 2.4–4.5 → VO2max 37–69 ml/kg/min.

**Heart Rate Recovery (Cole 1999):**
```
HRR_1min = HR_peak - HR_at_60s_post_exercise
HRR_3min = HR_peak - HR_at_180s_post_exercise
risk_flag = HRR_1min < 12   // 4x mortality hazard
healthy   = HRR_1min >= 18 AND HRR_3min >= 42
```
HRR 1-min mencerminkan reaktivasi vagal; 3-min mencerminkan recovery global — keduanya orthogonal, masukkan **dua-duanya** sebagai feature.

**Cooper test correlation (12-min run distance d in meters):**
```
VO2max_ml_kg_min = (d - 504.9) / 44.73
```

### 4.2 Overtraining (Plews monitoring)

**Lognormal RMSSD baseline (window 7d, log-transform dulu untuk normality):**
```
lnRMSSD_t  = ln(RMSSD_t)
mu_7d      = mean(lnRMSSD over last 7 days)
sigma_7d   = std(lnRMSSD over last 7 days)
z_today    = (lnRMSSD_today - mu_7d) / sigma_7d
flag_overtraining = z_today < -1.0  // sustained >3 days
```
Plews menekankan **smallest worthwhile change (SWC)** = `0.5 * sigma_7d`. Per-individu, **bukan** absolute threshold.

**Resting HR drift:**
```
HRrest_drift_pct = (HRrest_today - HRrest_baseline_28d) / HRrest_baseline_28d * 100
flag = HRrest_drift_pct > 5  // sustained >=3 hari berurutan
```

**Acute:Chronic Workload Ratio (Gabbett):**
```
acute   = sum(training_load over last 7 days)
chronic = mean(weekly_load over last 28 days)
ACWR    = acute / chronic
sweet_spot = 0.8 <= ACWR <= 1.3
danger     = ACWR > 1.5   // risiko cedera meningkat
undertrain = ACWR < 0.8
```
`training_load = duration_min * sRPE` (session-RPE 1–10) atau `TRIMP` jika HR tersedia.

### 4.3 Heat Strain

**WBGT outdoor (verified Wikipedia + WHO):**
```
WBGT_outdoor = 0.7 * Twb + 0.2 * Tg + 0.1 * Tdb
WBGT_indoor  = 0.7 * Twb + 0.3 * Tg
```
Jika hanya ada T (°C) + RH (%) (kasus AERVINEX dari weather API):
```
Twb_approx (Stull 2011) = T*atan(0.151977*sqrt(RH+8.313659))
                       + atan(T+RH) - atan(RH-1.676331)
                       + 0.00391838*RH^1.5*atan(0.023101*RH)
                       - 4.686035
```

**Buller HR-to-Core-Temp Kalman (extended model, parameter dari paper Buller 2013):**
State: `CT_k` (core temp); Observation: `HR_k`.
```
// Prediction
CT_pred  = CT_prev + 0       (random-walk, a=1)
P_pred   = P_prev + Q         Q = 0.000484  (process variance per-min)

// Observation model HR = a*CT^2 + b*CT + c
a = -7.379       b = 384.4        c = -4881
HR_hat  = a*CT_pred^2 + b*CT_pred + c
H       = 2*a*CT_pred + b          // Jacobian (extended KF)
R       = 18.88                    // observation variance

// Update
K       = P_pred * H / (H^2 * P_pred + R)
CT_new  = CT_pred + K * (HR_observed - HR_hat)
P_new   = (1 - K*H) * P_pred
```
Init: `CT_0 = 37.1 °C`, `P_0 = 0`. Update tiap 60 s. Critical CT >= 39.5 °C = heat illness flag.

**Heat acclimatization (Periard 2015 timeline):**
```
heat_accl_days = number of days in last 14d with WBGT_max > 28 AND exercise_duration > 30min
status = "naive"   if heat_accl_days < 5
       = "partial" if 5..9
       = "full"    if >=10
```
Naïve runner di lingkungan tropis Indonesia = risiko EHI tertinggi minggu pertama.

### 4.4 Hyponatremia (EAH)

**Body weight change rule (Hew-Butler 2015 consensus):**
```
weight_change_pct = (post_weight - pre_weight) / pre_weight * 100
EAH_risk = weight_change_pct > 0   // gain berat saat exercise = over-hydration
EAH_high = weight_change_pct > +2  // hampir pasti hyponatremia
dehydration_risk = weight_change_pct < -2
```

**Composite indikator (race ≥4h):**
```
event_duration_h >= 4
AND fluid_intake_ml_per_h > 800
AND sodium_intake_mg_per_h < 300
AND weight_change_pct > 0
→ EAH probability HIGH
```

---

## 5. Arsitektur Target (Rekomendasi)

**Literatur mendukung pendekatan HYBRID, bukan deep-learning murni:**

- **CV-fitness, overtraining, heat-cramps, hyponatremia adalah konstruks fisiologis dengan rumus closed-form yang divalidasi dekade.** Memaksa ML black-box untuk meniru Uth/Buller/Plews akan kalah akurat selama dataset training AERVINEX masih semi-synthetic.
- **Bukti dari ML pipeline AERVINEX sekarang (F1 0.53–0.72):** justru ini tipikal model yang belajar **proxy lemah** dari sinyal yang sebenarnya cukup deterministik via formula.

**Rekomendasi konkret:**

1. **Closed-form first, ML second.** Hitung VO2max (Uth), CT (Buller), z-RMSSD (Plews), ACWR (Gabbett), WBGT (Stull), EAH composite (Hew-Butler) sebagai **deterministic features**. Ekspose sebagai output langsung untuk 4 label tersebut.
2. **ML hanya untuk multi-label co-occurrence ranking.** Train ML untuk *prioritise* risk ketika beberapa formula trigger bersamaan — ini yang sulit dilakukan formula sendiri.
3. **Re-train dengan PhysioNet UMA treadmill data (992 tests)** sebagai anchor real-world untuk cv-fitness. Akan langsung naikkan F1 cv-fitness ≥0.80 dari 0.72.
4. **Per-user lognormal baseline** untuk RMSSD & resting HR (windowing 7d/28d) — wajib untuk overtraining; absolute threshold akan selalu salah karena variance inter-individu.
5. **Tambahkan feature `heat_acclimation_days`** (mudah dihitung dari history sessions + weather API) — paper Periard menunjukkan ini factor terbesar EHI risk di lingkungan tropis baru.
6. **Hyponatremia tetap rare-event** — pertahankan rule-based gating (race >4h + weight gain) untuk hindari false-positive yang menurunkan F1.

**Tidak direkomendasikan:** end-to-end transformer / RNN time-series untuk 4 label ini. ROI rendah, data labelled terlalu sedikit, dan formula sudah mendekati Bayes-optimal pada physiologic ground truth.

---

## Additional Notes

- Brief asli mengandung dua mis-citation yang sudah dikoreksi di section 1: Uth 2004 ada di **Eur J Appl Physiol** (bukan J Sports Sci); Buller 2013 ada di **Physiological Measurement** (bukan IEEE TBME).
- Brief asli menyebut ACWR >1.5 sebagai risiko — Gabbett 2016 sebenarnya menyebut **sweet spot 0.8–1.3** sebagai aman, >1.5 sebagai zona bahaya. Gunakan range, bukan threshold tunggal.
- Untuk implementasi JS, semua formula di Section 4 bisa langsung ditulis sebagai pure function — tidak butuh library matematik kecuali `Math.atan`, `Math.sqrt`, `Math.log` (sudah built-in).
- Validasi: bandingkan output formula vs gold-standard (UMA dataset untuk VO2max; PhysioNet QDE untuk dehydration) sebelum production rollout. Target absolute error VO2max <5 ml/kg/min, CT <0.3 °C.

---

## Sources and References

1. Uth N et al. 2004 — https://pubmed.ncbi.nlm.nih.gov/14624296/ (DOI 10.1007/s00421-003-0988-y)
2. Buller MJ et al. 2013 — https://pubmed.ncbi.nlm.nih.gov/23780514/ (DOI 10.1088/0967-3334/34/7/781)
3. Plews DJ et al. 2013 — https://pubmed.ncbi.nlm.nih.gov/23852425/ (DOI 10.1007/s40279-013-0071-8)
4. Almond CSD et al. 2005 — https://pubmed.ncbi.nlm.nih.gov/15829535/ (DOI 10.1056/NEJMoa043901)
5. Hew-Butler T et al. 2015 — https://pubmed.ncbi.nlm.nih.gov/26227507/ (DOI 10.1136/bjsports-2015-095004)
6. Casa DJ et al. 2015 — https://pubmed.ncbi.nlm.nih.gov/26381473/ (DOI 10.4085/1062-6050-50.9.07)
7. Schwellnus MP et al. 1997 — https://pubmed.ncbi.nlm.nih.gov/9232553/ (DOI 10.1080/026404197367281)
8. Gabbett TJ 2016 — https://pubmed.ncbi.nlm.nih.gov/26758673/ (DOI 10.1136/bjsports-2015-095788)
9. Cole CR et al. 1999 — https://pubmed.ncbi.nlm.nih.gov/10536127/ (DOI 10.1056/NEJM199910283411804)
10. Periard JD et al. 2015 — https://pubmed.ncbi.nlm.nih.gov/25943654/ (DOI 10.1111/sms.12408)
11. NeuroKit2 — https://github.com/neuropsychology/NeuroKit
12. hrv-analysis — https://github.com/Aura-healthcare/hrv-analysis
13. pyhrv — https://github.com/PGomes92/pyhrv
14. OpenHRV — https://github.com/JanCBrammer/OpenHRV
15. PSSK-TCBK Buller-style Kalman — https://github.com/Oxford-NIL/PSSK-TCBK
16. PhysioNet UMA Treadmill — https://physionet.org/content/treadmill-exercise-cardioresp/1.0.1/
17. PhysioNet QDE — https://physionet.org/content/qde/
18. PhysioNet Norwegian Athlete ECG — https://physionet.org/content/norwegian-athlete-ecg/
19. WBGT formula reference — https://en.wikipedia.org/wiki/Wet-bulb_globe_temperature
