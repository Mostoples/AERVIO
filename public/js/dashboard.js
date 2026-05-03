/**
 * AERVIO Dashboard Module (Daily Monitoring Mode)
 */
(function() {
  let tickInterval = null;
  let saveInterval = null;
  let envData      = { pm25: 18, uvi: 4, temp: 28, humidity: 72, source: 'Simulasi' };
  let userAge      = 25;
  let restHR       = 68;
  let tickCount    = 0;

  // ── ENV DATA (Open-Meteo + WAQI) ─────────────────────
  async function fetchEnv() {
    const lat = -6.2088, lon = 106.8456; // Jakarta default
    const [weather, aqi] = await Promise.all([
      Utils.fetchWeather(lat, lon),
      Utils.fetchAQI(lat, lon)
    ]);
    if (weather) {
      envData.temp     = weather.temp;
      envData.humidity = weather.humidity;
      envData.uvi      = weather.uvIndex || envData.uvi;
      envData.source   = 'Open-Meteo';
    }
    if (aqi && aqi.pm25 !== null) {
      envData.pm25   = aqi.pm25;
      envData.source = 'WAQI + Open-Meteo';
    }
    renderEnvBar();
  }

  function renderEnvBar() {
    const bar = document.getElementById('db-env-bar');
    if (!bar) return;
    const pm25s = Utils.getPM25Status(envData.pm25);
    const uvs   = Utils.getUVStatus(envData.uvi);
    bar.innerHTML = `
      <span class="env-item"><span>🌡️</span><span class="env-val">${Utils.fmt(envData.temp)}°C</span><span class="env-lbl">Suhu</span></span>
      <div class="env-divider"></div>
      <span class="env-item"><span>💧</span><span class="env-val">${envData.humidity}%</span><span class="env-lbl">Lembab</span></span>
      <div class="env-divider"></div>
      <span class="env-item"><span>💨</span><span class="env-val" style="color:${pm25s.color}">${Utils.fmt(envData.pm25,1)}</span><span class="env-lbl">PM2.5 μg/m³</span></span>
      <div class="env-divider"></div>
      <span class="env-item"><span>☀️</span><span class="env-val" style="color:${uvs.color}">${envData.uvi}</span><span class="env-lbl">UV Index</span></span>
      <div class="env-source">📡 ${envData.source}</div>`;
  }

  // ── TICK (every 3s) ──────────────────────────────────
  function tick() {
    tickCount++;
    SensorSim.state.elapsed += 3;
    SensorSim.state.stressLevel = 0.15 + Math.sin(tickCount * 0.05) * 0.1;

    const raw = SensorSim.tick({
      phase: 'rest', activityLevel: 0.05, stressLevel: SensorSim.state.stressLevel
    });

    // Simulate slow hydration drain
    SensorSim.state.dehydration = Utils.clamp(SensorSim.state.dehydration + 0.0002, 0, 0.35);

    const hrPct = raw.hr / (220 - userAge);
    const analysis = HealthEngine.analyze(raw, {
      age: userAge, pm25: envData.pm25, uvi: envData.uvi,
      ambientTemp: envData.temp, paceSecPerKm: null,
      elapsed: SensorSim.state.elapsed, restHR
    });

    renderMetrics(raw, analysis);
    renderAlerts(raw, analysis);
    renderRecommendation(analysis.rec);
    setTimestamp();

    // Save snapshot every 60s (every 20 ticks)
    if (tickCount % 20 === 0 && AervioAuth.currentUser) saveSnapshot(raw, analysis);
  }

  // ── RENDER METRICS ───────────────────────────────────
  function renderMetrics(raw, analysis) {
    const age   = userAge;
    const mhr   = 220 - age;

    // Heart Rate
    const hrs = Utils.getHRStatus(raw.hr, age);
    setMetric('hr', raw.hr, 'bpm', hrs.status, hrs.label, raw.hr/mhr*100);

    // SpO2
    const ss = Utils.getSpO2Status(raw.spo2);
    setMetric('spo2', Utils.fmt(raw.spo2,1), '%', ss.status, ss.label, raw.spo2);

    // Hydration
    const hs = Utils.getHydrationStatus(raw.hydration);
    setMetric('hydration', Math.round(raw.hydration), '%', hs.status, hs.label, raw.hydration);

    // PM2.5 (from env)
    const ps = Utils.getPM25Status(envData.pm25);
    setMetric('pm25', Utils.fmt(envData.pm25,1), 'μg/m³', ps.status, ps.label, ps.pct);

    // UV
    const us = Utils.getUVStatus(envData.uvi);
    setMetric('uvi', envData.uvi, '', us.status, us.label, envData.uvi / 11 * 100);

    // Skin Temp
    const ts = Utils.getTempStatus(raw.coreTemp);
    setMetric('temp', Utils.fmt(raw.coreTemp,1), '°C', ts.status, ts.label, (raw.coreTemp - 35) / 7 * 100);

    // HRV
    document.getElementById('db-rmssd').textContent = Utils.fmt(raw.rmssd,1);
    document.getElementById('db-sdnn').textContent  = Utils.fmt(raw.sdnn,1);
    document.getElementById('db-hrv-score').textContent = analysis.hrvSc;
    document.getElementById('db-hrv-bar').style.width = analysis.hrvSc + '%';
    document.getElementById('db-hrv-bar').style.background = analysis.hrvSc > 65 ? 'var(--safe)' : analysis.hrvSc > 35 ? 'var(--warn)' : 'var(--danger)';

    // EDA / Stress
    document.getElementById('db-eda').textContent   = Utils.fmt(raw.eda,2);
    document.getElementById('db-css').textContent   = analysis.css;
    document.getElementById('db-stress').textContent = analysis.stress;

    // Core temp
    document.getElementById('db-core-temp').textContent = Utils.fmt(raw.coreTemp,1);

    // RSI gauge
    setGauge('rsi', analysis.rsi, getGaugeColor(analysis.rsi));

    // Health risk gauge
    setGauge('risk', analysis.risk, getGaugeColor(analysis.risk));

    // Recovery
    document.getElementById('db-readiness').textContent = Utils.fmt(analysis.rdy,1);
    const rdyColor = analysis.rdy >= 7 ? 'var(--safe)' : analysis.rdy >= 5 ? 'var(--warn)' : 'var(--danger)';
    document.getElementById('db-readiness').style.color = rdyColor;

    // VO2max
    document.getElementById('db-vo2max').textContent = analysis.vo2max;

    // Resp rate
    document.getElementById('db-resprate').textContent = raw.respRate;

    // Autonomic balance
    document.getElementById('db-autonom').textContent = analysis.autonom;
  }

  function setMetric(id, value, unit, status, label, barPct) {
    const card = document.getElementById('db-card-' + id);
    const val  = document.getElementById('db-val-' + id);
    const badge= document.getElementById('db-badge-' + id);
    const bar  = document.getElementById('db-bar-' + id);
    if (!card) return;
    if (val)  val.textContent  = value;
    if (badge) {
      badge.textContent  = label;
      badge.className    = 'metric-badge ' + Utils.statusToBadgeClass(status);
    }
    card.className = 'metric-card ' + Utils.statusToCardClass(status);
    const glows = { safe: 'mg-safe', warn: 'mg-warn', danger: 'mg-danger' };
    const glow = card.querySelector('.metric-glow');
    if (glow) glow.className = 'metric-glow ' + (glows[status] || 'mg-safe');
    if (bar) {
      bar.style.width = Utils.clamp(barPct, 0, 100) + '%';
      bar.style.background = status === 'safe' ? 'var(--safe)' : status === 'warn' ? 'var(--warn)' : 'var(--danger)';
    }
  }

  function setGauge(id, value, color) {
    const fill  = document.getElementById('gauge-fill-' + id);
    const valEl = document.getElementById('gauge-val-' + id);
    if (fill)  { fill.style.strokeDashoffset = Utils.gaugeOffset(value); fill.style.stroke = color; }
    if (valEl) { valEl.textContent = value; valEl.style.color = color; }
  }

  function getGaugeColor(val) {
    if (val < 30) return 'var(--safe)';
    if (val < 60) return 'var(--warn)';
    return 'var(--danger)';
  }

  // ── ALERTS ───────────────────────────────────────────
  function renderAlerts(raw, analysis) {
    const list   = document.getElementById('db-alerts');
    const count  = document.getElementById('db-alert-count');
    if (!list) return;
    const alerts = [];
    const now    = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

    if (raw.hr > 0.85 * (220 - userAge)) alerts.push({ type:'danger', icon:'❤️', title:'Detak Jantung Tinggi', msg:`HR ${raw.hr} bpm — mendekati zona bahaya.`, time: now });
    if (raw.spo2 < 94)   alerts.push({ type:'danger', icon:'🩸', title:'SpO₂ Rendah', msg:`SpO₂ ${raw.spo2}% — risiko hipoksia.`, time: now });
    if (envData.pm25 > 15) alerts.push({ type:'warn', icon:'💨', title:'Polusi Tinggi', msg:`PM2.5 ${envData.pm25} μg/m³ — batasi aktivitas luar.`, time: now });
    if (envData.uvi > 7)   alerts.push({ type:'warn', icon:'☀️', title:'UV Berbahaya', msg:`UV Index ${envData.uvi} — gunakan sunscreen & hindari jam 10–16.`, time: now });
    if (raw.hydration < 80) alerts.push({ type:'warn', icon:'💧', title:'Dehidrasi Menengah', msg:`Hidrasi ${Math.round(raw.hydration)}% — minum sekarang.`, time: now });
    if (raw.coreTemp > 38.5) alerts.push({ type:'danger', icon:'🌡️', title:'Suhu Inti Tinggi', msg:`Core temp ${raw.coreTemp}°C — risiko heatstroke.`, time: now });
    if (analysis.stress > 70) alerts.push({ type:'warn', icon:'🧠', title:'Stres Tinggi', msg:`Stres index ${analysis.stress}/100 — istirahat disarankan.`, time: now });

    count.textContent = alerts.length === 0 ? '✅ Aman' : `${alerts.length} peringatan`;
    count.className   = 'metric-badge ' + (alerts.length === 0 ? 'b-safe' : alerts.some(a=>a.type==='danger') ? 'b-danger' : 'b-warn');

    if (alerts.length === 0) {
      list.innerHTML = `<div class="alert-item alert-safe"><span class="alert-icon">✅</span><div class="alert-txt"><div class="alert-title-t">Semua Aman</div><div class="alert-msg">Semua metrik kesehatan dalam batas normal.</div></div></div>`;
      return;
    }
    list.innerHTML = alerts.map(a => `
      <div class="alert-item alert-${a.type}">
        <span class="alert-icon">${a.icon}</span>
        <div class="alert-txt"><div class="alert-title-t">${a.title}</div><div class="alert-msg">${a.msg}</div></div>
        <span class="alert-time">${a.time}</span>
      </div>`).join('');
  }

  // ── RECOMMENDATION ───────────────────────────────────
  function renderRecommendation(rec) {
    const el = document.getElementById('db-rec-banner');
    if (!el || !rec) return;
    el.style.background = rec.color === 'var(--safe)' ? 'var(--safe-d)' : rec.color === 'var(--warn)' ? 'var(--warn-d)' : 'var(--danger-d)';
    el.style.borderColor = rec.color;
    el.innerHTML = `<span style="font-size:1.4rem">${rec.icon}</span><div><strong style="color:${rec.color}">${rec.title}</strong><br><small style="color:var(--t2)">${rec.msg}</small></div>`;
  }

  function setTimestamp() {
    const el = document.getElementById('db-timestamp');
    if (el) el.textContent = 'Diperbarui ' + new Date().toLocaleTimeString('id-ID');
  }

  // ── FIRESTORE SAVE ────────────────────────────────────
  async function saveSnapshot(raw, analysis) {
    if (!AervioAuth.currentUser) return;
    try {
      await db.collection('health_logs').add({
        uid: AervioAuth.currentUser.uid,
        ts: firebase.firestore.FieldValue.serverTimestamp(),
        hr: raw.hr, spo2: raw.spo2, hydration: Math.round(raw.hydration),
        rmssd: raw.rmssd, skinTemp: raw.skinTemp, coreTemp: raw.coreTemp,
        eda: raw.eda, pm25: envData.pm25, uvi: envData.uvi,
        rsi: analysis.rsi, risk: analysis.risk, css: analysis.css,
        readiness: analysis.rdy
      });
    } catch (e) { /* silent */ }
  }

  // ── GREET ─────────────────────────────────────────────
  function setGreeting() {
    const h = new Date().getHours();
    const g = h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 19 ? 'Selamat Sore' : 'Selamat Malam';
    const name = AervioAuth.userProfile?.name?.split(' ')[0] || '';
    const el = document.getElementById('db-greeting');
    if (el) el.textContent = `${g}, ${name} 👋`;
    const dt = document.getElementById('db-date');
    if (dt) dt.textContent = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  // ── LIFECYCLE ────────────────────────────────────────
  const module = {
    onEnter() {
      userAge = AervioAuth.userProfile?.age || 25;
      restHR  = 60 + Math.round(Math.random()*12);
      setGreeting();
      fetchEnv().catch(() => renderEnvBar());
      SensorSim.setAge(userAge);
      // Pre-fill RRI history with realistic resting values
      for (let i = 0; i < 20; i++) SensorSim.ppg.nextRRI(0.2, 0.05);
      tick();
      tickInterval = setInterval(tick, 3000);
      // Refresh env every 10 minutes
      saveInterval = setInterval(() => fetchEnv().catch(()=>{}), 600000);
    },
    onLeave() {
      clearInterval(tickInterval);
      clearInterval(saveInterval);
    }
  };

  App.registerModule('dashboard', module);
})();
