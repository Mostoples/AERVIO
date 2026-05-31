/**
 * AERVINEX XAI-M — Rule-Based eXplainability Module (F12)
 * Computes feature contributions relative to healthy baseline (deviation-from-normal),
 * rendered as inline bar charts within the dashboard.
 */
window.XAI = {

  // Healthy baselines for each feature
  _baselines: {
    hr:        70,    // bpm resting
    rmssd:     50,    // ms — good HRV
    sdnn:      60,    // ms
    spo2:      98,    // %
    eda:        3,    // μS resting
    coreTemp:  36.8,  // °C
    hydration: 95,    // %
    pm25:       5,    // μg/m³ WHO safe
    uvi:        2,    // low UV
    css:       20,    // composite stress ideal
    rsi:       15,    // respiratory stress ideal
    hsi:       10,    // heat stress ideal
  },

  // Weight of each feature in overall health risk (must sum to 1)
  _weights: {
    hr:        0.18,
    rmssd:     0.15,
    sdnn:      0.08,
    spo2:      0.15,
    eda:       0.08,
    coreTemp:  0.10,
    hydration: 0.08,
    pm25:      0.10,
    uvi:       0.04,
    css:       0.02,
    rsi:       0.01,
    hsi:       0.01,
  },

  // Max deviation (for normalization to ±1)
  _maxDev: {
    hr:        50,   spo2:      10,   rmssd:     50,
    sdnn:      60,   eda:       15,   coreTemp:  3,
    hydration: 35,   pm25:      150,  uvi:       9,
    css:       80,   rsi:       85,   hsi:       90,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Compute feature contributions
  // sensorData: output of SensorSim.tick()
  // envData   : { pm25, uvi }
  // analysisData : output of HealthEngine.analyze()
  // Returns sorted array: [{ key, label, value, baseline, deviation, contribution, direction }]
  // ──────────────────────────────────────────────────────────────────────
  explain(sensorData, envData, analysisData) {
    const vals = {
      hr:        sensorData.hr,
      rmssd:     sensorData.rmssd,
      sdnn:      sensorData.sdnn,
      spo2:      sensorData.spo2,
      eda:       sensorData.eda,
      coreTemp:  sensorData.coreTemp,
      hydration: sensorData.hydration,
      pm25:      envData.pm25,
      uvi:       envData.uvi,
      css:       analysisData.css,
      rsi:       analysisData.rsi,
      hsi:       analysisData.hsi,
    };

    const labels = {
      hr:'HR bpm', rmssd:'RMSSD ms', sdnn:'SDNN ms', spo2:'SpO₂ %', eda:'EDA μS',
      coreTemp:'Core Temp', hydration:'Hidrasi %', pm25:'PM2.5', uvi:'UV Index',
      css:'Stres CSS', rsi:'RSI', hsi:'Heat Stress',
    };

    // Features where higher value = higher risk
    const higherIsWorse = new Set(['hr','eda','coreTemp','pm25','uvi','css','rsi','hsi']);

    const contribs = Object.keys(this._weights).map(key => {
      const val      = vals[key] ?? this._baselines[key];
      const base     = this._baselines[key];
      const maxDev   = this._maxDev[key];
      const rawDev   = val - base;
      const normDev  = Utils.clamp(rawDev / maxDev, -1, 1);
      const riskDir  = higherIsWorse.has(key) ? 1 : -1; // positive dev = risk for this feature
      const contrib  = normDev * riskDir * this._weights[key]; // positive = increases risk

      return {
        key,
        label:       labels[key],
        value:       +val.toFixed(1),
        baseline:    base,
        deviation:   +rawDev.toFixed(2),
        contribution: +contrib.toFixed(4),
        direction:   contrib > 0.005 ? 'risk' : contrib < -0.005 ? 'protect' : 'neutral',
      };
    });

    // Sort by absolute contribution (most influential first)
    return contribs.sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  },

  // ──────────────────────────────────────────────────────────────────────
  // Render explanation as mini bar chart into a target element
  // container: DOM element
  // contribs : result of explain()
  // topN     : how many features to show (default 6)
  // ──────────────────────────────────────────────────────────────────────
  render(container, contribs, topN = 6) {
    if (!container) return;
    const top = contribs.slice(0, topN);
    const maxAbs = Math.max(...top.map(c => Math.abs(c.contribution)), 0.01);

    container.innerHTML = top.map(c => {
      const pct    = Math.round((Math.abs(c.contribution) / maxAbs) * 100);
      const color  = c.direction === 'risk' ? 'var(--danger)' : c.direction === 'protect' ? 'var(--safe)' : 'var(--t3)';
      const devStr = c.deviation > 0 ? '+' + c.deviation : String(c.deviation);
      return `
        <div class="xai-row">
          <span class="xai-feat">${c.label}</span>
          <div class="xai-bar-wrap">
            <div class="xai-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="xai-dev" style="color:${color}">${devStr}</span>
        </div>`;
    }).join('');
  },

  // ──────────────────────────────────────────────────────────────────────
  // Render a compact "top-3 contributors" summary line (for alert panel)
  // ──────────────────────────────────────────────────────────────────────
  summarize(contribs) {
    const top3 = contribs.slice(0, 3);
    return top3.map(c => {
      const arrow = c.direction === 'risk' ? '↑' : '↓';
      return `${arrow} ${c.label} (${c.value})`;
    }).join(' · ');
  },
};
