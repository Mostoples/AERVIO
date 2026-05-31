/**
 * AERVINEX Recovery Module
 */
(function() {
  let tickInterval = null;
  let chart = null;
  let rmssdHistory = [];
  let cssHistory   = [];
  let labels       = [];
  let userAge      = 25;
  let ticks        = 0;

  function initChart() {
    const ctx = document.getElementById('rec-hrv-chart');
    if (!ctx || !window.Chart) return;
    if (chart) { chart.destroy(); }
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label:'RMSSD (ms)', data: rmssdHistory, borderColor:'#00E5A0', backgroundColor:'rgba(0,229,160,.08)', tension:.4, pointRadius:2, fill:true },
          { label:'CSS Score',  data: cssHistory,   borderColor:'#F59E0B', backgroundColor:'rgba(245,158,11,.06)', tension:.4, pointRadius:2, fill:true }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        animation:false,
        plugins:{ legend:{ labels:{ color:'#8BA0B8', font:{size:11} } } },
        scales:{
          x:{ ticks:{ color:'#3F5570', maxTicksLimit:8 }, grid:{ color:'rgba(255,255,255,.04)' } },
          y:{ ticks:{ color:'#3F5570' }, grid:{ color:'rgba(255,255,255,.04)' } }
        }
      }
    });
  }

  function tick() {
    ticks++;
    SensorSim.state.stressLevel  = 0.15 + Math.sin(ticks * 0.08) * 0.08;
    SensorSim.state.activityLevel = 0.02;
    const raw = SensorSim.tick({});

    const analysis = HealthEngine.analyze(raw, {
      age: userAge, pm25: 12, uvi: 3, ambientTemp: 27,
      paceSecPerKm: null, elapsed: ticks * 3, restHR: 65,
      aqi: 48, humidity: 70, windSpeed: 3,
      activityLevel: 0.02,
      userProfile: AERVINEXAuth.userProfile,
    });

    // Readiness
    const rdy = analysis.rdy;
    const rdyEl = document.getElementById('rec-readiness-score');
    if (rdyEl) {
      rdyEl.textContent = Utils.fmt(rdy, 1);
      rdyEl.className   = 'readiness-score ' + (rdy >= 7 ? 'rs-high' : rdy >= 5 ? 'rs-mid' : 'rs-low');
    }
    const rdyLbl = document.getElementById('rec-readiness-label');
    const rdySub  = document.getElementById('rec-readiness-sub');
    if (rdy >= 8) {
      if (rdyLbl) rdyLbl.textContent = 'Siap Penuh';
      if (rdySub) rdySub.textContent = 'HRV optimal, detak istirahat baik. Lanjutkan latihan intensitas tinggi hari ini.';
    } else if (rdy >= 6) {
      if (rdyLbl) rdyLbl.textContent = 'Siap Sedang';
      if (rdySub) rdySub.textContent = 'Kondisi baik untuk latihan moderat. Hindari overtraining.';
    } else if (rdy >= 4) {
      if (rdyLbl) rdyLbl.textContent = 'Pemulihan Aktif';
      if (rdySub) rdySub.textContent = 'HRV rendah. Disarankan latihan ringan, yoga, atau istirahat.';
    } else {
      if (rdyLbl) rdyLbl.textContent = 'Butuh Istirahat';
      if (rdySub) rdySub.textContent = 'Tubuh perlu recovery penuh. Hindari latihan berat hari ini.';
    }

    // Metrics
    setRec('rec-rmssd',     Utils.fmt(raw.rmssd,1),    'ms');
    setRec('rec-sdnn',      Utils.fmt(raw.sdnn,1),     'ms');
    setRec('rec-hrv-score', analysis.hrvSc,             '/100');
    setRec('rec-css',       analysis.css,               '/100');
    setRec('rec-stress',    analysis.stress,             '/100');
    setRec('rec-autonom',   analysis.autonom,            '/100');
    setRec('rec-rhr',       raw.hr,                     'bpm');
    setRec('rec-core',      Utils.fmt(raw.coreTemp,1),  '°C');
    setRec('rec-eda',       Utils.fmt(raw.eda,2),       'μS');
    setRec('rec-symp',      raw.sympathetic || analysis.css, '/100');
    setRec('rec-thermoeff', raw.thermoEff || 85,         '%');
    setRec('rec-resp',      raw.respRate,                'bpm');

    // Training rec
    const recEl = document.getElementById('rec-training-rec');
    if (recEl) {
      recEl.style.borderColor = analysis.rec.color;
      recEl.innerHTML = `<span style="font-size:1.6rem">${analysis.rec.icon}</span><div><strong style="color:${analysis.rec.color}">${analysis.rec.title}</strong><br><span style="color:var(--t2);font-size:.85rem">${analysis.rec.msg}</span></div>`;
    }

    // VO2max
    setRec('rec-vo2max', analysis.vo2max, 'ml/kg/min');

    // Update chart
    if (ticks % 5 === 0) {
      const now = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      labels.push(now);
      rmssdHistory.push(+Utils.fmt(raw.rmssd,1));
      cssHistory.push(analysis.css);
      if (labels.length > 30) { labels.shift(); rmssdHistory.shift(); cssHistory.shift(); }
      if (chart) chart.update();
    }
  }

  function setRec(id, val, unit) {
    const el = document.getElementById(id);
    if (el) el.textContent = val + (unit ? ' ' + unit : '');
  }

  const module = {
    onEnter() {
      userAge = AERVINEXAuth.userProfile?.age || 25;
      SensorSim.setAge(userAge);
      for (let i=0; i<20; i++) SensorSim.ppg.nextRRI(0.15, 0.02); // calm down
      setTimeout(() => initChart(), 100);
      tick();
      tickInterval = setInterval(tick, 5000);
    },
    onLeave() { clearInterval(tickInterval); }
  };

  App.registerModule('recovery', module);
})();
