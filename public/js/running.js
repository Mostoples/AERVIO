/**
 * AERVINEX Running Mode Module
 * Features: Phase system, gait analysis, GPS map, lactate/fatigue detection
 */
(function() {
  let state = 'idle'; // idle | active | paused | done
  let sessionTimer = null;
  let tickInterval  = null;
  let elapsed       = 0;  // seconds
  let distance      = 0;  // km
  let targetDist    = 5;  // km
  let basePace      = 360; // s/km (6:00/km default)
  let currentPace   = 360;
  let userAge       = 25;
  let mhr           = 195;
  let restHR        = 68;
  let baselineCAD   = 175;
  let envData       = { pm25: 18, aqi: 72, uvi: 4, temp: 28, humidity: 72, windSpeed: 5, source: 'Simulasi' };
  let epoAdj        = null; // current EPO adjustment
  let map           = null;
  let routeLine     = null;
  let userMarker    = null;
  let routeCoords   = [];
  let phaseHistory  = { warmup:[], steady:[], push:[], cooldown:[] };
  let zoneTimers    = { Z1:0, Z2:0, Z3:0, Z4:0, Z5:0 }; // seconds in each HR zone
  let totalPower    = 0; // Joules accumulated

  // ── PHASE LOGIC ──────────────────────────────────────
  function getPhase(distKm, totalKm) {
    const pct = distKm / totalKm;
    if (pct < 0.10) return 'warmup';
    if (pct < 0.70) return 'steady';
    if (pct < 0.90) return 'push';
    return 'cooldown';
  }

  function phaseTargetActivity(phase) {
    return { warmup:0.55, steady:0.75, push:0.90, cooldown:0.55, idle:0 }[phase] || 0;
  }

  function phaseRecommendedPace(phase, base) {
    const mods = { warmup:+90, steady:0, push:-30, cooldown:+60 };
    return Math.max(180, base + (mods[phase] || 0));
  }

  // ── FATIGUE ──────────────────────────────────────────
  function updateFatigue() {
    SensorSim.state.fatigueLevel = Utils.clamp(elapsed / 5400, 0, 1); // full at 90 min
    SensorSim.state.dehydration  = Utils.clamp(elapsed / 7200, 0, 0.7);
  }

  // ── MAP INIT ─────────────────────────────────────────
  function initMap() {
    if (map) { map.invalidateSize(); return; }
    const mapEl = document.getElementById('run-map');
    if (!mapEl || !window.L) return;

    map = L.map('run-map', { zoomControl:true, attributionControl:true }).setView(
      [SensorSim.gps.lat, SensorSim.gps.lon], 15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:'© OpenStreetMap',
      maxZoom: 19,
      className: 'map-tiles'
    }).addTo(map);

    // Dark tile layer filter via CSS
    const style = document.createElement('style');
    style.textContent = '.map-tiles { filter: invert(92%) hue-rotate(180deg) brightness(88%) contrast(90%); }';
    document.head.appendChild(style);

    // Start marker
    const startIcon = L.divIcon({ html: '<div style="width:14px;height:14px;background:#00E5A0;border-radius:50%;border:3px solid #07101C;box-shadow:0 0 8px rgba(0,229,160,.6)"></div>', className:'', iconAnchor:[7,7] });
    userMarker = L.marker([SensorSim.gps.lat, SensorSim.gps.lon], { icon: startIcon }).addTo(map);
    routeLine  = L.polyline([], { color:'#00E5A0', weight:4, opacity:.85, lineJoin:'round' }).addTo(map);
  }

  function updateMap(gpsData) {
    if (!map || !userMarker) return;
    const ll = L.latLng(gpsData.lat, gpsData.lon);
    userMarker.setLatLng(ll);
    routeCoords.push(ll);
    routeLine.setLatLngs(routeCoords);
    if (routeCoords.length % 5 === 0) map.panTo(ll, { animate: true, duration: 1 });
  }

  // ── TICK ─────────────────────────────────────────────
  function tick() {
    if (state !== 'active') return;
    elapsed += 3;
    const phase = getPhase(distance, targetDist);
    const actLvl = phaseTargetActivity(phase);
    SensorSim.state.phase         = phase;
    SensorSim.state.activityLevel = actLvl;
    SensorSim.state.stressLevel   = 0.3 + actLvl * 0.4;
    SensorSim.state.elapsed       = elapsed;
    updateFatigue();

    // EPO: compute heat index and adjusted pace
    if (typeof EPO !== 'undefined') {
      const hi = EPO.computeHeatIndex(envData.temp, envData.humidity);
      epoAdj   = EPO.getAdjustment(hi, envData.pm25);
      epoAdj.heatIndex = hi;
    }

    // Recommended pace for current phase (EPO-adjusted)
    const recPaceBase  = phaseRecommendedPace(phase, basePace);
    const recPace      = epoAdj ? Math.round(recPaceBase * (1 + epoAdj.pctSlower / 100)) : recPaceBase;
    // Current pace: drifts toward recommended + fatigue penalty
    const fatiguePenalty = SensorSim.state.fatigueLevel * 45;
    currentPace = Utils.lerp(currentPace, recPace + fatiguePenalty, 0.06);
    currentPace += (Math.random()-0.5) * 5;

    // Distance accumulation (km per tick)
    const speedKmh = 3600 / currentPace;
    distance += speedKmh * (3 / 3600);

    // Sensor data
    const raw = SensorSim.tick({});
    const gpsData = SensorSim.gps.update(actLvl, elapsed, currentPace);

    // Analysis
    const analysis = HealthEngine.analyze(raw, {
      age: userAge, pm25: envData.pm25, uvi: envData.uvi,
      ambientTemp: envData.temp, paceSecPerKm: currentPace,
      elapsed, restHR,
      aqi: envData.aqi, humidity: envData.humidity, windSpeed: envData.windSpeed,
      activityLevel: actLvl, userProfile: AERVINEXAuth.userProfile,
    });
    const imu = SensorSim.imu;

    // Update UI
    renderRunStats(raw, analysis, imu);
    renderPhaseBar(phase);
    renderGait(imu, analysis);
    renderRunAlerts(raw, analysis, imu);
    renderPaceRec(phase, recPace, analysis);
    renderEPO(epoAdj);
    renderRPAE(raw, imu);
    updateMap(gpsData);

    // Phase-specific audio/toast cues
    triggerPhaseCues(phase);

    // Check completion
    if (distance >= targetDist) endSession(raw, analysis);
  }

  let lastPhase = null;
  function triggerPhaseCues(phase) {
    if (phase === lastPhase) return;
    lastPhase = phase;
    const t = window.AervinexI18n?.t || (k => k);
    const msgs = {
      warmup:   t('🏃 Fase Warm-Up dimulai — pemanasan pelan.'),
      steady:   t('💪 Fase Steady — pertahankan pace target.'),
      push:     t('🔥 Fase Push — tingkatkan kecepatan!'),
      cooldown: t('🌬️ Fase Cooldown — turunkan kecepatan.')
    };
    if (msgs[phase]) App.toast(msgs[phase], phase === 'push' ? 'warn' : 'info', 5000);
  }

  // ── RENDER ───────────────────────────────────────────
  function renderRunStats(raw, analysis, imu) {
    setText('rs-dist',     Utils.fmt(distance, 2));
    setText('rs-time',     Utils.formatTime(elapsed));
    setText('rs-pace',     Utils.formatPace(currentPace));
    setText('rs-hr',       raw.hr);
    setText('rs-spo2',     Utils.fmt(raw.spo2,1));
    setText('rs-hydration',Math.round(raw.hydration));
    setText('rs-rsi',      analysis.rsi);
    setText('rs-coreTemp', Utils.fmt(raw.coreTemp,1));
    setText('rs-rmssd',    Utils.fmt(raw.rmssd,1));
    setText('rs-css',      analysis.css);
    setText('rs-lactate',  analysis.lactat || '--');
    setText('rs-vo2',      analysis.vo2max || '--');
    // Color HR
    const hrc = document.getElementById('rs-hr');
    if (hrc) hrc.style.color = raw.hr > 0.85 * mhr ? 'var(--danger)' : raw.hr > 0.70 * mhr ? 'var(--warn)' : 'var(--safe)';
  }

  function renderPhaseBar(phase) {
    const segs = ['warmup','steady','push','cooldown'];
    const idx  = segs.indexOf(phase);
    segs.forEach((s,i) => {
      const seg = document.getElementById('pseg-' + s);
      if (!seg) return;
      seg.className = 'phase-seg' + (i < idx ? ' done' : i === idx ? ' now' : '');
    });
    const nameEl = document.getElementById('run-phase-name');
    if (nameEl) {
      const t = window.AervinexI18n?.t || (k => k);
      const tt = window.AervinexI18n?.tt || ((k, v) => k);
      nameEl.textContent = { warmup:t('Warm-Up 🔵'), steady:t('Steady ✅'), push:t('Push 🔥'), cooldown:t('Cooldown 🌬️') }[phase] || '--';
      nameEl.className   = `phase-name ph-${phase}`;
    }
    const pctEl = document.getElementById('run-phase-pct');
    if (pctEl) {
      const tt = window.AervinexI18n?.tt || ((k, v) => k);
      pctEl.textContent = tt('{progress}% selesai', { progress: Utils.fmt(distance/targetDist*100,0) });
    }
    const distRemEl = document.getElementById('run-dist-rem');
    if (distRemEl) {
      const tt = window.AervinexI18n?.tt || ((k, v) => k);
      distRemEl.textContent = tt('{remaining} km lagi', { remaining: Utils.fmt(Math.max(0, targetDist - distance),2) });
    }
  }

  function renderGait(imu, analysis) {
    if (!imu || !imu.cadence) return;
    setText('g-cadence',   imu.cadence);
    setText('g-vertosc',   Utils.fmt(imu.vertOsc,1));
    setText('g-gct',       imu.gct);
    setText('g-asym',      Utils.fmt(imu.asymmetry,1));
    setText('g-lean',      Utils.fmt(imu.leanAngle,1));
    setText('g-impact',    Utils.fmt(imu.impactG,2));
    setText('g-eff',       analysis.gait || '--');
    setText('g-nmf',       analysis.nmf  || '--');
    // Color efficiency
    const effEl = document.getElementById('g-eff');
    if (effEl) effEl.style.color = (analysis.gait||0) > 70 ? 'var(--safe)' : (analysis.gait||0) > 45 ? 'var(--warn)' : 'var(--danger)';
    const nmfEl = document.getElementById('g-nmf');
    if (nmfEl) nmfEl.style.color = (analysis.nmf||0) < 30 ? 'var(--safe)' : (analysis.nmf||0) < 60 ? 'var(--warn)' : 'var(--danger)';
  }

  function renderRunAlerts(raw, analysis, imu) {
    const list = document.getElementById('run-alerts');
    if (!list) return;
    const tt = window.AervinexI18n?.tt || ((k, v) => k);
    const t = window.AervinexI18n?.t || (k => k);
    const alerts = [];
    if (raw.hr > 0.88 * mhr)          alerts.push({ t:'danger', msg:tt('❤️ HR {hr} bpm — TURUNKAN PACE!', { hr: raw.hr }) });
    if (raw.spo2 < 93)                 alerts.push({ t:'danger', msg:tt('🩸 SpO₂ {spo2}% — BERHENTI, cari bantuan!', { spo2: raw.spo2 }) });
    if (raw.hydration < 75)            alerts.push({ t:'warn',   msg:tt('💧 Hidrasi {hydration}% — MINUM SEKARANG!', { hydration: Math.round(raw.hydration) }) });
    if (raw.coreTemp > 38.5)           alerts.push({ t:'danger', msg:tt('🌡️ Core {coreTemp}°C — Risiko Heatstroke!', { coreTemp: raw.coreTemp }) });
    if (analysis.lactat > 80)          alerts.push({ t:'warn',   msg:t('⚡ Near Lactate Threshold — kurangi kecepatan.') });
    if (imu && imu.asymmetry > 8)      alerts.push({ t:'warn',   msg:tt('⚖️ Asimetri gait {asymmetry}% — cek kelelahan.', { asymmetry: Utils.fmt(imu.asymmetry,1) }) });
    if (envData.pm25 > 25)             alerts.push({ t:'warn',   msg:tt('💨 PM2.5 {pm25} μg/m³ — pertimbangkan rerouting.', { pm25: envData.pm25 }) });
    if (analysis.nmf > 65)             alerts.push({ t:'warn',   msg:tt('🦵 Neuromuscular fatigue {nmf}/100 — turunkan pace.', { nmf: analysis.nmf }) });
    list.innerHTML = alerts.length === 0
      ? `<div class="alert-item alert-safe"><span class="alert-icon">✅</span><div class="alert-txt"><div class="alert-title-t">${t('Semua Aman')}</div></div></div>`
      : alerts.map(a => `<div class="alert-item alert-${a.t}"><span class="alert-icon">${a.t==='danger'?'🚨':'⚠️'}</span><div class="alert-txt"><div class="alert-title-t">${a.msg}</div></div></div>`).join('');
  }

  function renderPaceRec(phase, recPace, analysis) {
    const el = document.getElementById('run-pace-rec');
    if (!el) return;
    const rec = analysis.rec;
    el.innerHTML = `<span class="pace-rec-icon">${rec.icon}</span><span><strong style="color:${rec.color}">${rec.title}</strong> — Pace target: <strong style="color:var(--green)">${Utils.formatPace(recPace)}</strong>/km</span>`;
  }

  // ── EPO Panel ────────────────────────────────────────
  function renderEPO(adj) {
    if (!adj) return;
    setText('epo-hi',       adj.heatIndex + '°C');
    setText('epo-pace-adj', (adj.pctSlower > 0 ? '+' : '') + adj.pctSlower + '%');
    setText('epo-zone',     adj.zoneName);
    const badge = document.getElementById('epo-badge');
    if (badge) { badge.textContent = adj.label; badge.style.background = adj.color + '22'; badge.style.color = adj.color; }
    const recEl = document.getElementById('epo-rec');
    if (recEl && typeof EPO !== 'undefined') recEl.textContent = EPO.getRecommendation(adj, envData.pm25);
    // Color pace-adj text
    const paceEl = document.getElementById('epo-pace-adj');
    if (paceEl) paceEl.style.color = adj.pctSlower > 10 ? 'var(--danger)' : adj.pctSlower > 0 ? 'var(--warn)' : 'var(--safe)';
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── RPAE — Running Performance Analytics Engine (F9) ─
  // Zone timer + Power Output estimation
  function renderRPAE(raw, imu) {
    // Determine HR zone (Z1-Z5 based on %MHR)
    const pct = raw.hr / mhr;
    const zone = pct < 0.60 ? 'Z1' : pct < 0.70 ? 'Z2' : pct < 0.80 ? 'Z3' : pct < 0.90 ? 'Z4' : 'Z5';
    zoneTimers[zone] = (zoneTimers[zone] || 0) + 3; // +3 seconds per tick

    // Power Output (W) = F × v
    // Simplified: P = m × g × v_vert + m × v × Cr  (running economy model)
    // Using: P ≈ weight(kg) × speed(m/s) × (1.045 + grade * 0.01) × efficiency
    const weightKg   = AERVINEXAuth.userProfile?.weight || 70;
    const speedMs    = 1000 / currentPace; // m/s
    const grade      = 0.005; // avg 0.5% grade
    const efficiency = 0.25;  // metabolic efficiency ~25%
    const powerW     = Math.round(weightKg * speedMs * (1.045 + grade * 100 * 0.01) / efficiency);
    totalPower      += powerW * 3; // W×s = Joules this tick

    // Update zone timer UI
    const totalZoneTime = Object.values(zoneTimers).reduce((a,b)=>a+b,0) || 1;
    ['Z1','Z2','Z3','Z4','Z5'].forEach((z, i) => {
      const secEl  = document.getElementById(`rpae-${z}-time`);
      const barEl  = document.getElementById(`rpae-${z}-bar`);
      const t      = zoneTimers[z] || 0;
      const pctBar = (t / totalZoneTime) * 100;
      if (secEl) secEl.textContent = Utils.formatTime(t);
      if (barEl) barEl.style.width = pctBar + '%';
      // Highlight active zone
      const rowEl = document.getElementById(`rpae-row-${z}`);
      if (rowEl) rowEl.style.opacity = (z === zone) ? '1' : '0.5';
    });

    // Power output
    const pwrEl = document.getElementById('rpae-power');
    if (pwrEl) pwrEl.textContent = powerW + ' W';
    const kJEl = document.getElementById('rpae-kj');
    if (kJEl) kJEl.textContent = (totalPower / 1000).toFixed(1) + ' kJ';
    const actZoneEl = document.getElementById('rpae-active-zone');
    if (actZoneEl) {
      actZoneEl.textContent = zone;
      const zColors = { Z1:'var(--safe)', Z2:'#38BDF8', Z3:'var(--warn)', Z4:'#F97316', Z5:'var(--danger)' };
      actZoneEl.style.color = zColors[zone];
    }
  }

  // ── SESSION CONTROLS ─────────────────────────────────
  function startSession() {
    if (state === 'active') return;
    // Reset
    elapsed = 0; distance = 0; lastPhase = null;
    zoneTimers  = { Z1:0, Z2:0, Z3:0, Z4:0, Z5:0 };
    totalPower  = 0;
    SensorSim.state.dehydration  = 0;
    SensorSim.state.fatigueLevel = 0;
    SensorSim.gps.track          = [];
    SensorSim.gps.lat            = -6.1751 + (Math.random()-0.5)*0.02;
    SensorSim.gps.lon            = 106.8272 + (Math.random()-0.5)*0.02;
    SensorSim.gps.heading        = Math.random() * 360;
    routeCoords                  = [];
    if (routeLine) routeLine.setLatLngs([]);
    if (map && userMarker) userMarker.setLatLng([SensorSim.gps.lat, SensorSim.gps.lon]);

    // Pre-fill HRV history
    for (let i=0; i<20; i++) SensorSim.ppg.nextRRI(0.3, 0.05);

    targetDist = parseFloat(document.getElementById('run-target-dist')?.value) || 5;
    basePace   = parseFloat(document.getElementById('run-target-pace')?.value) || 6;
    basePace   = basePace * 60; // convert min/km to s/km
    currentPace = basePace + 90; // start slower (warm-up)
    state = 'active';
    SensorSim.state.activityLevel = 0.55;

    document.getElementById('run-setup').classList.add('hidden');
    document.getElementById('run-session').classList.remove('hidden');
    document.getElementById('run-summary').classList.add('hidden');

    tickInterval = setInterval(tick, 3000);
    const t = window.AervinexI18n?.t || (k => k);
    App.toast(t('Sesi lari dimulai! 🏃'), 'success', 3000);
  }

  function pauseSession() {
    const t = window.AervinexI18n?.t || (k => k);
    if (state === 'active') {
      state = 'paused';
      SensorSim.state.activityLevel = 0;
      document.getElementById('btn-run-pause').textContent = '▶️';
      document.getElementById('btn-run-pause').title = t('Lanjutkan');
    } else if (state === 'paused') {
      state = 'active';
      SensorSim.state.activityLevel = 0.75;
      document.getElementById('btn-run-pause').textContent = '⏸️';
      document.getElementById('btn-run-pause').title = t('Jeda');
    }
  }

  function stopSession() {
    const t = window.AervinexI18n?.t || (k => k);
    if (!confirm(t('Hentikan sesi lari?'))) return;
    endSession();
  }

  async function endSession(raw, analysis) {
    if (state === 'done') return;
    state = 'done';
    clearInterval(tickInterval);
    SensorSim.state.activityLevel = 0;

    // Compute TRIMP
    const trimp = HealthEngine.getTRIMP(elapsed/60, SensorSim.ppg.currentHR, restHR, mhr);

    // Show summary
    document.getElementById('run-session').classList.add('hidden');
    document.getElementById('run-summary').classList.remove('hidden');
    setText('sum-dist',  Utils.fmt(distance,2));
    setText('sum-time',  Utils.formatTime(elapsed));
    setText('sum-pace',  Utils.formatPace(currentPace));
    setText('sum-hr',    SensorSim.ppg.currentHR);
    setText('sum-trimp', Utils.fmt(trimp,1));
    setText('sum-elev',  SensorSim.gps.getElevationGain());
    setText('sum-steps', SensorSim.imu.stepCount);
    setText('sum-cad',   SensorSim.imu.cadence);

    const t = window.AervinexI18n?.t || (k => k);
    App.toast(t('Sesi selesai! 🎉 Data disimpan.'), 'success', 5000);

    // Save to Firestore
    if (AERVINEXAuth.currentUser) {
      try {
        await db.collection('sessions').add({
          uid: AERVINEXAuth.currentUser.uid,
          ts: firebase.firestore.FieldValue.serverTimestamp(),
          distance: +Utils.fmt(distance,2), elapsed, targetDist,
          avgPace: Math.round(currentPace), avgHR: SensorSim.ppg.currentHR,
          trimp: +Utils.fmt(trimp,1), elevGain: SensorSim.gps.getElevationGain(),
          steps: SensorSim.imu.stepCount,
          rmssd: SensorSim.ppg.getRMSSD(), pm25: envData.pm25
        });
      } catch(e) { /* silent */ }
    }
  }

  // ── ENV FETCH — geospatial nearest-station ───────────
  async function fetchEnv(lat, lon) {
    lat = lat ?? SensorSim.gps.lat;
    lon = lon ?? SensorSim.gps.lon;
    const [w, a] = await Promise.all([Utils.fetchWeather(lat, lon), Utils.fetchAQI(lat, lon)]);
    if (w) { envData.temp = w.temp; envData.uvi = w.uvIndex || envData.uvi; envData.humidity = w.humidity ?? envData.humidity; envData.windSpeed = w.wind ?? envData.windSpeed; }
    if (a && a.pm25 !== null) { envData.pm25 = a.pm25; envData.aqi = a.aqi || envData.pm25 * 4; }
    const stLabel = a?.city ? `${a.city}${a.distKm != null ? ' · ' + a.distKm + ' km' : ''}` : 'Open-Meteo';
    envData.source = stLabel;
    const el = document.getElementById('run-env-bar');
    if (el) {
      // Security: envData.source comes from external weather/AQI API responses.
      // Build with textContent so a hostile/buggy upstream cannot inject markup.
      el.textContent = '';
      const mk = (text, cls) => {
        const s = document.createElement('span');
        if (cls) s.className = cls;
        s.textContent = text;
        return s;
      };
      el.appendChild(mk('🌡️ ' + Utils.fmt(envData.temp) + '°C'));
      el.appendChild(mk('💨 PM2.5: ' + envData.pm25 + ' μg/m³'));
      el.appendChild(mk('☀️ UV: ' + envData.uvi));
      el.appendChild(mk('📍 Stasiun: ' + envData.source, 'env-source'));
    }
  }

  // ── LIFECYCLE ────────────────────────────────────────
  const module = {
    onEnter() {
      userAge = AERVINEXAuth.userProfile?.age || 25;
      mhr     = 220 - userAge;
      restHR  = 60 + Math.round(Math.random()*12);
      SensorSim.setAge(userAge);
      initMap();
      // Use actual GPS position for both map start and nearest-station env fetch
      Utils.getGeoLocation().then(geo => {
        SensorSim.gps.lat = geo.lat;
        SensorSim.gps.lon = geo.lon;
        if (map && userMarker) {
          map.setView([geo.lat, geo.lon], 15);
          userMarker.setLatLng([geo.lat, geo.lon]);
        }
        fetchEnv(geo.lat, geo.lon).catch(()=>{});
      }).catch(() => fetchEnv().catch(()=>{}));

      // Show setup panel
      document.getElementById('run-setup').classList.remove('hidden');
      document.getElementById('run-session').classList.add('hidden');
      document.getElementById('run-summary').classList.add('hidden');

      // Bind controls
      document.getElementById('btn-run-start')?.addEventListener('click', startSession);
      document.getElementById('btn-run-pause')?.addEventListener('click', pauseSession);
      document.getElementById('btn-run-stop')?.addEventListener('click', stopSession);
      document.getElementById('btn-run-new')?.addEventListener('click', () => {
        state = 'idle';
        document.getElementById('run-setup').classList.remove('hidden');
        document.getElementById('run-summary').classList.add('hidden');
      });
    },
    onLeave() {
      clearInterval(tickInterval);
      if (state === 'active') { state = 'idle'; SensorSim.state.activityLevel = 0; }
    }
  };

  App.registerModule('running', module);
})();
