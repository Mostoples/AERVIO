/* AERVINEX — Regional Health Threshold Variations
   Per-kota baseline PM2.5 ambient + adjustment factor untuk
   ML risk scoring. Tujuan: ketika user memilih kota X,
   threshold "udara buruk" digeser relatif ke baseline lokal.
   Rationale: tinggal di Jakarta dengan baseline PM2.5 ~40
   µg/m³ artinya tubuh sebagian acclimatized; alert PM2.5=55
   bukan emergency seperti kalau user dari Denpasar (baseline ~15).

   Data: rata-rata historis tahunan PM2.5 (sumber publik:
   IQAir, BMKG, KLHK 2022-2024 averages — approximate).
   NOTE: angka-angka ini dipakai sebagai relative context,
   BUKAN clinical absolute threshold.
*/
(function () {
  'use strict';

  const REGIONAL_PM25 = {
    // city_id : { name, ambientPm25, classification, latitude, longitude }
    'jakarta':    { name: 'Jakarta',    ambientPm25: 42, classification: 'high',     lat: -6.21,  lng: 106.85 },
    'surabaya':   { name: 'Surabaya',   ambientPm25: 35, classification: 'moderate-high', lat: -7.25,  lng: 112.75 },
    'bandung':    { name: 'Bandung',    ambientPm25: 30, classification: 'moderate', lat: -6.91,  lng: 107.61 },
    'yogyakarta': { name: 'Yogyakarta', ambientPm25: 25, classification: 'moderate', lat: -7.80,  lng: 110.36 },
    'medan':      { name: 'Medan',      ambientPm25: 33, classification: 'moderate', lat:  3.59,  lng: 98.67  },
    'makassar':   { name: 'Makassar',   ambientPm25: 22, classification: 'low-mod',  lat: -5.13,  lng: 119.41 },
    'denpasar':   { name: 'Denpasar',   ambientPm25: 15, classification: 'low',      lat: -8.65,  lng: 115.21 },
  };

  // Adjustment factor untuk PM2.5 risk threshold per kota.
  // base WHO threshold: 15 µg/m³ (24-hr exposure).
  // Jakarta user yang exposure 30 µg/m³ tidak se-darurat
  // Denpasar user yang sama → tubuhnya kurang acclimatized.
  // delta = ambient_local - WHO_baseline; threshold lokal:
  //   warn  = WHO_warn  + 0.5 * delta
  //   alert = WHO_alert + 0.5 * delta
  // (Konservatif: hanya 50% delta yang di-absorb agar tetap
  // protective.)
  const WHO_BASELINE = 15;
  const WHO_WARN = 25;
  const WHO_ALERT = 55;

  function getRegionalThresholds(cityId) {
    const city = REGIONAL_PM25[cityId];
    if (!city) {
      return { warn: WHO_WARN, alert: WHO_ALERT, city: null, source: 'WHO default' };
    }
    const delta = city.ambientPm25 - WHO_BASELINE;
    const adjust = Math.max(0, delta * 0.5);
    return {
      warn: Math.round(WHO_WARN + adjust),
      alert: Math.round(WHO_ALERT + adjust),
      city: city.name,
      ambient: city.ambientPm25,
      classification: city.classification,
      source: 'AERVINEX regional adjustment (WHO + 0.5·delta)',
      note: 'Acclimatization-adjusted; use clinical default for naive users.'
    };
  }

  function listCities() {
    return Object.entries(REGIONAL_PM25).map(([id, c]) => ({
      id, name: c.name, ambientPm25: c.ambientPm25, classification: c.classification
    }));
  }

  // Optional: nearest city by lat/lng (Haversine)
  function nearestCity(lat, lng) {
    const R = 6371;
    function hav(aLat, aLng, bLat, bLng) {
      const toRad = d => d * Math.PI / 180;
      const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
      const x = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;
      return 2 * R * Math.asin(Math.sqrt(x));
    }
    let best = null, bestDist = Infinity;
    for (const [id, c] of Object.entries(REGIONAL_PM25)) {
      const d = hav(lat, lng, c.lat, c.lng);
      if (d < bestDist) { bestDist = d; best = { id, ...c, distanceKm: Math.round(d) }; }
    }
    return best;
  }

  // Persist user's city pick
  function setUserCity(cityId) {
    if (!REGIONAL_PM25[cityId]) return false;
    localStorage.setItem('aervinex-user-city', cityId);
    return true;
  }
  function getUserCity() {
    return localStorage.getItem('aervinex-user-city') || null;
  }

  // Wire ke ml-client kalau ada
  function applyToMLClient() {
    if (!window.AervinexMLClient) return;
    const cityId = getUserCity();
    if (!cityId) return;
    const t = getRegionalThresholds(cityId);
    // Push as context — ml-client decides how to use
    window.AervinexMLClient.context = window.AervinexMLClient.context || {};
    window.AervinexMLClient.context.regional = t;
    window.AervinexMLClient.context.cityId = cityId;
  }

  window.AervinexRegional = {
    cities: REGIONAL_PM25,
    getRegionalThresholds,
    listCities,
    nearestCity,
    setUserCity,
    getUserCity,
    applyToMLClient,
    WHO: { baseline: WHO_BASELINE, warn: WHO_WARN, alert: WHO_ALERT },
  };

  // Auto-apply ke ml-client setelah window load
  if (document.readyState === 'complete') {
    applyToMLClient();
  } else {
    window.addEventListener('load', applyToMLClient);
  }
})();
