/*!
 * AERVINEX Smart Recommendation Cards
 * ---------------------------------------------------------------
 * Rule-based recommendation engine yang baca:
 *   - users/{uid}.onboarding.goals       (running, asma, urban-commute, ...)
 *   - users/{uid}.onboarding.conditions  (asthma, hypertension, ...)
 *   - latest risk scores (from window.AervinexHealth.latest or risk doc)
 *   - latest environment context (AQI/heat/UV) from window.AervinexEnv or sample
 *
 * Renders ke <section id="smartRecs"> sebagai card list.
 *
 * Public API:
 *   window.AervinexSmartRecs.render(targetEl)
 */
(function () {
  'use strict';

  // ── Snapshot getters with sane fallbacks ─────────────────────────
  function getRisks() {
    const h = window.AervinexHealth?.latest || {};
    const f = window.AERVINEX_SNAPSHOT?.risks || {};
    return {
      asma: h.asma ?? f.asma ?? 20,
      heat: h.heat ?? f.heat ?? 20,
      deh:  h.deh  ?? f.deh  ?? 15,
      afib: h.afib ?? f.afib ?? 10,
      uv:   h.uv   ?? f.uv   ?? 20,
      teprs: h.teprs ?? f.teprs ?? 34,
    };
  }
  function getEnv() {
    const e = window.AERVINEX_SNAPSHOT?.env || window.AervinexEnv?.latest || {};
    return {
      pm25: e.pm25 ?? 40,
      aqi:  e.aqi  ?? 65,
      heat: e.heat ?? 31,
      uv:   e.uv   ?? 6,
      hour: new Date().getHours(),
    };
  }
  async function getProfile() {
    const user = window.auth?.currentUser;
    if (!user || !window.db) return { goals: [], conditions: [] };
    try {
      const doc = await window.db.collection('users').doc(user.uid).get();
      const d = doc.exists ? doc.data() : {};
      return {
        goals: d.onboarding?.goals || d.goals || [],
        conditions: d.onboarding?.conditions || d.conditions || [],
      };
    } catch { return { goals: [], conditions: [] }; }
  }

  // ── Rule templates (5-7 templates) ───────────────────────────────
  // Each rule: { id, test(ctx)->bool, build(ctx)->{title,sub,icon,cta,href,tone} }
  const RULES = [
    {
      id: 'aqi-running-pivot',
      test: ({ env, profile }) => env.pm25 > 55 && profile.goals.includes('running'),
      build: ({ env }) => ({
        title: 'Pindah training ke gym hari ini',
        sub: `PM2.5 ${Math.round(env.pm25)} μg/m³ — outdoor running tidak disarankan. Treadmill/strength session bisa jadi alternatif.`,
        icon: '🏋️', tone: 'coral', cta: 'Lihat alternatif', href: '/running.html',
      }),
    },
    {
      id: 'asma-mask',
      test: ({ env, profile }) => env.pm25 > 35 && (profile.conditions.includes('asthma') || profile.conditions.includes('asma')),
      build: ({ env }) => ({
        title: 'Pakai masker N95 saat ke luar',
        sub: `PM2.5 ${Math.round(env.pm25)} μg/m³ + riwayat asma — proteksi ekstra direkomendasikan.`,
        icon: '😷', tone: 'amber', cta: 'Tips proteksi', href: '/encyclopedia.html?id=asthma',
      }),
    },
    {
      id: 'heat-window',
      test: ({ env, profile }) => env.heat > 32 && profile.goals.some(g => ['running','outdoor','urban-commute'].includes(g)),
      build: ({ env }) => ({
        title: 'Geser aktivitas ke sore atau pagi sekali',
        sub: `Heat index ${env.heat.toFixed(1)}°C — risiko heat stress. Window optimal: 05:30-07:00 atau setelah 17:30.`,
        icon: '🌅', tone: 'cyan', cta: 'Lihat heat detail', href: '/risk-detail.html?id=heat',
      }),
    },
    {
      id: 'uv-spf',
      test: ({ env }) => env.uv >= 7 && env.hour >= 10 && env.hour <= 15,
      build: ({ env }) => ({
        title: 'Pakai SPF 50+ sebelum keluar',
        sub: `UV index ${env.uv.toFixed(1)} — risiko sunburn tinggi. Reapply tiap 2 jam.`,
        icon: '☀️', tone: 'amber', cta: 'Detail UV', href: '/risk-detail.html?id=uv',
      }),
    },
    {
      id: 'recovery-after-runs',
      test: ({ risks }) => risks.afib > 25 || risks.deh > 35,
      build: () => ({
        title: 'Sesi recovery 15 menit sangat dianjurkan',
        sub: 'HR/SpO₂ atau hidrasi menunjukkan tubuh masih stres. Breathing 4-7-8 + air mineral.',
        icon: '🧘', tone: 'violet', cta: 'Mulai recovery', href: '/recovery.html',
      }),
    },
    {
      id: 'streak-encourage',
      test: () => {
        try {
          const s = JSON.parse(localStorage.getItem('aervinex-streak-local') || '{}');
          return (s.current || 0) >= 3 && (s.current || 0) < 7;
        } catch { return false; }
      },
      build: () => ({
        title: 'Hampir mencapai badge "7-Day Streak"',
        sub: 'Buka dashboard tiap hari untuk lanjut streak — badge unlocks di hari ke-7.',
        icon: '🔥', tone: 'amber', cta: 'Lihat achievements', href: '/achievements.html',
      }),
    },
    {
      id: 'clean-air-window',
      test: ({ env, profile }) => env.pm25 < 25 && env.heat < 30 && profile.goals.includes('running'),
      build: ({ env }) => ({
        title: 'Window udara bersih — saatnya outdoor run',
        sub: `PM2.5 ${Math.round(env.pm25)} μg/m³, suhu ${env.heat.toFixed(1)}°C — kondisi optimal selama ~90 menit ke depan.`,
        icon: '🏃', tone: 'cyan', cta: 'Mulai sesi', href: '/running.html',
      }),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────
  function toneColor(tone) {
    return ({
      cyan: 'rgba(0,229,212,0.18)',
      violet: 'rgba(167,139,250,0.20)',
      coral: 'rgba(255,92,124,0.18)',
      amber: 'rgba(245,158,11,0.18)',
    })[tone] || 'rgba(0,229,212,0.18)';
  }

  async function render(target) {
    if (!target) target = document.getElementById('smartRecs');
    if (!target) return;
    const env = getEnv();
    const risks = getRisks();
    const profile = await getProfile();
    const ctx = { env, risks, profile };

    const cards = [];
    for (const r of RULES) {
      try {
        if (r.test(ctx)) cards.push({ id: r.id, ...r.build(ctx) });
      } catch (e) { /* rule failed silently */ }
    }
    // Fallback if nothing matches
    if (cards.length === 0) {
      cards.push({
        id: 'safe-default',
        title: 'Kondisi aman — pertahankan rutinitas',
        sub: 'Semua parameter lingkungan & fisiologis dalam batas normal. Hidrasi cukup & istirahat ≥7 jam.',
        icon: '✅', tone: 'cyan', cta: 'Buka dashboard', href: '/dashboard.html',
      });
    }

    target.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin:18px 0 10px">
        <h3 style="font-size:14px;font-weight:700;letter-spacing:0.5px;color:#9aabb2;text-transform:uppercase;margin:0">Smart Recommendations</h3>
        <span style="font-size:11px;color:#7d8d94">Berdasarkan goal & risiko Anda</span>
      </div>
      ${cards.slice(0, 4).map(c => `
        <a href="${c.href}" style="text-decoration:none;color:inherit;display:flex;align-items:flex-start;gap:12px;
          padding:14px 16px;margin-bottom:10px;border-radius:14px;
          background:linear-gradient(135deg, ${toneColor(c.tone)}, rgba(15,25,35,0.6));
          border:1px solid rgba(255,255,255,0.06);
          transition:transform 0.15s">
          <div style="font-size:24px;line-height:1.2">${c.icon}</div>
          <div style="flex:1">
            <p style="font-size:14px;font-weight:700;color:#e6f1f4;margin:0 0 3px">${c.title}</p>
            <p style="font-size:12px;color:#b6c4cb;margin:0;line-height:1.45">${c.sub}</p>
            <span style="display:inline-block;margin-top:6px;font-size:11px;font-weight:600;color:#00e5d4">${c.cta} →</span>
          </div>
        </a>
      `).join('')}
    `;
  }

  window.AervinexSmartRecs = { render, getRisks, getEnv, RULES };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => render());
  } else {
    setTimeout(() => render(), 50);
  }
})();
