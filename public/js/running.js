/**
 * AERVIO Running Mode Module
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
  let envData       = { pm25: 18, uvi: 4, temp: 28, source: 'Simulasi' };
  let map           = null;
  let routeLine     = null;
  let userMarker    = null;
  let routeCoords   = [];
  let phaseHistory  = { warmup:[], steady:[], push:[], cooldown:[] };

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

    // Recommended pace for current phase
    const recPace = phaseRecommendedPace(phase, basePace);
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
      elapsed, restHR
    });
    const imu = SensorSim.imu;

    // Update UI
    renderRunStats(raw, analysis, imu);
    renderPhaseBar(phase);
    renderGait(imu, analysis);
    renderRunAlerts(raw, analysis, imu);
    renderPaceRec(phase, recPace, analysis);
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
    const msgs = { warmup:'🏃 Fase Warm-Up dimulai — pemanasan pelan.', steady:'💪 Fase Steady — pertahankan pace target.', push:'🔥 Fase Push — tingkatkan kecepatan!', cooldown:'🌬️ Fase Cooldown — turunkan kecepatan.' };
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
      nameEl.textContent = { warmup:'Warm-Up 🔵', steady:'Steady ✅', push:'Push 🔥', cooldown:'Cooldown 🌬️' }[phase] || '--';
      nameEl.className   = `phase-name ph-${phase}`;
    }
    const pctEl = document.getElementById('run-phase-pct');
    if (pctEl) pctEl.textContent = Utils.fmt(distance/targetDist*100,0) + '% selesai';
    const distRemEl = document.getElementById('run-dist-rem');
    if (distRemEl) distRemEl.textContent = Utils.fmt(Math.max(0, targetDist - distance),2) + ' km lagi';
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
    const alerts = [];
    if (raw.hr > 0.88 * mhr)          alerts.push({ t:'danger', msg:`❤️ HR ${raw.hr} bpm — TURUNKAN PACE!` });
    if (raw.spo2 < 93)                 alerts.push({ t:'danger', msg:`🩸 SpO₂ ${raw.spo2}% — BERHENTI, cari bantuan!` });
    if (raw.hydration < 75)            alerts.push({ t:'warn',   msg:`💧 Hidrasi ${Math.round(raw.hydration)}% — MINUM SEKARANG!` });
    if (raw.coreTemp > 38.5)           alerts.push({ t:'danger', msg:`🌡️ Core ${raw.coreTemp}°C — Risiko Heatstroke!` });
    if (analysis.lactat > 80)          alerts.push({ t:'warn',   msg:`⚡ Near Lactate Threshold — kurangi kecepatan.` });
    if (imu && imu.asymmetry > 8)      alerts.push({ t:'warn',   msg:`⚖️ Asimetri gait ${Utils.fmt(imu.asymmetry,1)}% — cek kelelahan.` });
    if (envData.pm25 > 25)             alerts.push({ t:'warn',   msg:`💨 PM2.5 ${envData.pm25} μg/m³ — pertimbangkan rerouting.` });
    if (analysis.nmf > 65)             alerts.push({ t:'warn',   msg:`🦵 Neuromuscular fatigue ${analysis.nmf}/100 — turunkan pace.` });
    list.innerHTML = alerts.length === 0
      ? '<div class="alert-item alert-safe"><span class="alert-icon">✅</span><div class="alert-txt"><div class="alert-title-t">Semua Aman</div></div></div>'
      : alerts.map(a => `<div class="alert-item alert-${a.t}"><span class="alert-icon">${a.t==='danger'?'🚨':'⚠️'}</span><div class="alert-txt"><div class="alert-title-t">${a.msg}</div></div></div>`).join('');
  }

  function renderPaceRec(phase, recPace, analysis) {
    const el = document.getElementById('run-pace-rec');
    if (!el) return;
    const rec = analysis.rec;
    el.innerHTML = `<span class="pace-rec-icon">${rec.icon}</span><span><strong style="color:${rec.color}">${rec.title}</strong> — Pace target: <strong style="color:var(--green)">${Utils.formatPace(recPace)}</strong>/km</span>`;
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── SESSION CONTROLS ─────────────────────────────────
  function startSession() {
    if (state === 'active') return;
    // Reset
    elapsed = 0; distance = 0; lastPhase = null;
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
    App.toast('Sesi lari dimulai! 🏃', 'success', 3000);
  }

  function pauseSession() {
    if (state === 'active') {
      state = 'paused';
      SensorSim.state.activityLevel = 0;
      document.getElementById('btn-run-pause').textContent = '▶️';
      document.getElementById('btn-run-pause').title = 'Lanjutkan';
    } else if (state === 'paused') {
      state = 'active';
      SensorSim.state.activityLevel = 0.75;
      document.getElementById('btn-run-pause').textContent = '⏸️';
      document.getElementById('btn-run-pause').title = 'Jeda';
    }
  }

  function stopSession() {
    if (!confirm('Hentikan sesi lari?')) return;
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

    App.toast('Sesi selesai! 🎉 Data disimpan.', 'success', 5000);

    // Save to Firestore
    if (AervioAuth.currentUser) {
      try {
        await db.collection('sessions').add({
          uid: AervioAuth.currentUser.uid,
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
    if (w) { envData.temp = w.temp; envData.uvi = w.uvIndex || envData.uvi; }
    if (a && a.pm25 !== null) envData.pm25 = a.pm25;
    const stLabel = a?.city ? `${a.city}${a.distKm != null ? ' · ' + a.distKm + ' km' : ''}` : 'Open-Meteo';
    envData.source = stLabel;
    const el = document.getElementById('run-env-bar');
    if (el) el.innerHTML = `<span>🌡️ ${Utils.fmt(envData.temp)}°C</span><span>💨 PM2.5: ${envData.pm25} μg/m³</span><span>☀️ UV: ${envData.uvi}</span><span class="env-source">📍 Stasiun: ${envData.source}</span>`;
  }

  // ── LIFECYCLE ────────────────────────────────────────
  const module = {
    onEnter() {
      userAge = AervioAuth.userProfile?.age || 25;
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
