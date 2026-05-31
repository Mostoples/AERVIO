/**
 * AERVINEX Dashboard Module (Daily Monitoring Mode)
 */
(function() {
  let tickInterval  = null;
  let saveInterval  = null;
  let envData       = { pm25: 18, aqi: 72, uvi: 4, temp: 28, humidity: 72, windSpeed: 5, source: 'Simulasi' };
  let userAge       = 25;
  let restHR        = 68;
  let tickCount     = 0;
  let _teprsHistory = [];

  // ── ENV DATA — geospatial nearest-station fusion ──────
  async function fetchEnv() {
    const geo = await Utils.getGeoLocation();
    const lat = geo.lat, lon = geo.lon;

    const [weather, aqi] = await Promise.all([
      Utils.fetchWeather(lat, lon),
      Utils.fetchAQI(lat, lon)
    ]);

    if (weather) {
      envData.temp      = weather.temp;
      envData.humidity  = weather.humidity;
      envData.uvi       = weather.uvIndex   || envData.uvi;
      envData.windSpeed = weather.wind      || envData.windSpeed;
    }
    if (aqi && aqi.pm25 !== null) {
      envData.pm25 = aqi.pm25;
      envData.aqi  = aqi.aqi  || envData.pm25 * 4;
    }

    const geoTag         = geo.source === 'gps' ? '📍 GPS Aktual' : '📍 Lokasi Default';
    const stName         = aqi?.city   ?? 'Open-Meteo';
    const distTag        = aqi?.distKm != null ? ` · ${aqi.distKm} km` : '';
    envData.source       = stName + distTag;
    envData.geoLabel     = geoTag;

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
      <div class="env-source">${envData.geoLabel || '📡'} · Stasiun: ${envData.source}</div>`;
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
      elapsed: SensorSim.state.elapsed, restHR,
      aqi: envData.aqi, humidity: envData.humidity, windSpeed: envData.windSpeed,
      activityLevel: 0.05,
      userProfile: AERVINEXAuth.userProfile,
    });

    renderMetrics(raw, analysis);
    renderAlerts(raw, analysis);
    renderRecommendation(analysis.rec);
    renderCRAD(raw, analysis);
    renderXAI(raw, analysis);
    setTimestamp();

    // Save snapshot every 60s (every 20 ticks)
    if (tickCount % 20 === 0 && AERVINEXAuth.currentUser) saveSnapshot(raw, analysis);
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

  // ── ALERTS + AARC ─────────────────────────────────────
  let _lastAarcLevel = 0;
  function renderAlerts(raw, analysis) {
    const list   = document.getElementById('db-alerts');
    const count  = document.getElementById('db-alert-count');
    if (!list) return;
    const alerts = [];
    const now    = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

    if (raw.hr > 0.85 * (220 - userAge)) alerts.push({ type:'danger', icon:'❤️', title:'Detak Jantung Tinggi', msg:`HR ${raw.hr} bpm — mendekati zona bahaya.`, time: now });
    if (raw.spo2 < 94)    alerts.push({ type:'danger', icon:'🩸', title:'SpO₂ Rendah',       msg:`SpO₂ ${raw.spo2}% — risiko hipoksia.`, time: now });
    if (raw.hydration < 80) alerts.push({ type:'warn', icon:'💧', title:'Dehidrasi Menengah', msg:`Hidrasi ${Math.round(raw.hydration)}% — minum sekarang.`, time: now });
    if (raw.coreTemp > 38.5) alerts.push({ type:'danger', icon:'🌡️', title:'Suhu Inti Tinggi', msg:`Core temp ${raw.coreTemp}°C — risiko heatstroke.`, time: now });
    if (analysis.stress > 70) alerts.push({ type:'warn', icon:'🧠', title:'Stres Tinggi',     msg:`Stres index ${analysis.stress}/100 — istirahat disarankan.`, time: now });

    // TUHAM-based environmental alerts
    const tuham = Utils.getTUHAM(envData.pm25, envData.uvi, raw.coreTemp);
    if (tuham.pm25.aarc >= 2) alerts.push({ type:'danger', icon:'💨', title:`PM2.5 ${tuham.pm25.label}`, msg:`${envData.pm25} μg/m³ — ${tuham.pm25.whoNote}`, time: now });
    else if (tuham.pm25.aarc === 1) alerts.push({ type:'warn', icon:'💨', title:`PM2.5 ${tuham.pm25.label}`, msg:`${envData.pm25} μg/m³ — ${tuham.pm25.whoNote}`, time: now });
    if (tuham.uvi.aarc >= 2) alerts.push({ type:'danger', icon:'☀️', title:`UV ${tuham.uvi.label}`, msg:`UV Index ${envData.uvi} — hindari outdoor jam 10–14.`, time: now });
    else if (tuham.uvi.aarc === 1) alerts.push({ type:'warn', icon:'☀️', title:`UV ${tuham.uvi.label}`, msg:`UV Index ${envData.uvi} — gunakan sunscreen.`, time: now });

    // AARC escalation (F3) — only escalate on level change to avoid spam
    const aarcLevel = Math.max(
      raw.spo2 < 90 ? 3 : raw.spo2 < 94 ? 2 : 0,
      raw.coreTemp > 39.5 ? 3 : raw.coreTemp > 38.5 ? 2 : 0,
      tuham.maxAarc,
      raw.hr > 0.95 * (220 - userAge) ? 3 : raw.hr > 0.90 * (220 - userAge) ? 2 : 0
    );
    if (aarcLevel > _lastAarcLevel && aarcLevel >= 1) {
      const ctx = alerts.find(a => a.type === 'danger') || alerts[0] || {};
      App.escalate(aarcLevel, { title: ctx.title || 'Peringatan Kesehatan', msg: ctx.msg || '', icon: ctx.icon || '⚠️' });
    }
    _lastAarcLevel = aarcLevel;

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
    if (!AERVINEXAuth.currentUser) return;
    try {
      await db.collection('health_logs').add({
        uid: AERVINEXAuth.currentUser.uid,
        ts: firebase.firestore.FieldValue.serverTimestamp(),
        hr: raw.hr, spo2: raw.spo2, hydration: Math.round(raw.hydration),
        rmssd: raw.rmssd, skinTemp: raw.skinTemp, coreTemp: raw.coreTemp,
        eda: raw.eda, pm25: envData.pm25, uvi: envData.uvi,
        rsi: analysis.rsi, risk: analysis.risk, css: analysis.css,
        readiness: analysis.rdy
      });
    } catch (e) { /* silent */ }
  }

  // ── CRAD — Composite Risk Analyzer Dashboard (F7) ────
  function renderCRAD(raw, analysis) {
    const ml = analysis.ml;
    if (!ml) return;

    // ENV card — TEPRS result (class 0-3)
    const teprsClass  = ml.teprsAdjustedClass ?? ml.teprs?.class ?? 0;
    const teprsLabel  = ml.teprs?.label ?? '–';
    const teprsColors = ['var(--safe)', 'var(--warn)', 'var(--warn)', 'var(--danger)'];
    const teprsCls    = ['crad-safe', 'crad-warn', 'crad-warn', 'crad-danger'];
    const teprsPcts   = [10, 38, 68, 92];
    setCRADCard('env', teprsLabel, teprsLabel, teprsPcts[teprsClass], teprsColors[teprsClass], teprsCls[teprsClass]);

    // CARDIAC card — based on recovery score or HRV score
    const rrss         = ml.rrss;
    const cardiacRisk  = rrss ? (100 - rrss.recovery_score) : Math.round(100 - analysis.hrvSc);
    const cardiacColor = cardiacRisk < 30 ? 'var(--safe)' : cardiacRisk < 60 ? 'var(--warn)' : 'var(--danger)';
    const cardiacCls   = cardiacRisk < 30 ? 'crad-safe'   : cardiacRisk < 60 ? 'crad-warn'   : 'crad-danger';
    const cardiacLabel = cardiacRisk < 30 ? 'Baik'        : cardiacRisk < 60 ? 'Waspada'     : 'Berisiko';
    setCRADCard('cardiac', Math.round(cardiacRisk), cardiacLabel, cardiacRisk, cardiacColor, cardiacCls);

    // RESPIRATORY card — RSI
    const rsiScore  = analysis.rsi;
    const rsiColor  = rsiScore < 30 ? 'var(--safe)' : rsiScore < 60 ? 'var(--warn)' : 'var(--danger)';
    const rsiCls    = rsiScore < 30 ? 'crad-safe'   : rsiScore < 60 ? 'crad-warn'   : 'crad-danger';
    const rsiLabel  = rsiScore < 30 ? 'Normal'      : rsiScore < 60 ? 'Sedang'      : 'Tinggi';
    setCRADCard('resp', rsiScore, rsiLabel, rsiScore, rsiColor, rsiCls);

    // THERMAL card — HSI
    const hsiScore  = analysis.hsi;
    const hsiColor  = hsiScore < 30 ? 'var(--safe)' : hsiScore < 60 ? 'var(--warn)' : 'var(--danger)';
    const hsiCls    = hsiScore < 30 ? 'crad-safe'   : hsiScore < 60 ? 'crad-warn'   : 'crad-danger';
    const hsiLabel  = hsiScore < 30 ? 'Aman'        : hsiScore < 60 ? 'Panas'       : 'Berbahaya';
    setCRADCard('thermal', hsiScore, hsiLabel, hsiScore, hsiColor, hsiCls);

    // TEPRS Trend sparkline
    _teprsHistory.push(teprsClass);
    if (_teprsHistory.length > 30) _teprsHistory.shift();
    drawTEPRSTrend();

    // MCD context badge
    const mcd = ml.mcd;
    const mcdBadge = document.getElementById('crad-mcd-badge');
    if (mcdBadge) mcdBadge.textContent = mcd?.label ?? '–';
    const mcdCtx = document.getElementById('crad-mcd-ctx');
    if (mcdCtx) mcdCtx.textContent = mcd?.context ?? '–';
    const teprsClassEl = document.getElementById('crad-teprs-class');
    if (teprsClassEl) {
      teprsClassEl.textContent = `${teprsClass} — ${teprsLabel}`;
      teprsClassEl.style.color = teprsColors[teprsClass];
    }

    // AIRE recommendations
    const recs = ml.recommendations || [];
    const recsEl = document.getElementById('crad-recs');
    if (recsEl) {
      recsEl.innerHTML = recs.length > 0
        ? recs.map(r => `<div class="crad-rec-item"><span class="crad-rec-icon">${r.icon}</span><span>${r.msg}</span></div>`).join('')
        : '<div class="text-sm text-muted">Kondisi normal — tidak ada rekomendasi khusus.</div>';
    }
  }

  function setCRADCard(id, score, label, pct, color, cssClass) {
    const card    = document.getElementById('crad-' + id);
    const scoreEl = document.getElementById('crad-' + id + '-score');
    const badgeEl = document.getElementById('crad-' + id + '-badge');
    const barEl   = document.getElementById('crad-' + id + '-bar');
    if (!card) return;
    if (scoreEl) { scoreEl.textContent = score; scoreEl.style.color = color; }
    if (badgeEl) {
      badgeEl.textContent = label;
      badgeEl.className   = 'crad-badge ' + (cssClass === 'crad-safe' ? 'cs' : cssClass === 'crad-warn' ? 'cw' : 'cd');
    }
    if (barEl) { barEl.style.width = Utils.clamp(pct, 0, 100) + '%'; barEl.style.background = color; }
    card.className = 'crad-card ' + cssClass;
  }

  function drawTEPRSTrend() {
    const canvas = document.getElementById('crad-teprs-canvas');
    if (!canvas || _teprsHistory.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth  || 300;
    const h   = 72;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const colors = ['#22C55E', '#F59E0B', '#F97316', '#EF4444'];
    const n  = _teprsHistory.length;
    const dx = w / Math.max(n - 1, 1);

    // Gradient fill
    const lastColor = colors[_teprsHistory[n-1]];
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, lastColor + '44');
    grad.addColorStop(1, lastColor + '00');

    ctx.beginPath();
    _teprsHistory.forEach((v, i) => {
      const x = i * dx;
      const y = h - (v / 3) * (h - 12) - 6;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lastColor;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Fill under line
    const last = _teprsHistory.length - 1;
    ctx.lineTo(last * dx, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Dots
    _teprsHistory.forEach((v, i) => {
      const x = i * dx;
      const y = h - (v / 3) * (h - 12) - 6;
      ctx.beginPath();
      ctx.arc(x, y, i === last ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors[v];
      ctx.fill();
    });
  }

  // ── XAI-M — Feature Contribution Explanation (F12) ───
  function renderXAI(raw, analysis) {
    if (typeof XAI === 'undefined') return;
    const contribs = XAI.explain(raw, envData, analysis);
    XAI.render(document.getElementById('xai-container'), contribs, 6);
    const sumEl = document.getElementById('xai-summary-line');
    if (sumEl) sumEl.textContent = XAI.summarize(contribs);
  }

  // ── GREET ─────────────────────────────────────────────
  function setGreeting() {
    const h = new Date().getHours();
    const g = h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 19 ? 'Selamat Sore' : 'Selamat Malam';
    const name = AERVINEXAuth.userProfile?.name?.split(' ')[0] || '';
    const el = document.getElementById('db-greeting');
    if (el) el.textContent = `${g}, ${name} 👋`;
    const dt = document.getElementById('db-date');
    if (dt) dt.textContent = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  // ── LIFECYCLE ────────────────────────────────────────
  const module = {
    onEnter() {
      userAge = AERVINEXAuth.userProfile?.age || 25;
      restHR  = 60 + Math.round(Math.random()*12);
      _lastAarcLevel = 0;
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
