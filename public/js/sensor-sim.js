/**
 * AERVIO Sensor Simulation Engine
 * Simulates: MAX30102 (PPG), MLX90614 (IR Temp), EDA/GSR, GPS, IMU (Gyro+Accel+Magneto)
 */
window.SensorSim = {

  // ── STATE ───────────────────────────────────────────────────────────────────
  state: {
    phase: 'rest',       // rest | warmup | steady | push | cooldown
    elapsed: 0,          // seconds since session start
    targetHR: 70,        // bpm target (age-based)
    mhr: 195,            // max heart rate
    stressLevel: 0.2,    // 0-1 (affects HRV, EDA)
    fatigueLevel: 0,     // 0-1 (grows during run)
    activityLevel: 0,    // 0-1 (0=rest, 1=max run)
    dehydration: 0,      // 0-1
  },

  // ── PPG / MAX30102 ──────────────────────────────────────────────────────────
  ppg: {
    baseRRI: 857,        // ms (≈70 bpm resting)
    rriHistory: [],
    currentHR: 70,
    currentSpO2: 98,

    nextRRI(stressLevel, activityLevel) {
      const targetHR = SensorSim._targetHR(activityLevel, stressLevel);
      const targetRRI = 60000 / targetHR;
      // Smooth HR transition
      this.baseRRI = Utils.lerp(this.baseRRI, targetRRI, 0.08);
      // HRV: SDNN decreases with stress/activity
      const sdnn = Utils.clamp(55 - stressLevel * 25 - activityLevel * 20, 8, 55);
      const noise = (Math.random() - 0.5) * 2 * sdnn;
      const rri = Utils.clamp(this.baseRRI + noise, 300, 2000);
      this.rriHistory.push(rri);
      if (this.rriHistory.length > 64) this.rriHistory.shift();
      this.currentHR = Math.round(60000 / (this.rriHistory.reduce((a,b)=>a+b,0)/this.rriHistory.length));
      return rri;
    },

    getRMSSD() {
      if (this.rriHistory.length < 4) return 42;
      let ss = 0;
      for (let i = 1; i < this.rriHistory.length; i++) ss += Math.pow(this.rriHistory[i]-this.rriHistory[i-1],2);
      return +Math.sqrt(ss/(this.rriHistory.length-1)).toFixed(1);
    },

    getSDNN() {
      if (this.rriHistory.length < 4) return 40;
      const mean = this.rriHistory.reduce((a,b)=>a+b,0)/this.rriHistory.length;
      const variance = this.rriHistory.reduce((s,x)=>s+Math.pow(x-mean,2),0)/this.rriHistory.length;
      return +Math.sqrt(variance).toFixed(1);
    },

    pNN50() {
      if (this.rriHistory.length < 4) return 25;
      let count = 0;
      for (let i = 1; i < this.rriHistory.length; i++) if (Math.abs(this.rriHistory[i]-this.rriHistory[i-1]) > 50) count++;
      return +((count/(this.rriHistory.length-1))*100).toFixed(1);
    },

    getSpO2(activityLevel) {
      // SpO2 dips slightly during intense exercise
      const base = 98 - activityLevel * 2.5;
      const noise = (Math.random() - 0.5) * 0.6;
      this.currentSpO2 = Utils.clamp(base + noise, 88, 100);
      return +this.currentSpO2.toFixed(1);
    },

    getRespirationRate(activityLevel) {
      // 12-20 bpm rest, up to 40 bpm max exercise
      const base = 14 + activityLevel * 26;
      return Math.round(base + (Math.random()-0.5)*2);
    }
  },

  // ── MLX90614 (IR Thermal) ────────────────────────────────────────────────
  mlx: {
    baseSkinTemp: 33.2,     // °C resting skin temp
    currentSkinTemp: 33.2,
    sweatOnset: false,
    sweatTimer: 0,

    update(activityLevel, elapsed) {
      // Skin temp rises with activity, then drops when sweating kicks in
      const target = 33.2 + activityLevel * 3.8;
      this.currentSkinTemp = Utils.lerp(this.currentSkinTemp, target, 0.04);
      // Sweat onset: skin temp drops after it peaks
      if (this.currentSkinTemp > 36.0 && !this.sweatOnset) {
        this.sweatOnset = true;
        this.sweatTimer = elapsed;
      }
      if (this.sweatOnset) {
        const sinceSweat = elapsed - this.sweatTimer;
        const coolingEffect = Math.min(sinceSweat / 120, 1) * 1.5;
        this.currentSkinTemp -= coolingEffect * 0.02;
      }
      this.currentSkinTemp += (Math.random()-0.5) * 0.12;
      return +this.currentSkinTemp.toFixed(2);
    },

    getCoreEstimate(activityLevel) {
      return Utils.estimateCoreTemp(this.currentSkinTemp, activityLevel);
    },

    getThermoregEfficiency(activityLevel) {
      // Higher activity, better efficiency expected; if skin stays high = poor regulation
      const expected = 33.2 + activityLevel * 4;
      const diff = Math.abs(this.currentSkinTemp - expected);
      return Math.round(Utils.clamp(100 - diff * 20, 0, 100));
    }
  },

  // ── EDA / GSR ────────────────────────────────────────────────────────────
  eda: {
    baseline: 4.5,    // μS (microsiemens)
    tonic: 4.5,       // SCL (skin conductance level)
    phasicBuffer: [], // SCR (skin conductance response events)
    lastPeak: 0,

    update(stressLevel, activityLevel, elapsed) {
      // Tonic EDA rises with sustained stress/activity
      const targetTonic = 2 + stressLevel * 8 + activityLevel * 10;
      this.tonic = Utils.lerp(this.tonic, targetTonic, 0.05);
      // Random phasic events (stress spikes)
      let phasic = 0;
      if (Math.random() < 0.04 + stressLevel * 0.08) {
        phasic = Utils.rand(0.5, 2.5);
        this.phasicBuffer.push({ t: elapsed, amp: phasic });
        this.lastPeak = elapsed;
      }
      // Decay old events
      this.phasicBuffer = this.phasicBuffer.filter(e => elapsed - e.t < 8);
      const totalPhasic = this.phasicBuffer.reduce((s,e) => s + e.amp * Math.exp(-(elapsed-e.t)/3), 0);
      const noise = (Math.random()-0.5) * 0.3;
      return +(this.tonic + totalPhasic + noise).toFixed(3);
    },

    getSympatheticScore(stressLevel, activityLevel) {
      // 0-100 sympathetic nervous system activation
      const scl = this.tonic;
      const norm = Utils.clamp((scl - 2) / 18, 0, 1);
      return Math.round(norm * 100);
    },

    getStressEvents(elapsed, window = 60) {
      return this.phasicBuffer.filter(e => elapsed - e.t < window).length;
    }
  },

  // ── GPS ──────────────────────────────────────────────────────────────────
  gps: {
    // Default starting position: Jakarta (Monas area)
    lat: -6.1751,
    lon: 106.8272,
    altitude: 8,   // m above sea level
    accuracy: 3.5, // m
    heading: 45,   // degrees (NE)
    speed: 0,      // m/s
    track: [],     // array of {lat,lon,t,elev}

    update(activityLevel, elapsed, paceSecPerKm) {
      if (activityLevel < 0.1) {
        this.speed = 0;
        return { lat: this.lat, lon: this.lon, alt: this.altitude, speed: 0, heading: this.heading };
      }
      // Convert pace to speed (m/s)
      this.speed = activityLevel > 0 ? 1000 / paceSecPerKm : 0;
      const dt = 3; // simulation tick = 3s
      const dist = this.speed * dt; // meters

      // Heading follows a gentle curved route (simulated)
      this.heading += (Math.random()-0.5) * 8;
      const rad = this.heading * Math.PI / 180;

      // Update position
      const dLat = (dist * Math.cos(rad)) / 111320;
      const dLon = (dist * Math.sin(rad)) / (111320 * Math.cos(this.lat * Math.PI/180));
      this.lat += dLat;
      this.lon += dLon;

      // Altitude variation (simulated urban terrain)
      this.altitude += (Math.random()-0.5) * 0.5;
      const noise_lat = (Math.random()-0.5) * 0.00003;
      const noise_lon = (Math.random()-0.5) * 0.00003;

      const point = {
        lat: this.lat + noise_lat,
        lon: this.lon + noise_lon,
        alt: +this.altitude.toFixed(1),
        t: elapsed
      };
      this.track.push(point);
      if (this.track.length > 300) this.track.shift();
      return { ...point, speed: this.speed, heading: this.heading, accuracy: this.accuracy };
    },

    getElevationGain() {
      if (this.track.length < 2) return 0;
      let gain = 0;
      for (let i = 1; i < this.track.length; i++) {
        const d = (this.track[i].alt || 0) - (this.track[i-1].alt || 0);
        if (d > 0) gain += d;
      }
      return +gain.toFixed(1);
    },

    getElevationAdjustedPace(basePace, gradient) {
      // Grade-adjusted pace: +30s per km for each 1% uphill, -15s downhill
      return Math.max(180, basePace + gradient * 3000);
    }
  },

  // ── IMU (MPU-9250: Gyro + Accel + Magneto) ──────────────────────────────
  imu: {
    cadence: 0,         // steps/min
    vertOsc: 0,         // cm vertical oscillation
    gct: 0,             // ms ground contact time
    asymmetry: 0,       // % L/R difference
    leanAngle: 0,       // degrees forward lean
    impactG: 0,         // G-force at landing
    pronation: 0,       // mm (mediolateral)
    stepCount: 0,       // total steps
    strideLength: 0,    // m

    update(phase, activityLevel, elapsed, fatigueLevel) {
      if (activityLevel < 0.1) {
        this.cadence = 0; this.gct = 0; this.vertOsc = 0;
        return this;
      }
      // Base cadence per phase
      const baseCadence = { warmup: 158, steady: 175, push: 182, cooldown: 162 }[phase] || 170;
      const fatiguePenalty = fatigueLevel * 14;
      this.cadence = Math.round(baseCadence - fatiguePenalty + (Math.random()-0.5)*5);

      // Vertical oscillation (ideal <8cm, rises with fatigue)
      this.vertOsc = +(7 + fatigueLevel * 4 + (Math.random()-0.5) * 1.2).toFixed(1);

      // Ground Contact Time (ideal <200ms, rises with fatigue)
      this.gct = Math.round(190 + fatigueLevel * 70 + (Math.random()-0.5)*20);

      // Asymmetry (ideal <3%, rises with fatigue & injury risk)
      this.asymmetry = +(2.5 + fatigueLevel * 6 + Math.random()*2).toFixed(1);

      // Forward lean (optimal 5-8°)
      this.leanAngle = +(6 + (Math.random()-0.5)*2.5).toFixed(1);

      // Impact force at landing (G)
      this.impactG = +(2.5 + fatigueLevel * 0.8 + (Math.random()-0.5)*0.4).toFixed(2);

      // Mediolateral pronation (mm, positive = overpronation)
      this.pronation = +((Math.random()-0.4)*8).toFixed(1);

      // Stride length (m)
      this.strideLength = +(this.cadence > 0 ? (this.cadence > 0 ? (1000/this.cadence)*0.6 : 0) : 0).toFixed(2);

      // Step count accumulation
      this.stepCount += Math.round(this.cadence / 20); // per 3s tick

      return this;
    },

    getGaitEfficiencyScore() {
      // 0-100: cadence (50pt) + vertOsc (25pt) + GCT (25pt)
      const cScore = Utils.clamp((this.cadence - 155) / (185 - 155) * 50, 0, 50);
      const vScore = Utils.clamp((10 - this.vertOsc) / (10 - 5) * 25, 0, 25);
      const gScore = Utils.clamp((280 - this.gct) / (280 - 175) * 25, 0, 25);
      return Math.round(cScore + vScore + gScore);
    },

    getNeuromuscularFatigueIndex() {
      // 0-100
      const cadenceDrop = Math.max(0, 175 - this.cadence) / 175;
      const gctRise = Math.max(0, this.gct - 200) / 120;
      const asymScore = Math.min(1, this.asymmetry / 10);
      return Math.round(Utils.clamp((cadenceDrop * 40 + gctRise * 40 + asymScore * 20), 0, 100));
    },

    getLeanAngleStatus() {
      const a = this.leanAngle;
      if (a >= 4 && a <= 9) return { label: 'Optimal', status: 'safe' };
      if (a < 4) return { label: 'Too Upright', status: 'warn' };
      return { label: 'Over-Lean', status: 'warn' };
    }
  },

  // ── HELPERS ───────────────────────────────────────────────────────────────
  _targetHR(activityLevel, stressLevel) {
    const s = SensorSim.state;
    const restHR = 65 + stressLevel * 15;
    return restHR + activityLevel * (s.mhr - restHR);
  },

  setAge(age) {
    this.state.mhr = 220 - age;
  },

  // ── TICK (called every 3 seconds) ─────────────────────────────────────────
  tick(overrides = {}) {
    const s = Object.assign(this.state, overrides);
    const rri = this.ppg.nextRRI(s.stressLevel, s.activityLevel);
    const skinTemp = this.mlx.update(s.activityLevel, s.elapsed);
    const edaVal = this.eda.update(s.stressLevel, s.activityLevel, s.elapsed);

    return {
      // PPG
      hr:         this.ppg.currentHR,
      rri:        Math.round(rri),
      spo2:       this.ppg.getSpO2(s.activityLevel),
      rmssd:      this.ppg.getRMSSD(),
      sdnn:       this.ppg.getSDNN(),
      pnn50:      this.ppg.pNN50(),
      respRate:   this.ppg.getRespirationRate(s.activityLevel),
      // MLX
      skinTemp,
      coreTemp:   this.mlx.getCoreEstimate(s.activityLevel),
      thermoEff:  this.mlx.getThermoregEfficiency(s.activityLevel),
      sweatOnset: this.mlx.sweatOnset,
      // EDA
      eda:        edaVal,
      sympathetic: this.eda.getSympatheticScore(s.stressLevel, s.activityLevel),
      stressEvents: this.eda.getStressEvents(s.elapsed),
      // IMU
      imu:        s.activityLevel > 0.1 ? this.imu.update(s.phase, s.activityLevel, s.elapsed, s.fatigueLevel) : null,
      // Hydration (decreases with activity)
      hydration:  Utils.clamp(100 - s.dehydration * 100, 0, 100),
    };
  }
};
