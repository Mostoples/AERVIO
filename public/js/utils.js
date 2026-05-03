// WHO-based health thresholds & utility calculations
window.Utils = {

  // ── HR ZONE ──────────────────────────────────────────
  getHRStatus(hr, age) {
    const mhr = 220 - age;
    const pct = hr / mhr;
    if (pct < 0.50) return { status: 'safe', label: 'Resting',     pct: Math.round(pct*100), color: 'var(--safe)' };
    if (pct < 0.60) return { status: 'safe', label: 'Light',        pct: Math.round(pct*100), color: 'var(--safe)' };
    if (pct < 0.70) return { status: 'safe', label: 'Moderate',     pct: Math.round(pct*100), color: 'var(--safe)' };
    if (pct < 0.85) return { status: 'warn', label: 'Vigorous',     pct: Math.round(pct*100), color: 'var(--warn)' };
    if (pct < 0.90) return { status: 'warn', label: 'Near Max',     pct: Math.round(pct*100), color: 'var(--warn)' };
    return              { status: 'danger', label: 'DANGER ZONE',  pct: Math.round(pct*100), color: 'var(--danger)' };
  },

  // ── SpO2 ──────────────────────────────────────────────
  getSpO2Status(spo2) {
    if (spo2 >= 95) return { status: 'safe',   label: 'Normal',  color: 'var(--safe)' };
    if (spo2 >= 90) return { status: 'warn',   label: 'Monitor', color: 'var(--warn)' };
    return               { status: 'danger', label: 'Hipoksia', color: 'var(--danger)' };
  },

  // ── PM2.5 (WHO 2021) ──────────────────────────────────
  getPM25Status(pm25) {
    if (pm25 <= 5)  return { status: 'safe',   label: 'Bersih',   pct: Math.min(100, pm25/50*100), color: 'var(--safe)' };
    if (pm25 <= 15) return { status: 'warn',   label: 'Sedang',   pct: Math.min(100, pm25/50*100), color: 'var(--warn)' };
    if (pm25 <= 35) return { status: 'warn',   label: 'Tinggi',   pct: Math.min(100, pm25/50*100), color: 'var(--warn)' };
    return               { status: 'danger', label: 'Berbahaya', pct: Math.min(100, pm25/50*100), color: 'var(--danger)' };
  },

  // ── UV INDEX (WHO) ────────────────────────────────────
  getUVStatus(uvi) {
    if (uvi <= 2)  return { status: 'safe',   label: 'Rendah',         color: 'var(--safe)' };
    if (uvi <= 5)  return { status: 'warn',   label: 'Sedang',         color: 'var(--warn)' };
    if (uvi <= 7)  return { status: 'warn',   label: 'Tinggi',         color: 'var(--warn)' };
    if (uvi <= 10) return { status: 'danger', label: 'Sangat Tinggi',  color: 'var(--danger)' };
    return              { status: 'danger', label: 'Ekstrem',         color: 'var(--danger)' };
  },

  // ── HYDRATION ─────────────────────────────────────────
  getHydrationStatus(pct) {
    if (pct >= 90) return { status: 'safe',   label: 'Optimal',    color: 'var(--safe)' };
    if (pct >= 97) return { status: 'safe',   label: 'Sangat Baik',color: 'var(--safe)' };
    if (pct >= 75) return { status: 'warn',   label: 'Cukup',      color: 'var(--warn)' };
    if (pct >= 65) return { status: 'warn',   label: 'Kurang',     color: 'var(--warn)' };
    return              { status: 'danger', label: 'Dehidrasi',  color: 'var(--danger)' };
  },

  // ── TEMPERATURE ───────────────────────────────────────
  getTempStatus(temp) {
    if (temp < 36.1) return { status: 'warn',   label: 'Rendah' };
    if (temp < 37.5) return { status: 'safe',   label: 'Normal' };
    if (temp < 38.5) return { status: 'warn',   label: 'Subfebrile' };
    if (temp < 40.0) return { status: 'warn',   label: 'Demam' };
    return                { status: 'danger', label: 'HEATSTROKE' };
  },

  // ── SKIN TEMP → CORE ESTIMATE ─────────────────────────
  estimateCoreTemp(skinTemp, activityLevel) {
    // activityLevel 0-1
    const offset = 1.5 + activityLevel * 2.5;
    return +(skinTemp + offset).toFixed(1);
  },

  // ── PACE FORMAT ───────────────────────────────────────
  formatPace(secsPerKm) {
    if (!secsPerKm || secsPerKm > 3600) return '--:--';
    const m = Math.floor(secsPerKm / 60);
    const s = Math.round(secsPerKm % 60);
    return `${m}:${String(s).padStart(2,'0')}`;
  },

  // ── TIME FORMAT ───────────────────────────────────────
  formatTime(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  // ── NUMBER FORMAT ─────────────────────────────────────
  fmt(n, decimals = 1) {
    return Number(n).toFixed(decimals);
  },

  // ── CLAMP ─────────────────────────────────────────────
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

  // ── LERP ──────────────────────────────────────────────
  lerp(a, b, t) { return a + (b - a) * t; },

  // ── RANDOM IN RANGE ───────────────────────────────────
  rand(min, max) { return min + Math.random() * (max - min); },
  randInt(min, max) { return Math.round(this.rand(min, max)); },

  // ── STATUS CLASS MAPPING ──────────────────────────────
  statusToCardClass(status) {
    return { safe: 's-safe', warn: 's-warn', danger: 's-danger' }[status] || '';
  },
  statusToBadgeClass(status) {
    return { safe: 'b-safe', warn: 'b-warn', danger: 'b-danger' }[status] || 'b-blue';
  },

  // ── GAUGE DASHOFFSET ──────────────────────────────────
  // circumference = 2π × r = 2π × 58 ≈ 364
  gaugeOffset(value, max = 100) {
    const pct = Utils.clamp(value / max, 0, 1);
    return 364 * (1 - pct);
  },

  // ── HAVERSINE DISTANCE (km) ───────────────────────────
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // ── BROWSER GEOLOCATION (fallback Jakarta) ────────────
  getGeoLocation() {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        return resolve({ lat: -6.2088, lon: 106.8456, source: 'default' });
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
        ()  => resolve({ lat: -6.2088, lon: 106.8456, source: 'default' }),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  },

  // ── WAQI API — nearest monitoring station ─────────────
  async fetchAQI(lat, lon) {
    try {
      const token = 'demo';
      const res  = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`);
      const data = await res.json();
      if (data.status === 'ok') {
        const stationGeo = data.data.city?.geo; // [lat, lon]
        const distKm = stationGeo
          ? +Utils.haversine(lat, lon, stationGeo[0], stationGeo[1]).toFixed(1)
          : null;
        return {
          aqi:    data.data.aqi,
          pm25:   data.data.iaqi?.pm25?.v ?? null,
          pm10:   data.data.iaqi?.pm10?.v ?? null,
          city:   data.data.city?.name ?? 'Stasiun Terdekat',
          distKm,
          time:   data.data.time?.s ?? null
        };
      }
    } catch { /* silent fail */ }
    return null;
  },

  // ── OPEN-METEO WEATHER ────────────────────────────────
  async fetchWeather(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m&timezone=auto`;
      const res  = await fetch(url);
      const data = await res.json();
      const c    = data.current;
      return {
        temp:     c.temperature_2m,
        humidity: c.relative_humidity_2m,
        uvIndex:  c.uv_index,
        wind:     c.wind_speed_10m
      };
    } catch { /* silent fail */ }
    return null;
  }
};
