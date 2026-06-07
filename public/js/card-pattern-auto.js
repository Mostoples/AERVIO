/*!
 * AERVINEX Card Pattern Auto-Detector
 * ─────────────────────────────────────────────────────────────
 * Scan semua .card di halaman, deteksi konteks dari konten teks/icon,
 * auto-assign data-pattern attribute supaya medical icon decoration
 * yang sesuai topik muncul di pojok kanan bawah card.
 *
 * Loaded by aervinex-app.js — runs on DOMContentLoaded + MutationObserver
 * untuk cover dynamic content (JS-rendered cards).
 *
 * Detection priority: data-pattern existing > explicit text matches > aura class > default
 */
(function () {
  'use strict';

  if (window.__AERV_CARD_PATTERN_INSTALLED) return;
  window.__AERV_CARD_PATTERN_INSTALLED = true;

  // Keyword → pattern mapping (lowercase, regex-safe)
  const PATTERNS = [
    { pattern: 'heart',    keywords: ['heart rate', 'hr ', 'bpm', 'detak jantung', 'cardiac', 'jantung', 'afib', 'arrhythmia', 'aritmia', 'bradikardia', 'takikardia', 'ektopik', 'palpitasi', 'pulse', 'rmssd', 'hrv'] },
    { pattern: 'lung',     keywords: ['spo2', 'spo₂', 'oksigen darah', 'blood oxygen', 'oxygen', 'respiratory', 'pernapasan', 'asma', 'asthma', 'lung', 'paru', 'copd', 'ispa', 'bronchitis', 'bronkitis', 'pneumonia', 'rr', 'brpm', 'breath'] },
    { pattern: 'temp',     keywords: ['heat', 'panas', 'temperature', 'suhu', 'thermal', 'heatstroke', 'heat index', 'demam', 'fever', 'hipotermia', 'hypothermia', 'kelelahan panas', '°c'] },
    { pattern: 'droplet',  keywords: ['hidrasi', 'hydration', 'dehidrasi', 'dehydration', 'water', 'fluid', 'sweat', 'keringat', 'hyponatremia', 'hyponatremi'] },
    { pattern: 'brain',    keywords: ['stress', 'stres', 'burnout', 'anxiety', 'mental', 'cognitive', 'kognitif', 'emosi', 'panic', 'panik', 'wesad', 'meditation', 'mindfulness'] },
    { pattern: 'uv',       keywords: ['uv index', 'uv ', 'sunburn', 'photokeratitis', 'sinar matahari', 'vitamin d', 'skin cancer', 'kulit', 'tanning'] },
    { pattern: 'air',      keywords: ['pm2.5', 'pm10', 'pm₂.₅', 'aqi', 'ispu', 'polusi', 'pollution', 'air quality', 'kualitas udara', 'teprs', 'environment', 'lingkungan', 'no2', 'so2', 'o3', 'ozone', 'particulate'] },
    { pattern: 'sleep',    keywords: ['sleep', 'tidur', 'insomnia', 'sleep apnea', 'apnea', 'nrem', 'rem ', 'nap', 'bedtime', 'recovery'] },
    { pattern: 'activity', keywords: ['lari', 'run', 'running', 'step', 'langkah', 'sedentary', 'cardio', 'workout', 'olahraga', 'overtraining', 'fitness', 'cv-fitness', 'pace', 'kecepatan', 'distance', 'jarak', 'achievement'] },
    { pattern: 'pill',     keywords: ['obat', 'pill', 'medication', 'medikamentosa', 'dosis', 'farmasi', 'pharmacy'] },
  ];

  // aura class → fallback pattern when no keyword match
  const AURA_FALLBACK = {
    'aura-coral':  'heart',   // coral often = cardiac
    'aura-violet': 'brain',   // violet often = mental/stress
    'aura-blue':   'droplet', // blue often = hydration
    'aura-amber':  'uv',      // amber often = UV/sun
    'aura-green':  'activity',// green often = success/active
    'aura-pink':   'pill',    // pink often = meds
    'aura-cyan':   'air',     // cyan often = environment
  };

  function detectPattern(card) {
    // 1. Skip if already has data-pattern
    if (card.hasAttribute('data-pattern')) return null;
    // 2. Skip if .no-pattern opt-out
    if (card.classList.contains('no-pattern')) return null;

    // 3. Extract text content (limited to first 500 chars for performance)
    const text = (card.textContent || '').toLowerCase().slice(0, 500);
    if (!text.trim()) return null;

    // 4. Keyword match (first hit wins, priority by array order)
    for (const { pattern, keywords } of PATTERNS) {
      for (const kw of keywords) {
        if (text.includes(kw)) return pattern;
      }
    }

    // 5. Aura class fallback
    for (const [auraClass, fallback] of Object.entries(AURA_FALLBACK)) {
      if (card.classList.contains(auraClass)) return fallback;
    }

    // 6. No pattern detected → default stethoscope (no data-pattern needed)
    return null;
  }

  function applyPatterns(root) {
    const target = root || document;
    const cards = target.querySelectorAll('.card');
    let applied = 0;
    cards.forEach(card => {
      const pattern = detectPattern(card);
      if (pattern) {
        card.setAttribute('data-pattern', pattern);
        applied++;
      }
    });
    return applied;
  }

  function init() {
    // Initial pass
    const initialApplied = applyPatterns();
    if (initialApplied > 0) {
      console.info('[card-pattern] auto-applied to', initialApplied, 'cards');
    }

    // Observer untuk dynamic content (JS-rendered cards)
    if (typeof MutationObserver !== 'undefined') {
      let pendingScan = false;
      const observer = new MutationObserver((mutations) => {
        if (pendingScan) return;
        // Only scan if mutations include element nodes
        const hasElementChanges = mutations.some(m =>
          m.type === 'childList' && [...m.addedNodes].some(n => n.nodeType === 1)
        );
        if (!hasElementChanges) return;
        pendingScan = true;
        requestAnimationFrame(() => {
          pendingScan = false;
          applyPatterns();
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.AervinexCardPattern = { applyPatterns, detectPattern, PATTERNS };
})();
