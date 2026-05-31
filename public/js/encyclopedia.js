/**
 * AERVINEX Encyclopedia Module
 * Renders Kaggle-derived reference data for health, HRV, injury, and wearable sensors.
 */
(function () {
  let data = null;

  // ── TAB SWITCHING ────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.enc-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.enc-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.enc-panel').forEach(p => p.style.display = 'none');
        btn.classList.add('active');
        const panel = document.getElementById('enc-tab-' + btn.dataset.tab);
        if (panel) panel.style.display = '';
      });
    });
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function fmt(v, dec = 1) {
    if (v == null || isNaN(v)) return '–';
    return (+v).toFixed(dec);
  }

  function corrColor(r) {
    const a = Math.abs(r);
    if (a >= 0.5) return r > 0 ? 'var(--danger)' : 'var(--safe)';
    if (a >= 0.3) return r > 0 ? 'var(--warn)' : 'var(--safe)';
    return 'var(--t3)';
  }

  function corrLabel(r) {
    const a = Math.abs(r);
    const dir = r > 0 ? 'positif' : 'negatif';
    if (a >= 0.5) return `Kuat ${dir}`;
    if (a >= 0.3) return `Sedang ${dir}`;
    if (a >= 0.1) return `Lemah ${dir}`;
    return 'Tidak signifikan';
  }

  function statRow(label, s, dec = 1) {
    return `<tr>
      <td>${label}</td>
      <td>${fmt(s.min, dec)}</td>
      <td>${fmt(s.mean, dec)}</td>
      <td>${fmt(s.median, dec)}</td>
      <td>${fmt(s.max, dec)}</td>
      <td>${fmt(s.p25, dec)}–${fmt(s.p75, dec)}</td>
    </tr>`;
  }

  // ── TAB 1: KUALITAS UDARA ────────────────────────────────────────────────
  function renderAirQuality(aq) {
    document.getElementById('enc-aq-source').textContent = aq.source + ' · N=' + aq.total_records.toLocaleString();

    // Cards per class
    const classColors = {
      'Baik': 'var(--safe)', 'Sedang': 'var(--warn)',
      'Tidak Sehat': '#F97316', 'Sangat Tidak Sehat': 'var(--danger)', 'Berbahaya': '#7C3AED'
    };
    const classEl = document.getElementById('enc-aq-classes');
    if (classEl) {
      classEl.innerHTML = Object.entries(aq.by_health_class).map(([label, d]) => {
        const col = classColors[label] || 'var(--t2)';
        return `<div class="card" style="border-color:${col}40">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:${col}"></div>
            <span style="font-weight:700;font-family:'Space Grotesk',sans-serif;color:${col}">${label}</span>
            <span class="metric-badge b-safe" style="margin-left:auto">${d.count} rekaman</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="enc-stat-item"><div class="enc-stat-val">${fmt(d.pm25.mean)}</div><div class="enc-stat-lbl">PM2.5 rata-rata (μg/m³)</div></div>
            <div class="enc-stat-item"><div class="enc-stat-val">${fmt(d.aqi.mean)}</div><div class="enc-stat-lbl">AQI rata-rata</div></div>
            <div class="enc-stat-item"><div class="enc-stat-val">${fmt(d.respiratory_cases.mean, 0)}</div><div class="enc-stat-lbl">Kasus Pernapasan</div></div>
            <div class="enc-stat-item"><div class="enc-stat-val">${fmt(d.hospital_admissions.mean, 0)}</div><div class="enc-stat-lbl">Rawat Inap</div></div>
          </div>
        </div>`;
      }).join('');
    }

    // Correlations
    const corrEl = document.getElementById('enc-aq-corr');
    if (corrEl) {
      const corrMap = {
        'pm25_vs_hospital':     'PM2.5 vs Rawat Inap',
        'aqi_vs_respiratory':   'AQI vs Kasus Pernapasan',
        'temp_vs_hospital':     'Suhu vs Rawat Inap',
        'no2_vs_cardiovascular':'NO₂ vs Kasus Kardiovaskular',
      };
      corrEl.innerHTML = Object.entries(aq.correlations).map(([key, r]) => {
        const col = corrColor(r);
        const pct = Math.round(Math.abs(r) * 100);
        return `<div class="card" style="padding:14px">
          <div style="font-size:.8rem;color:var(--t2);margin-bottom:6px">${corrMap[key] || key}</div>
          <div style="font-size:1.5rem;font-weight:700;font-family:'Space Grotesk',sans-serif;color:${col}">r = ${r}</div>
          <div style="margin:6px 0 4px;height:4px;background:var(--card2);border-radius:2px">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:2px"></div>
          </div>
          <div style="font-size:.75rem;color:${col}">${corrLabel(r)}</div>
        </div>`;
      }).join('');
    }

    // Stats table
    const tbody = document.querySelector('#enc-aq-stats-table tbody');
    if (tbody) {
      const o = aq.overall;
      tbody.innerHTML = [
        statRow('PM2.5 (μg/m³)', o.pm25),
        statRow('AQI', o.aqi, 0),
        statRow('PM10 (μg/m³)', o.pm10),
        statRow('NO₂ (ppb)', o.no2),
        statRow('SO₂ (ppb)', o.so2),
        statRow('O₃ (ppb)', o.o3),
        statRow('Suhu (°C)', o.temp),
        statRow('Kelembaban (%)', o.humidity, 0),
        statRow('Kecepatan Angin (km/h)', o.wind),
      ].join('');
    }
  }

  // ── TAB 2: HRV & STRES ───────────────────────────────────────────────────
  function renderHRV(hrv) {
    document.getElementById('enc-hrv-source').textContent = hrv.source + ' · N=' + hrv.total_records.toLocaleString();

    const condLabels = {
      'no stress':     { label: 'Tanpa Stres',       icon: '😌', color: 'var(--safe)' },
      'time pressure': { label: 'Tekanan Waktu',      icon: '⏱️', color: 'var(--warn)' },
      'interruption':  { label: 'Gangguan/Interupsi', icon: '🔔', color: '#F97316' },
    };

    const condEl = document.getElementById('enc-hrv-conditions');
    if (condEl) {
      condEl.innerHTML = Object.entries(hrv.by_condition).map(([cond, d]) => {
        const meta = condLabels[cond] || { label: cond, icon: '📊', color: 'var(--t2)' };
        return `<div class="card" style="border-color:${meta.color}40">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <span style="font-size:1.5rem">${meta.icon}</span>
            <div>
              <div style="font-weight:700;font-family:'Space Grotesk',sans-serif;color:${meta.color}">${meta.label}</div>
              <div style="font-size:.75rem;color:var(--t3)">${d.count.toLocaleString()} rekaman</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="enc-stat-item">
              <div class="enc-stat-val" style="color:${meta.color}">${fmt(d.hr.mean)}</div>
              <div class="enc-stat-lbl">HR (bpm)</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val" style="color:${meta.color}">${fmt(d.mean_rr.mean)}</div>
              <div class="enc-stat-lbl">Mean RR (ms)</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.rmssd.mean)}</div>
              <div class="enc-stat-lbl">RMSSD (ms)</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.pnn50.mean)}</div>
              <div class="enc-stat-lbl">pNN50 (%)</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.lf_hf.mean)}</div>
              <div class="enc-stat-lbl">LF/HF Ratio</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.sampen.mean, 3)}</div>
              <div class="enc-stat-lbl">SampEn</div>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    // HRV table
    const tbody = document.querySelector('#enc-hrv-table tbody');
    if (tbody) {
      const conds = ['no stress', 'time pressure', 'interruption'];
      const params = [
        ['hr',      'HR (bpm)',           1],
        ['mean_rr', 'Mean RR (ms)',        0],
        ['rmssd',   'RMSSD (ms)',          1],
        ['sdrr',    'SDRR (ms)',           1],
        ['pnn25',   'pNN25 (%)',           1],
        ['pnn50',   'pNN50 (%)',           1],
        ['sd1',     'SD1 (ms)',            1],
        ['sd2',     'SD2 (ms)',            1],
        ['lf_hf',   'LF/HF Ratio',        2],
        ['sampen',  'SampEn',             3],
        ['higuci',  'Higuci FD',          3],
      ];
      const interp = {
        'hr':      'Lebih tinggi = stres/aktif',
        'mean_rr': 'Lebih tinggi = HR lebih rendah (santai)',
        'rmssd':   'Lebih tinggi = pemulihan lebih baik',
        'sdrr':    'Lebih tinggi = variabilitas lebih besar',
        'pnn25':   'Lebih tinggi = tonus vagal lebih kuat',
        'pnn50':   'Lebih tinggi = pemulihan HRV lebih baik',
        'sd1':     'Proxy RMSSD — short-term variability',
        'sd2':     'Long-term variability — overall HRV',
        'lf_hf':   'Lebih tinggi = dominansi simpatis (stres)',
        'sampen':  'Lebih rendah = ritme lebih teratur (stres)',
        'higuci':  'Lebih rendah = sinyal lebih sederhana (stres)',
      };
      tbody.innerHTML = params.map(([key, label, dec]) => {
        const cells = conds.map(c => {
          const d = hrv.by_condition[c];
          return d ? `<td>${fmt(d[key].mean, dec)} <small style="color:var(--t3)">±${fmt(d[key].std, dec)}</small></td>` : '<td>–</td>';
        }).join('');
        return `<tr><td>${label}</td>${cells}<td style="color:var(--t3);font-size:.8rem">${interp[key] || ''}</td></tr>`;
      }).join('');
    }
  }

  // ── TAB 3: CEDERA ATLET ──────────────────────────────────────────────────
  function renderInjury(inj) {
    document.getElementById('enc-inj-source').textContent = inj.source + ' · N=' + inj.total_records + ' · Tingkat cedera: ' + inj.injury_rate_pct + '%';

    // Compare injured vs healthy
    const cmpEl = document.getElementById('enc-inj-compare');
    if (cmpEl) {
      const params = [
        ['training_intensity', 'Intensitas Latihan', 0],
        ['training_hours',     'Jam Latihan/Minggu',  1],
        ['recovery_days',      'Hari Recovery/Minggu',1],
        ['fatigue_score',      'Skor Kelelahan',      1],
        ['performance_score',  'Skor Performa',       1],
        ['acl_risk',           'Risiko ACL',          1],
        ['load_balance',       'Keseimbangan Beban',  1],
      ];
      cmpEl.innerHTML = params.map(([key, label, dec]) => {
        const inj_val = inj.injured[key]?.mean;
        const hlt_val = inj.healthy[key]?.mean;
        const delta = ((inj_val - hlt_val) / (hlt_val || 1) * 100).toFixed(1);
        const col = parseFloat(delta) > 5 ? 'var(--danger)' : parseFloat(delta) < -5 ? 'var(--safe)' : 'var(--t2)';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--t2);font-size:.85rem">${label}</span>
          <div style="text-align:right">
            <span style="color:var(--danger);font-weight:600">${fmt(inj_val, dec)}</span>
            <span style="color:var(--t3);margin:0 4px">vs</span>
            <span style="color:var(--safe);font-weight:600">${fmt(hlt_val, dec)}</span>
            <span style="color:${col};font-size:.75rem;margin-left:6px">(${parseFloat(delta) > 0 ? '+' : ''}${delta}%)</span>
          </div>
        </div>`;
      }).join('') + `<div style="margin-top:10px;font-size:.75rem;color:var(--t3)">
        <span style="color:var(--danger)">■ Cedera</span> vs <span style="color:var(--safe)">■ Sehat</span>
      </div>`;
    }

    // Correlations
    const corrEl = document.getElementById('enc-inj-corr');
    if (corrEl) {
      const corrMap = {
        fatigue:            '🔥 Skor Kelelahan',
        training_intensity: '💪 Intensitas Latihan',
        acl_risk:           '🦵 Risiko ACL',
        load_balance:       '⚖️ Keseimbangan Beban',
        recovery_days:      '😴 Hari Recovery',
      };
      corrEl.innerHTML = Object.entries(inj.risk_correlations).map(([key, r]) => {
        const col = corrColor(r);
        const pct = Math.round(Math.abs(r) * 100);
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.85rem;color:var(--t2)">${corrMap[key] || key}</span>
            <span style="font-weight:700;color:${col}">r = ${r}</span>
          </div>
          <div style="height:4px;background:var(--card2);border-radius:2px">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:2px"></div>
          </div>
          <div style="font-size:.72rem;color:${col};margin-top:2px">${corrLabel(r)}</div>
        </div>`;
      }).join('');
    }

    // Position table
    const tbody = document.querySelector('#enc-inj-pos-table tbody');
    if (tbody) {
      tbody.innerHTML = Object.entries(inj.by_position)
        .sort((a, b) => b[1].injury_rate_pct - a[1].injury_rate_pct)
        .map(([pos, d]) => {
          const rateColor = d.injury_rate_pct >= 15 ? 'var(--danger)' : d.injury_rate_pct >= 7 ? 'var(--warn)' : 'var(--safe)';
          return `<tr>
            <td style="font-weight:600">${pos}</td>
            <td>${d.count}</td>
            <td style="color:${rateColor};font-weight:600">${d.injury_rate_pct}%</td>
            <td>${d.avg_fatigue}</td>
            <td>${d.avg_training_intensity}</td>
            <td>${d.avg_recovery_days}</td>
          </tr>`;
        }).join('');
    }
  }

  // ── TAB 4: SENSOR WEARABLE ───────────────────────────────────────────────
  function renderWearable(ws) {
    document.getElementById('enc-wear-source').textContent = ws.source + ' · N=' + ws.total_records;

    const actColors = { 'Running': 'var(--danger)', 'Walking': 'var(--warn)', 'Cycling': '#3B82F6', 'Resting': 'var(--safe)' };
    const actIcons  = { 'Running': '🏃', 'Walking': '🚶', 'Cycling': '🚴', 'Resting': '😴' };

    const actEl = document.getElementById('enc-wear-activities');
    if (actEl) {
      actEl.innerHTML = Object.entries(ws.by_activity).map(([act, d]) => {
        const col = actColors[act] || 'var(--t2)';
        const ico = actIcons[act] || '📊';
        return `<div class="card" style="border-color:${col}40">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <span style="font-size:1.6rem">${ico}</span>
            <div>
              <div style="font-weight:700;font-family:'Space Grotesk',sans-serif;color:${col}">${act}</div>
              <div style="font-size:.75rem;color:var(--t3)">${d.count} rekaman</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="enc-stat-item">
              <div class="enc-stat-val" style="color:${col}">${fmt(d.hr.mean, 0)}</div>
              <div class="enc-stat-lbl">HR rata-rata (bpm)</div>
              <div style="font-size:.72rem;color:var(--t3)">${fmt(d.hr.min, 0)}–${fmt(d.hr.max, 0)}</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val" style="color:${col}">${fmt(d.spo2.mean, 1)}</div>
              <div class="enc-stat-lbl">SpO₂ (%)</div>
              <div style="font-size:.72rem;color:var(--t3)">${fmt(d.spo2.min, 0)}–${fmt(d.spo2.max, 0)}</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.temp.mean, 1)}</div>
              <div class="enc-stat-lbl">Suhu Tubuh (°C)</div>
            </div>
            <div class="enc-stat-item">
              <div class="enc-stat-val">${fmt(d.steps.mean, 0)}</div>
              <div class="enc-stat-lbl">Langkah rata-rata</div>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    // Normal ranges
    const rangesEl = document.getElementById('enc-wear-ranges');
    if (rangesEl) {
      const o = ws.overall;
      const ranges = [
        { icon: '❤️', label: 'Heart Rate', val: `${fmt(o.hr.p25,0)}–${fmt(o.hr.p75,0)} bpm`, sub: `Mean ${fmt(o.hr.mean,0)} bpm` },
        { icon: '🫁', label: 'SpO₂',       val: `${fmt(o.spo2.p25,1)}–${fmt(o.spo2.p75,1)} %`, sub: `Mean ${fmt(o.spo2.mean,1)} %` },
        { icon: '🌡️', label: 'Suhu Tubuh', val: `${fmt(o.temp.p25,1)}–${fmt(o.temp.p75,1)} °C`, sub: `Mean ${fmt(o.temp.mean,1)} °C` },
        { icon: '👣', label: 'Step Count', val: `${fmt(o.steps.p25,0)}–${fmt(o.steps.p75,0)}`, sub: `Mean ${fmt(o.steps.mean,0)} langkah` },
      ];
      rangesEl.innerHTML = ranges.map(r => `<div class="card" style="padding:14px;text-align:center">
        <div style="font-size:1.8rem;margin-bottom:6px">${r.icon}</div>
        <div style="font-size:.8rem;color:var(--t3);margin-bottom:4px">${r.label}</div>
        <div style="font-weight:700;font-size:1.1rem;font-family:'Space Grotesk',sans-serif;color:var(--green)">${r.val}</div>
        <div style="font-size:.75rem;color:var(--t3)">${r.sub}</div>
      </div>`).join('');
    }
  }

  // ── LIFECYCLE ────────────────────────────────────────────────────────────
  const module = {
    onEnter() {
      initTabs();
      if (data) return; // already loaded
      fetch('/data/encyclopedia.json')
        .then(r => r.json())
        .then(json => {
          data = json;
          const badge = document.getElementById('enc-data-badge');
          if (badge) {
            badge.textContent = '4 dataset · ' + [
              json.air_quality?.total_records,
              json.athlete_injury?.total_records,
              json.wearable_health?.total_records,
              json.hrv_reference?.total_records,
            ].reduce((a,b) => a + (b||0), 0).toLocaleString() + ' rekaman';
            badge.className = 'metric-badge b-safe';
          }
          renderAirQuality(json.air_quality);
          renderHRV(json.hrv_reference);
          renderInjury(json.athlete_injury);
          renderWearable(json.wearable_health);
        })
        .catch(err => {
          const badge = document.getElementById('enc-data-badge');
          if (badge) { badge.textContent = 'Gagal memuat data'; badge.className = 'metric-badge b-danger'; }
          console.error('Encyclopedia data load error:', err);
        });
    },
    onLeave() {},
  };

  App.registerModule('encyclopedia', module);
})();
