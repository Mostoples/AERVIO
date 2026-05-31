/* =============================================================================
 *  AERVINEX — Medical Disclaimer Auto-Inject
 *  -----------------------------------------------------------------------------
 *  Auto-injects a wellness disclaimer banner at the bottom of every page that
 *  loads this script. Pages displaying ML output (risk-detail, dashboard, etc)
 *  MUST include this script. First-visit modal forces explicit acceptance.
 *
 *  Disclaimer text is centralized here for consistency across pages.
 * =============================================================================
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'aervinex_medical_disclaimer_v1';

  const DISCLAIMER_SHORT = 'AERVINEX adalah wellness tool, bukan alat medis. Untuk diagnosa, konsultasi dokter.';
  const DISCLAIMER_LONG = `
    <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;color:var(--text)">Disclaimer Medis</h3>
    <p style="font-size:13px;color:var(--text-muted);line-height:1.7;margin-bottom:12px">
      <strong>AERVINEX adalah wellness &amp; lifestyle tracking tool</strong>, bukan alat medis (medical device)
      yang diregulasi BPOM atau FDA. Skor risiko, alert, dan rekomendasi yang ditampilkan adalah hasil
      analisis machine learning dari sensor wearable yang <em>belum melalui clinical validation skala besar</em>.
    </p>
    <ul style="font-size:13px;color:var(--text-muted);line-height:1.8;margin-left:18px;margin-bottom:12px">
      <li>❌ Tidak menggantikan diagnosis dokter, EKG 12-lead, spirometri, atau pemeriksaan laboratorium.</li>
      <li>❌ Tidak boleh dipakai sebagai dasar tunggal untuk menghentikan atau memulai pengobatan.</li>
      <li>❌ Untuk darurat medis (nyeri dada, sesak akut, kehilangan kesadaran) langsung hubungi <strong>119</strong>.</li>
      <li>✅ Boleh dipakai sebagai pelengkap awareness &amp; tracking gaya hidup.</li>
      <li>✅ Boleh menjadi bahan diskusi dengan dokter — bawa data history saat konsultasi.</li>
    </ul>
    <p style="font-size:12px;color:var(--text-dim);line-height:1.6">
      Dengan melanjutkan, Anda memahami dan menyetujui ketentuan ini. Untuk laporan adverse event
      (mis. salah alarm yang menyebabkan tindakan tidak perlu), gunakan
      <a href="/ae-report.html" style="color:var(--accent)">form laporan AE</a>.
    </p>
  `;

  function hasAccepted() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
  }
  function markAccepted() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  function injectBanner() {
    if (document.querySelector('.aervinex-disclaimer-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'aervinex-disclaimer-banner';
    banner.style.cssText = [
      'position:fixed','left:0','right:0','bottom:0',
      'background:rgba(15,25,35,0.95)','color:#9fb0c8',
      'padding:8px 14px','font-size:11px','text-align:center',
      'border-top:1px solid rgba(255,255,255,0.06)','z-index:90',
      'line-height:1.5','letter-spacing:0.2px',
      'backdrop-filter:blur(8px)','-webkit-backdrop-filter:blur(8px)',
    ].join(';');
    banner.innerHTML = `
      ⚕️ ${DISCLAIMER_SHORT}
      <a href="#" data-disclaimer-info style="color:#00e5d4;text-decoration:underline;margin-left:6px">Selengkapnya</a>
    `;
    document.body.appendChild(banner);
    banner.querySelector('[data-disclaimer-info]').addEventListener('click', (e) => {
      e.preventDefault(); openModal({ requireAccept: false });
    });
    // Pad bottom-nav (if present) so banner does not overlap
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.marginBottom = '28px';
    const spacer = document.querySelector('.spacer-bottom');
    if (spacer) spacer.style.height = '60px';
  }

  function openModal({ requireAccept }) {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed','inset:0','background:rgba(0,0,0,0.7)',
      'z-index:200','display:flex','align-items:center','justify-content:center',
      'padding:20px','backdrop-filter:blur(6px)','-webkit-backdrop-filter:blur(6px)',
    ].join(';');
    const card = document.createElement('div');
    card.style.cssText = [
      'background:var(--bg-soft,#1a2433)','color:var(--text,#fff)',
      'border-radius:18px','padding:24px','max-width:520px','width:100%',
      'max-height:88vh','overflow:auto','box-shadow:0 20px 50px rgba(0,0,0,0.5)',
      'border:1px solid rgba(255,255,255,0.06)',
    ].join(';');
    card.innerHTML = DISCLAIMER_LONG + `
      <div style="display:flex;gap:8px;margin-top:16px">
        ${requireAccept ? '' : '<button data-action="close" style="flex:1;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:inherit;font:inherit;cursor:pointer">Tutup</button>'}
        <button data-action="accept" style="flex:1;padding:12px;border-radius:14px;border:none;background:#00e5d4;color:#06222a;font-weight:700;font:inherit;cursor:pointer">Saya Mengerti &amp; Setuju</button>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    card.querySelector('[data-action="accept"]').addEventListener('click', () => {
      markAccepted();
      overlay.remove();
      injectBanner();
    });
    const closeBtn = card.querySelector('[data-action="close"]');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.remove());
  }

  function init() {
    if (typeof document === 'undefined') return;
    const run = () => {
      if (!hasAccepted()) openModal({ requireAccept: true });
      else injectBanner();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  global.AervinexDisclaimer = {
    show: () => openModal({ requireAccept: false }),
    reset: () => { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} },
    hasAccepted,
  };

  init();
})(typeof window !== 'undefined' ? window : globalThis);
