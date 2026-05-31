/**
 * AERVINEX Health Feature Engine
 * Derives advanced health features from multi-sensor fusion.
 */
window.HealthEngine = {

  // ── HRV SCORE (0-100) ─────────────────────────────────────────────────────
  // RMSSD-based: higher is better (more parasympathetic = healthier)
  getHRVScore(rmssd) {
    // Scale: >60ms = excellent (100), 40-60 = good (70-100), 20-40 = fair (30-70), <20 = poor
    if (rmssd >= 60) return Math.min(100, Math.round(85 + (rmssd - 60) * 0.5));
    if (rmssd >= 40) return Math.round(65 + (rmssd - 40));
    if (rmssd >= 20) return Math.round(30 + (rmssd - 20) * 1.75);
    return Math.max(0, Math.round(rmssd * 1.5));
  },

  // ── STRESS INDEX (0-100) ──────────────────────────────────────────────────
  // Fuses HRV (RMSSD) + EDA sympathetic score
  getStressIndex(rmssd, sympatheticScore) {
    const hrvStress = Utils.clamp(100 - this.getHRVScore(rmssd), 0, 100);
    const edaStress = sympatheticScore;
    return Math.round(hrvStress * 0.55 + edaStress * 0.45);
  },

  // ── COMPOSITE STRESS SCORE (CSS) ──────────────────────────────────────────
  // CSS = EDA(35%) + HRV_inverse(35%) + HR_zone(30%)
  getCSS(rmssd, sympatheticScore, hrPct) {
    const edaComponent  = sympatheticScore * 0.35;
    const hrvComponent  = Utils.clamp(100 - this.getHRVScore(rmssd), 0, 100) * 0.35;
    const hrComponent   = Utils.clamp((hrPct - 0.5) / 0.5 * 100, 0, 100) * 0.30;
    return Math.round(edaComponent + hrvComponent + hrComponent);
  },

  // ── RECOVERY READINESS SCORE (1-10) ──────────────────────────────────────
  getRecoveryReadiness(rmssd, restingHR, age, coreTemp) {
    const mhr = 220 - age;
    const hrScore  = Utils.clamp(1 - (restingHR - 50) / (mhr * 0.4 - 50), 0, 1);
    const hrvScore = Utils.clamp(rmssd / 70, 0, 1);
    const tempScore = Utils.clamp(1 - Math.abs(coreTemp - 36.8) / 2, 0, 1);
    const raw = (hrScore * 0.35 + hrvScore * 0.45 + tempScore * 0.20) * 10;
    return +raw.toFixed(1);
  },

  // ── TRIMP (Training Impulse) ───────────────────────────────────────────────
  // Bannister's TRIMP: duration × hr_ratio × exp(1.92 × hr_ratio)
  getTRIMP(durationMin, hr, restHR, mhr) {
    const ratio = (hr - restHR) / (mhr - restHR);
    if (ratio <= 0) return 0;
    return +(durationMin * ratio * Math.exp(1.92 * ratio)).toFixed(1);
  },

  // ── VO2MAX ESTIMATE ──────────────────────────────────────────────────────
  // Uth-Sørensen: VO2max = 15 × (MHR / HRrest)
  getVO2max(mhr, restHR) {
    return +(15 * (mhr / restHR)).toFixed(1);
  },

  // ── HEAT STRESS INDEX (0-100) ─────────────────────────────────────────────
  // Combines skin temp, core estimate, HR%, ambient temp
  getHeatStressIndex(coreTemp, hrPct, ambientTemp) {
    const tempScore = Utils.clamp((coreTemp - 36.8) / (40 - 36.8) * 60, 0, 60);
    const hrScore   = Utils.clamp((hrPct - 0.6) / (0.9 - 0.6) * 25, 0, 25);
    const ambScore  = Utils.clamp((ambientTemp - 24) / (40 - 24) * 15, 0, 15);
    return Math.round(tempScore + hrScore + ambScore);
  },

  // ── DEHYDRATION RISK (0-100) ──────────────────────────────────────────────
  // Rising HR, dropping EDA after sweat onset, declining performance
  getDehydrationRisk(hydration, hr, restHR, edaVal, sweatOnset) {
    const hydScore = Utils.clamp((100 - hydration) / 35 * 50, 0, 50);
    const hrDrift  = Utils.clamp((hr - restHR - 10) / 30 * 30, 0, 30);
    // EDA drops when dehydrated (fewer sweat glands active)
    const edaScore = sweatOnset ? Utils.clamp((8 - edaVal) / 8 * 20, 0, 20) : 0;
    return Math.round(hydScore + hrDrift + edaScore);
  },

  // ── LACTATE THRESHOLD DETECTION ───────────────────────────────────────────
  // Returns 0-100 proximity to lactate threshold
  getLactateProximity(hr, mhr, rmssd, cadence, baseCadence) {
    const hrPct    = hr / mhr;
    const cadDrop  = Math.max(0, (baseCadence - cadence)) / baseCadence;
    const hrvDrop  = Math.max(0, (35 - rmssd)) / 35;
    const score    = hrPct * 0.6 + cadDrop * 0.25 + hrvDrop * 0.15;
    return Math.round(Utils.clamp(score * 100, 0, 100));
  },

  // ── RESPIRATORY STRESS INDEX (0-100) ──────────────────────────────────────
  // Combines PM2.5 pollution + cardiac load + SpO2 dip
  getRSI(pm25, hrPct, spo2) {
    const pollScore = Utils.clamp(pm25 / 35 * 40, 0, 40);
    const hrScore   = Utils.clamp(Math.max(0, hrPct - 0.5) / 0.4 * 40, 0, 40);
    const spo2Score = Utils.clamp((98 - spo2) / 8 * 20, 0, 20);
    return Math.round(pollScore + hrScore + spo2Score);
  },

  // ── OVERALL HEALTH RISK SCORE (0-100) ────────────────────────────────────
  getHealthRisk(hr, spo2, pm25, uvi, hydration, age) {
    const mhr     = 220 - age;
    const hrRisk  = Utils.clamp((hr/mhr - 0.5) / 0.4 * 100, 0, 100);
    const spo2Risk= spo2 >= 95 ? 0 : spo2 >= 90 ? 50 : 100;
    const pm25Risk= Utils.clamp(pm25 / 35 * 100, 0, 100);
    const uvRisk  = Utils.clamp(uvi / 11 * 100, 0, 100);
    const hydRisk = Utils.clamp((100 - hydration) / 30 * 100, 0, 100);
    return Math.round(hrRisk*0.25 + spo2Risk*0.20 + pm25Risk*0.25 + uvRisk*0.15 + hydRisk*0.15);
  },

  // ── GAIT EFFICIENCY (0-100) ────────────────────────────────────────────────
  getGaitEfficiency(cadence, vertOsc, gct) {
    const cScore = Utils.clamp((cadence - 155) / 30 * 50, 0, 50);
    const vScore = Utils.clamp((10 - vertOsc) / 5 * 25, 0, 25);
    const gScore = Utils.clamp((280 - gct) / 105 * 25, 0, 25);
    return Math.round(cScore + vScore + gScore);
  },

  // ── ENVIRONMENTAL TRAINING RECOMMENDATION ────────────────────────────────
  getTrainingRecommendation(css, pm25, coreTemp, heatStress, rsi) {
    const risk = Math.max(css, pm25/35*100, heatStress, rsi);
    if (risk < 30 && pm25 < 10 && coreTemp < 37.5)
      return { level: 'high',    icon: '🟢', title: 'High Intensity OK',      msg: 'Semua kondisi optimal. Aman untuk latihan intensitas tinggi.', color: 'var(--safe)' };
    if (risk < 55 || (pm25 >= 10 && pm25 < 25) || (coreTemp >= 37.5 && coreTemp < 38.5))
      return { level: 'moderate',icon: '🟡', title: 'Turunkan Intensitas',    msg: 'Kondisi cukup, pertahankan intensitas sedang dan perhatikan hidrasi.', color: 'var(--warn)' };
    if (risk < 75 || pm25 >= 25 || coreTemp >= 38.5)
      return { level: 'low',     icon: '🟠', title: 'Intensitas Ringan Saja', msg: 'Kondisi kurang ideal. Jalan santai atau pemanasan ringan saja.', color: 'var(--warn)' };
    return { level: 'rest',      icon: '🔴', title: 'Istirahat / Dalam Ruangan', msg: 'Kondisi berbahaya. Hindari aktivitas luar ruangan sekarang.', color: 'var(--danger)' };
  },

  // ── AUTONOMIC BALANCE SCORE (0-100) ──────────────────────────────────────
  // Cross-correlates HRV (parasympathetic) vs EDA (sympathetic)
  getAutonomicBalance(rmssd, sympatheticScore) {
    const para = this.getHRVScore(rmssd);         // parasympathetic dominance
    const symp = sympatheticScore;                 // sympathetic dominance
    // Balance: 50 = neutral, >50 = parasympathetic dominant (recovery), <50 = sympathetic (stressed)
    const balance = Utils.clamp(50 + (para - symp) * 0.5, 0, 100);
    return Math.round(balance);
  },

  // ── AEROBIC EFFICIENCY ───────────────────────────────────────────────────
  // Ratio of VO2 effort per unit of pace — improves over training
  getAerobicEfficiency(hr, mhr, paceSecPerKm) {
    if (!paceSecPerKm || paceSecPerKm > 900) return 0;
    const hrPct = hr / mhr;
    const speed = 1000 / paceSecPerKm; // m/s
    // Higher speed at lower HR% = more efficient
    return +(speed / hrPct * 100).toFixed(1);
  },

  // ── FULL ANALYSIS SNAPSHOT ───────────────────────────────────────────────
  // context may include optional ML fields:
  //   aqi, humidity, windSpeed  → for TEPRS
  //   activityLevel, uvi        → for MCD
  //   userProfile               → for AIRI { age, position, gender, loadBalance… }
  analyze(sensorData, context) {
    const { hr, rmssd, sdnn, spo2, skinTemp, coreTemp, eda, sympathetic,
            hydration, sweatOnset, imu } = sensorData;
    const { age, pm25, uvi, ambientTemp, paceSecPerKm, elapsed, restHR,
            aqi, humidity, windSpeed, activityLevel, userProfile } = context;
    const mhr   = 220 - age;
    const hrPct = hr / mhr;

    const rsi     = this.getRSI(pm25, hrPct, spo2);
    const css     = this.getCSS(rmssd, sympathetic, hrPct);
    const hsi     = this.getHeatStressIndex(coreTemp, hrPct, ambientTemp || 28);
    const dehydr  = this.getDehydrationRisk(hydration, hr, restHR, eda, sweatOnset);
    const risk    = this.getHealthRisk(hr, spo2, pm25, uvi, hydration, age);
    const hrvSc   = this.getHRVScore(rmssd);
    const stress  = this.getStressIndex(rmssd, sympathetic);
    const autonom = this.getAutonomicBalance(rmssd, sympathetic);
    const rdy     = this.getRecoveryReadiness(rmssd, hr, age, coreTemp);
    const rec     = this.getTrainingRecommendation(css, pm25, coreTemp, hsi, rsi);
    const gait    = imu ? this.getGaitEfficiency(imu.cadence, imu.vertOsc, imu.gct) : null;
    const nmf     = imu ? imu.getNeuromuscularFatigueIndex() : null;
    const lactat  = imu ? this.getLactateProximity(hr, mhr, rmssd, imu.cadence, 175) : null;
    const vo2max  = this.getVO2max(mhr, restHR);
    const aerobic = paceSecPerKm ? this.getAerobicEfficiency(hr, mhr, paceSecPerKm) : null;

    // ── ML Proxy Assessment (runs when ml-client.js is loaded) ───────────
    let ml = null;
    if (typeof MLClient !== 'undefined') {
      const envData = {
        pm25:        pm25        ?? 15,
        aqi:         aqi         ?? (pm25 ?? 15) * 4,
        temperature: ambientTemp ?? 28,
        humidity:    humidity    ?? 70,
        windSpeed:   windSpeed   ?? 5,
        uvi:         uvi         ?? 4,
      };
      const sdData = {
        ...sensorData,
        activityLevel: activityLevel ?? sensorData.activityLevel ?? 0,
        nmf,
      };
      const profile = userProfile
        ? { ...userProfile, age: userProfile.age ?? age }
        : { age };
      ml = MLClient.fullAssessment(sdData, envData, profile);
    }

    return { rsi, css, hsi, dehydr, risk, hrvSc, stress, autonom, rdy, rec,
             gait, nmf, lactat, vo2max, aerobic, ml };
  }
};
