/**
 * AERVIO History & Analytics Module
 */
(function() {
  let hrChart    = null;
  let loadChart  = null;
  let userAge    = 25;
  let sessions   = [];

  async function loadSessions() {
    if (!AervioAuth.currentUser) return;
    const el = document.getElementById('hist-loading');
    if (el) el.style.display = 'flex';
    try {
      const snap = await db.collection('sessions')
        .where('uid','==', AervioAuth.currentUser.uid)
        .orderBy('ts','desc').limit(20).get();
      sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      sessions = generateMockSessions();
    }
    if (el) el.style.display = 'none';
    renderSummary();
    renderTable();
    renderCharts();
  }

  function generateMockSessions() {
    const now = Date.now();
    return Array.from({ length: 8 }, (_, i) => ({
      id: 'mock-' + i,
      distance:  +(3 + Math.random()*7).toFixed(2),
      elapsed:   Math.round((1200 + Math.random()*3600)),
      avgPace:   Math.round(300 + Math.random()*180),
      avgHR:     Math.round(130 + Math.random()*40),
      trimp:     +(20 + Math.random()*80).toFixed(1),
      elevGain:  Math.round(Math.random()*120),
      steps:     Math.round(3000 + Math.random()*8000),
      rmssd:     +(20 + Math.random()*40).toFixed(1),
      pm25:      +(8 + Math.random()*25).toFixed(1),
      ts:        { toDate: () => new Date(now - i * 86400000) }
    }));
  }

  function renderSummary() {
    const totalDist = sessions.reduce((s,x) => s + (x.distance||0), 0);
    const totalTime = sessions.reduce((s,x) => s + (x.elapsed||0), 0);
    const avgHR     = sessions.length ? Math.round(sessions.reduce((s,x)=>s+(x.avgHR||0),0)/sessions.length) : 0;
    const avgPM25   = sessions.length ? +(sessions.reduce((s,x)=>s+(x.pm25||0),0)/sessions.length).toFixed(1) : 0;
    const totalTrimp= +(sessions.reduce((s,x)=>s+(x.trimp||0),0)).toFixed(0);

    setText('h-total-dist',  Utils.fmt(totalDist,1) + ' km');
    setText('h-total-time',  Utils.formatTime(totalTime));
    setText('h-sessions',    sessions.length);
    setText('h-avg-hr',      avgHR + ' bpm');
    setText('h-avg-pm25',    avgPM25 + ' μg/m³');
    setText('h-trimp-total', totalTrimp);
  }

  function renderTable() {
    const tbody = document.getElementById('hist-tbody');
    if (!tbody) return;
    if (sessions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--t3);padding:30px">Belum ada sesi lari. Mulai berlari!</td></tr>';
      return;
    }
    tbody.innerHTML = sessions.map(s => {
      const date = s.ts?.toDate ? s.ts.toDate().toLocaleDateString('id-ID',{day:'numeric',month:'short'}) : '--';
      const pm25s = Utils.getPM25Status(s.pm25 || 0);
      const hrPct = (s.avgHR || 0) / (220 - userAge);
      const hrStatus = hrPct > 0.85 ? 'danger' : hrPct > 0.70 ? 'warn' : 'safe';
      return `<tr>
        <td><strong>${date}</strong></td>
        <td>${Utils.fmt(s.distance||0,2)} km</td>
        <td>${Utils.formatTime(s.elapsed||0)}</td>
        <td>${Utils.formatPace(s.avgPace||360)}/km</td>
        <td style="color:${hrStatus==='danger'?'var(--danger)':hrStatus==='warn'?'var(--warn)':'var(--safe)'}">${s.avgHR||'--'} bpm</td>
        <td style="color:${pm25s.color}">${Utils.fmt(s.pm25||0,1)} <small>μg/m³</small></td>
        <td>${Utils.fmt(s.trimp||0,0)}</td>
      </tr>`;
    }).join('');
  }

  function renderCharts() {
    if (!window.Chart) return;
    // Reverse for chronological order
    const rev = [...sessions].reverse();
    const dates   = rev.map(s => s.ts?.toDate ? s.ts.toDate().toLocaleDateString('id-ID',{day:'numeric',month:'short'}) : '--');
    const hrs     = rev.map(s => s.avgHR || 0);
    const dists   = rev.map(s => s.distance || 0);
    const trimps  = rev.map(s => s.trimp || 0);
    const pm25s   = rev.map(s => s.pm25 || 0);

    // HR Chart
    const hrCtx = document.getElementById('hist-hr-chart');
    if (hrCtx) {
      if (hrChart) hrChart.destroy();
      hrChart = new Chart(hrCtx, {
        type:'bar',
        data:{
          labels: dates,
          datasets:[
            { label:'Avg HR (bpm)', data:hrs, backgroundColor:'rgba(0,229,160,.55)', borderColor:'#00E5A0', borderWidth:1, borderRadius:4 },
            { label:'Training Load (TRIMP)', data:trimps, backgroundColor:'rgba(245,158,11,.45)', borderColor:'#F59E0B', borderWidth:1, borderRadius:4, yAxisID:'y1' }
          ]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ labels:{ color:'#8BA0B8', font:{size:11} } } },
          scales:{
            x:{ ticks:{ color:'#3F5570' }, grid:{ color:'rgba(255,255,255,.04)' } },
            y:{ ticks:{ color:'#3F5570' }, grid:{ color:'rgba(255,255,255,.05)' }, title:{ display:true, text:'HR (bpm)', color:'#3F5570' } },
            y1:{ position:'right', ticks:{ color:'#3F5570' }, grid:{ display:false }, title:{ display:true, text:'TRIMP', color:'#3F5570' } }
          }
        }
      });
    }

    // Distance + PM2.5 Chart
    const ldCtx = document.getElementById('hist-load-chart');
    if (ldCtx) {
      if (loadChart) loadChart.destroy();
      loadChart = new Chart(ldCtx, {
        type:'line',
        data:{
          labels: dates,
          datasets:[
            { label:'Jarak (km)', data:dists, borderColor:'#38BDF8', backgroundColor:'rgba(56,189,248,.08)', tension:.4, pointRadius:3, fill:true },
            { label:'PM2.5 (μg/m³)', data:pm25s, borderColor:'#EF4444', backgroundColor:'rgba(239,68,68,.06)', tension:.4, pointRadius:3, fill:true, yAxisID:'y1', borderDash:[4,4] }
          ]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ labels:{ color:'#8BA0B8', font:{size:11} } } },
          scales:{
            x:{ ticks:{ color:'#3F5570' }, grid:{ color:'rgba(255,255,255,.04)' } },
            y:{ ticks:{ color:'#3F5570' }, grid:{ color:'rgba(255,255,255,.05)' }, title:{ display:true, text:'Jarak (km)', color:'#3F5570' } },
            y1:{ position:'right', ticks:{ color:'#3F5570' }, grid:{ display:false }, title:{ display:true, text:'PM2.5', color:'#3F5570' } }
          }
        }
      });
    }
  }

  function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }

  const module = {
    onEnter() {
      userAge = AervioAuth.userProfile?.age || 25;
      setTimeout(() => loadSessions(), 200);
    },
    onLeave() {
      if (hrChart) { hrChart.destroy(); hrChart=null; }
      if (loadChart) { loadChart.destroy(); loadChart=null; }
    }
  };

  App.registerModule('history', module);
})();
