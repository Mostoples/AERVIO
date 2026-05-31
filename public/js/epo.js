/**
 * AERVINEX EPO — Environmental Performance Optimizer (F11)
 * Adjusts training pace and zone targets based on heat index + air quality.
 * Reference: ACSM heat-stress guidelines + Rothfusz regression (NWS).
 */
window.EPO = {

  // ──────────────────────────────────────────────────────────────────────
  // Heat Index — Rothfusz regression (NWS, valid when T ≥ 27°C)
  // tempC : ambient air temperature (°C)
  // humidity : relative humidity (%)
  // Returns heat index in °C
  // ──────────────────────────────────────────────────────────────────────
  computeHeatIndex(tempC, humidity) {
    const T  = tempC * 9 / 5 + 32; // °F
    const RH = Utils.clamp(humidity, 0, 100);
    let HI;
    if (T < 80) {
      // Simplified Steadman equation for lower temperatures
      HI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
    } else {
      HI = -42.379
        + 2.04901523  * T
        + 10.14333127 * RH
        - 0.22475541  * T  * RH
        - 0.00683783  * T  * T
        - 0.05481717  * RH * RH
        + 0.00122874  * T  * T  * RH
        + 0.00085282  * T  * RH * RH
        - 0.00000199  * T  * T  * RH * RH;
      // Adjustments for low humidity or high RH edge cases
      if (RH < 13 && T >= 80 && T <= 112) HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      if (RH > 85 && T >= 80 && T <= 87)  HI += ((RH - 85) / 10) * ((87 - T) / 5);
    }
    return Math.round((HI - 32) * 5 / 9); // back to °C
  },

  // ──────────────────────────────────────────────────────────────────────
  // Pace & Zone Adjustment
  // heatIndex : heat index in °C
  // pm25      : PM2.5 concentration (μg/m³)
  // Returns   : { pctSlower, zoneCapHRPct, label, level, color }
  // ──────────────────────────────────────────────────────────────────────
  getAdjustment(heatIndex, pm25 = 0) {
    let pctSlower = 0, level = 0, label = 'Normal', color = 'var(--safe)';

    if (heatIndex >= 46) {
      pctSlower = 20; level = 4; label = 'Ekstrem Berbahaya'; color = 'var(--danger)';
    } else if (heatIndex >= 39) {
      pctSlower = 12; level = 3; label = 'Bahaya';            color = 'var(--danger)';
    } else if (heatIndex >= 32) {
      pctSlower = 7;  level = 2; label = 'Sangat Panas';      color = 'var(--warn)';
    } else if (heatIndex >= 27) {
      pctSlower = 3;  level = 1; label = 'Panas';             color = 'var(--warn)';
    }

    // Air-quality penalty (PM2.5 impairs O₂ delivery)
    if (pm25 > 35)     pctSlower += 5;
    else if (pm25 > 15) pctSlower += 2;

    pctSlower = Math.min(pctSlower, 25);

    // HR zone cap: prevents cardiovascular overload in heat
    const zoneCapHRPct = level >= 3 ? 0.74 : level === 2 ? 0.80 : level === 1 ? 0.85 : 0.92;

    // Recommended training zone label
    const zoneName = zoneCapHRPct >= 0.90 ? 'Z5'
                   : zoneCapHRPct >= 0.83 ? 'Z4'
                   : zoneCapHRPct >= 0.78 ? 'Z3'
                   : 'Z2';

    return { pctSlower, zoneCapHRPct, label, level, color, zoneName };
  },

  // ──────────────────────────────────────────────────────────────────────
  // Adjusted pace (s/km) incorporating heat + air quality penalty
  // ──────────────────────────────────────────────────────────────────────
  getAdjustedPace(basePace, heatIndex, pm25) {
    const adj = this.getAdjustment(heatIndex, pm25);
    return Math.round(basePace * (1 + adj.pctSlower / 100));
  },

  // ──────────────────────────────────────────────────────────────────────
  // Recommendation text for EPO panel
  // ──────────────────────────────────────────────────────────────────────
  getRecommendation(adj, pm25) {
    const parts = [];
    if (adj.pctSlower > 0) parts.push(`Lambatkan pace ${adj.pctSlower}% vs target normal.`);
    if (adj.level >= 3)    parts.push('Hindari paparan sinar matahari langsung.');
    if (adj.level >= 4)    parts.push('⚠️ Sebaiknya tunda latihan outdoor!');
    if (pm25 > 35)         parts.push('Gunakan masker N95 di luar ruangan.');
    else if (pm25 > 15)    parts.push('Pertimbangkan masker saat napas berat.');
    if (adj.level === 0 && pm25 <= 15) parts.push('Kondisi lingkungan optimal untuk berlari.');
    return parts.join(' ') || 'Pantau kondisi selama berlari.';
  },
};
