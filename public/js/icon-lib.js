/* AERVINEX Icon Library v2 — Flaticon-style FILLED icons with SMIL infinite loop animations.
   Inspired by flaticon.com/animated-icons (Lottie-style multi-element animations).
   Each icon is self-contained SVG with built-in <animate> / <animateTransform> elements.
   No external CDN. Native browser SMIL — works on Chrome/Firefox/Safari/Edge.

   API:
     AervinexIcons.get('key')               → SVG string with looping animation
     AervinexIcons.get('key', {static:true}) → SVG without animation
     AervinexIcons.fromEmoji('🫁')          → mapped SVG
     AervinexIcons.autoReplace()            → scan DOM and replace emoji icon containers
*/
(function () {
  'use strict';

  // Helper: build self-contained animated SVG.
  // Each icon function returns full SVG markup with embedded animations.
  // Brand palette
  const C = {
    cyan: '#00e5d4', cyanDark: '#00b8a9',
    violet: '#a78bfa', violetDark: '#7c5ce6',
    coral: '#ff5470', coralDark: '#e63960',
    amber: '#ffb547', amberDark: '#e89625',
    green: '#4ade80', greenDark: '#22c55e',
    blue: '#5a8eff', blueDark: '#3a6cd9',
    pink: '#f472b6', pinkDark: '#e041a0',
    yellow: '#fbbf24', red: '#ef4444', white: '#ffffff', dark: '#1a2433',
  };

  // Wrap inner content as SVG. Default viewBox 0 0 48 48.
  function svg(inner, attrs = {}) {
    const vb = attrs.vb || '0 0 48 48';
    const cls = 'ico ico-flat' + (attrs.extra || '');
    return `<svg viewBox="${vb}" class="${cls}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // Animation snippets (return SMIL element strings)
  const anim = {
    scale: (from = 1, to = 1.15, dur = 1.4) => `<animateTransform attributeName="transform" type="scale" values="${from};${to};${from}" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    beat: (dur = 1.4) => `<animateTransform attributeName="transform" type="scale" values="1;1.18;1.04;1.15;1" keyTimes="0;0.15;0.30;0.45;1" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    rotate: (dur = 4) => `<animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="${dur}s" repeatCount="indefinite"/>`,
    rotateCenter: (cx = 24, cy = 24, dur = 4) => `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`,
    shake: (dur = 1.2) => `<animateTransform attributeName="transform" type="rotate" values="0;-8;8;-4;4;0" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    bounce: (dy = 4, dur = 1.4) => `<animateTransform attributeName="transform" type="translate" values="0,0;0,-${dy};0,0" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    float: (dy = 3, dur = 2.6) => `<animateTransform attributeName="transform" type="translate" values="0,0;0,-${dy};0,${dy * 0.3};0,0" keyTimes="0;0.4;0.7;1" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    fade: (low = 0.5, dur = 2) => `<animate attributeName="opacity" values="1;${low};1" dur="${dur}s" repeatCount="indefinite"/>`,
    flicker: (dur = 0.9) => `<animate attributeName="opacity" values="1;0.85;1;0.92;1" keyTimes="0;0.3;0.55;0.8;1" dur="${dur}s" repeatCount="indefinite"/>`,
    flash: (dur = 1.5) => `<animate attributeName="opacity" values="1;0.4;1" dur="${dur}s" repeatCount="indefinite"/>`,
    breath: (dur = 3) => `<animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`,
    spin: (dur = 1.6) => `<animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="${dur}s" repeatCount="indefinite"/>`,
  };

  // ══════════════════════════════════════════════════════════
  // ICON DEFINITIONS — each as function returning SVG markup
  // ══════════════════════════════════════════════════════════
  const ICONS = {

    // ── HEART (beating) ─────────────────────────────────
    heart: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 41.5C24 41.5 5 30 5 17.5C5 11.7 9.7 7 15.5 7C19 7 22.2 8.7 24 11.4C25.8 8.7 29 7 32.5 7C38.3 7 43 11.7 43 17.5C43 30 24 41.5 24 41.5Z" fill="${C.coral}"/>
        <path d="M28 17C28 14.8 26.2 13 24 13" stroke="${C.white}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.4"/>
        ${anim.beat(1.4)}
      </g>
    `),

    'heart-pulse': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 41.5C24 41.5 5 30 5 17.5C5 11.7 9.7 7 15.5 7C19 7 22.2 8.7 24 11.4C25.8 8.7 29 7 32.5 7C38.3 7 43 11.7 43 17.5C43 30 24 41.5 24 41.5Z" fill="${C.coral}"/>
        <path d="M14 22 L19 22 L22 16 L26 28 L30 22 L34 22" stroke="${C.white}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.beat(1.2)}
      </g>
    `),

    // ── LUNG (breathing) ─────────────────────────────────
    lung: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M21 6C21 4.9 21.9 4 23 4H25C26.1 4 27 4.9 27 6V22C27 23 26.6 24 25.7 24.7L24 26L22.3 24.7C21.4 24 21 23 21 22V6Z" fill="${C.blue}"/>
        <path d="M18 14C13 16 8 22 8 30C8 36 11 40 15 40C19 40 21 36 21 32V14C20 13.5 19 13.5 18 14Z" fill="${C.blueDark}"/>
        <path d="M30 14C35 16 40 22 40 30C40 36 37 40 33 40C29 40 27 36 27 32V14C28 13.5 29 13.5 30 14Z" fill="${C.blueDark}"/>
        ${anim.breath(3)}
      </g>
    `),

    // ── BRAIN (sparkle pulse) ────────────────────────────
    brain: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M16 8C13 8 11 10.5 11 13.5C9 14 8 15.5 8 17.5C8 19 8.7 20.3 9.8 21.2C9.3 22.1 9 23 9 24.2C9 26.5 10.5 28.4 12.6 29.2C12.2 30 12 31 12 32C12 35 14 37 17 37C17 39.5 19 41.5 21.5 41.5H22V13C22 10 19.5 8 16 8Z" fill="${C.violet}"/>
        <path d="M32 8C35 8 37 10.5 37 13.5C39 14 40 15.5 40 17.5C40 19 39.3 20.3 38.2 21.2C38.7 22.1 39 23 39 24.2C39 26.5 37.5 28.4 35.4 29.2C35.8 30 36 31 36 32C36 35 34 37 31 37C31 39.5 29 41.5 26.5 41.5H26V13C26 10 28.5 8 32 8Z" fill="${C.violetDark}"/>
        <circle cx="16" cy="20" r="2" fill="${C.cyan}"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/></circle>
        <circle cx="32" cy="22" r="1.5" fill="${C.cyan}"><animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/></circle>
        <circle cx="24" cy="28" r="1" fill="${C.cyan}"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/></circle>
      </g>
    `),

    // ── SUN (rotating rays) ───────────────────────────────
    sun: () => svg(`
      <circle cx="24" cy="24" r="9" fill="${C.amber}"/>
      <circle cx="24" cy="24" r="9" fill="${C.yellow}" opacity="0.5">
        <animate attributeName="r" values="9;11;9" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <g fill="${C.amber}">
        <rect x="22.5" y="2" width="3" height="6" rx="1.5"/>
        <rect x="22.5" y="40" width="3" height="6" rx="1.5"/>
        <rect x="2" y="22.5" width="6" height="3" rx="1.5"/>
        <rect x="40" y="22.5" width="6" height="3" rx="1.5"/>
        <rect x="8" y="8" width="3" height="6" rx="1.5" transform="rotate(-45 9.5 11)"/>
        <rect x="37" y="8" width="3" height="6" rx="1.5" transform="rotate(45 38.5 11)"/>
        <rect x="8" y="34" width="3" height="6" rx="1.5" transform="rotate(45 9.5 37)"/>
        <rect x="37" y="34" width="3" height="6" rx="1.5" transform="rotate(-45 38.5 37)"/>
        ${anim.rotateCenter(24, 24, 8)}
      </g>
    `),

    // ── MOON (gentle float) ───────────────────────────────
    moon: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M30 8C24 9.5 19 14.5 19 22C19 31 26 38 35 38C37 38 39 37.5 41 36.5C36 41.5 29 44 22 41C13 37.5 9 27 13 18C16 11 22 7 30 8Z" fill="${C.amber}"/>
        <circle cx="26" cy="18" r="2" fill="${C.amberDark}" opacity="0.5"/>
        <circle cx="32" cy="25" r="1.5" fill="${C.amberDark}" opacity="0.5"/>
        ${anim.float(3, 3)}
      </g>
    `),

    // ── FLAME (flicker) ───────────────────────────────────
    flame: () => svg(`
      <g style="transform-origin:24px 36px;transform-box:view-box">
        <path d="M24 6C28 12 32 16 32 22C32 27 28.5 31 24 31C19.5 31 16 27 16 22C16 18 18 16 20 14C19 18 21 21 23 21C23 17 25 14 24 6Z" fill="${C.coral}"/>
        <path d="M24 42C29 42 33 38 33 32C33 28 31 26 29 24C28 28 26 30 24 30C22 30 20 28 19 24C17 26 15 28 15 32C15 38 19 42 24 42Z" fill="${C.amber}"/>
        <path d="M24 38C26 38 27 36 27 33C27 31 26 30 25 30C25 32 24 33 23 33C22 33 21 32 21 30C20 31 19 32 19 33C19 36 22 38 24 38Z" fill="${C.yellow}"/>
        <animateTransform attributeName="transform" type="scale" values="1,1;1.05,0.95;1,1;1.02,0.98;1,1" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" repeatCount="indefinite" additive="sum"/>
      </g>
    `),

    // ── WATER DROP (float bounce) ────────────────────────
    'water-drop': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 4C24 4 10 19 10 30C10 38 16 43 24 43C32 43 38 38 38 30C38 19 24 4 24 4Z" fill="${C.blue}"/>
        <path d="M14 28C14 24 17 22 19 25C18 28 16 30 14 28Z" fill="${C.white}" opacity="0.5"/>
        ${anim.float(2, 2.4)}
      </g>
    `),

    droplets: () => svg(`
      <g>
        <g style="transform-origin:14px 28px;transform-box:view-box">
          <path d="M14 12C14 12 7 21 7 27C7 31 10 34 14 34C18 34 21 31 21 27C21 21 14 12 14 12Z" fill="${C.blue}"/>
          ${anim.float(2, 2)}
        </g>
        <g style="transform-origin:32px 22px;transform-box:view-box">
          <path d="M32 8C32 8 25 17 25 23C25 27 28 30 32 30C36 30 39 27 39 23C39 17 32 8 32 8Z" fill="${C.blueDark}"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" begin="0.5s" repeatCount="indefinite" additive="sum"/>
        </g>
      </g>
    `),

    // ── CLOUD ─────────────────────────────────────────────
    cloud: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M14 32H35C38 32 41 29.5 41 26C41 23 38.5 21 35.5 21C35 17 31.5 14 27 14C23 14 19.5 16.5 18.5 20C14.5 20 11 23.5 11 27.5C11 30 12.5 32 14 32Z" fill="${C.blue}"/>
        ${anim.float(2, 3)}
      </g>
    `),

    'cloud-fog': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M14 28H35C38 28 41 25.5 41 22C41 19 38.5 17 35.5 17C35 13 31.5 10 27 10C23 10 19.5 12.5 18.5 16C14.5 16 11 19.5 11 23.5C11 26 12.5 28 14 28Z" fill="${C.violet}"/>
        <circle cx="10" cy="34" r="2" fill="${C.coral}"><animate attributeName="cy" values="34;36;34" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="18" cy="38" r="1.5" fill="${C.violet}"><animate attributeName="cy" values="38;40;38" dur="2.4s" repeatCount="indefinite"/></circle>
        <circle cx="26" cy="36" r="2" fill="${C.coral}"><animate attributeName="cy" values="36;38;36" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="34" cy="40" r="1.5" fill="${C.violet}"><animate attributeName="cy" values="40;42;40" dur="2.6s" repeatCount="indefinite"/></circle>
        <circle cx="40" cy="36" r="1.5" fill="${C.coral}"><animate attributeName="cy" values="36;38;36" dur="2.1s" repeatCount="indefinite"/></circle>
      </g>
    `),

    // ── SPARKLES (twinkle) ───────────────────────────────
    sparkles: () => svg(`
      <g>
        <path d="M24 4 L26 18 L40 20 L26 22 L24 36 L22 22 L8 20 L22 18 Z" fill="${C.amber}">
          <animateTransform attributeName="transform" type="rotate" from="0 24 20" to="360 24 20" dur="6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M38 30 L39 36 L45 37 L39 38 L38 44 L37 38 L31 37 L37 36 Z" fill="${C.cyan}">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/>
        </path>
        <path d="M8 6 L9 11 L14 12 L9 13 L8 18 L7 13 L2 12 L7 11 Z" fill="${C.violet}">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
        </path>
      </g>
    `),

    // ── BELL (shake) ─────────────────────────────────────
    bell: () => svg(`
      <g style="transform-origin:24px 16px;transform-box:view-box">
        <path d="M12 32C12 23 16 14 24 14C32 14 36 23 36 32H38L40 36H8L10 32H12Z" fill="${C.amber}"/>
        <circle cx="24" cy="10" r="3" fill="${C.amberDark}"/>
        <path d="M20 36C20 39 22 41 24 41C26 41 28 39 28 36" stroke="${C.amberDark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${anim.shake(1.4)}
      </g>
    `),

    alarm: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M12 32C12 23 16 14 24 14C32 14 36 23 36 32H38L40 36H8L10 32H12Z" fill="${C.coral}"/>
        <circle cx="24" cy="10" r="3" fill="${C.coralDark}"/>
        <path d="M20 36C20 39 22 41 24 41C26 41 28 39 28 36" stroke="${C.coralDark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${anim.shake(0.9)}
      </g>
    `),

    // ── LIGHTNING (flash) ────────────────────────────────
    lightning: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M26 4L10 26H22L20 44L38 22H26L28 4H26Z" fill="${C.yellow}" stroke="${C.amberDark}" stroke-width="1.5" stroke-linejoin="round"/>
        ${anim.flash(1.3)}
      </g>
    `),

    // ── VIRUS (rotating) ─────────────────────────────────
    virus: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="10" fill="${C.coral}"/>
        <circle cx="24" cy="24" r="6" fill="${C.coralDark}"/>
        <g fill="${C.coral}">
          <circle cx="24" cy="6" r="2"/>
          <circle cx="24" cy="42" r="2"/>
          <circle cx="6" cy="24" r="2"/>
          <circle cx="42" cy="24" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="38" cy="10" r="2"/>
          <circle cx="10" cy="38" r="2"/>
          <circle cx="38" cy="38" r="2"/>
        </g>
        <g stroke="${C.coral}" stroke-width="2" stroke-linecap="round">
          <line x1="24" y1="14" x2="24" y2="8"/>
          <line x1="24" y1="34" x2="24" y2="40"/>
          <line x1="14" y1="24" x2="8" y2="24"/>
          <line x1="34" y1="24" x2="40" y2="24"/>
          <line x1="17" y1="17" x2="12" y2="12"/>
          <line x1="31" y1="17" x2="36" y2="12"/>
          <line x1="17" y1="31" x2="12" y2="36"/>
          <line x1="31" y1="31" x2="36" y2="36"/>
        </g>
        ${anim.rotateCenter(24, 24, 8)}
      </g>
    `),

    // ── THERMOMETER (fever) ──────────────────────────────
    thermometer: () => svg(`
      <g style="transform-origin:24px 30px;transform-box:view-box">
        <path d="M20 6C20 3.8 21.8 2 24 2C26.2 2 28 3.8 28 6V28C29.8 29.5 31 31.6 31 34C31 38 27.9 41 24 41C20.1 41 17 38 17 34C17 31.6 18.2 29.5 20 28V6Z" fill="${C.coral}" stroke="${C.coralDark}" stroke-width="1.5"/>
        <rect x="22.5" y="10" width="3" height="22" rx="1.5" fill="${C.white}"/>
        <circle cx="24" cy="34" r="5" fill="${C.coralDark}">
          <animate attributeName="r" values="5;5.5;5" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      </g>
    `),

    fever: () => svg(`
      <g style="transform-origin:24px 30px;transform-box:view-box">
        <path d="M20 8C20 5.8 21.8 4 24 4C26.2 4 28 5.8 28 8V28C29.8 29.5 31 31.6 31 34C31 38 27.9 41 24 41C20.1 41 17 38 17 34C17 31.6 18.2 29.5 20 28V8Z" fill="${C.coral}" stroke="${C.coralDark}" stroke-width="1.5"/>
        <rect x="22.5" y="12" width="3" height="22" rx="1.5" fill="${C.amber}"/>
        <circle cx="24" cy="34" r="5" fill="${C.amberDark}">
          <animate attributeName="r" values="5;5.5;5" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <text x="36" y="14" fill="${C.coral}" font-size="12" font-weight="800">!</text>
      </g>
    `),

    // ── EYE ───────────────────────────────────────────────
    eye: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M3 24C3 24 11 12 24 12C37 12 45 24 45 24C45 24 37 36 24 36C11 36 3 24 3 24Z" fill="${C.blue}"/>
        <circle cx="24" cy="24" r="9" fill="${C.white}"/>
        <circle cx="24" cy="24" r="5" fill="${C.dark}">
          <animate attributeName="r" values="5;3.5;5" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="22" cy="22" r="1.5" fill="${C.white}"/>
      </g>
    `),

    // ── SUN-PROTECT for UV (warning) ─────────────────────
    'sun-warn': () => svg(`
      <circle cx="24" cy="24" r="9" fill="${C.amber}"/>
      <g fill="${C.coral}">
        <rect x="22.5" y="2" width="3" height="6" rx="1.5"/>
        <rect x="22.5" y="40" width="3" height="6" rx="1.5"/>
        <rect x="2" y="22.5" width="6" height="3" rx="1.5"/>
        <rect x="40" y="22.5" width="6" height="3" rx="1.5"/>
        ${anim.rotateCenter(24, 24, 6)}
      </g>
      <circle cx="24" cy="24" r="3" fill="${C.coralDark}">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
      </circle>
    `),

    // ── LEAF (floating) ──────────────────────────────────
    leaf: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M40 8C40 8 16 8 12 24C8 36 14 40 20 40C30 40 38 32 40 22C42 14 40 8 40 8Z" fill="${C.green}"/>
        <path d="M24 16C20 20 16 26 14 32" stroke="${C.greenDark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        ${anim.float(3, 3)}
      </g>
    `),

    // ── PIN LOCATION (bouncing) ──────────────────────────
    pin: () => svg(`
      <g style="transform-origin:24px 36px;transform-box:view-box">
        <path d="M24 4C16 4 10 10 10 18C10 28 24 42 24 42C24 42 38 28 38 18C38 10 32 4 24 4Z" fill="${C.coral}"/>
        <circle cx="24" cy="18" r="5" fill="${C.white}"/>
        ${anim.bounce(4, 1.4)}
      </g>
    `),

    'pin-active': () => svg(`
      <g style="transform-origin:24px 36px;transform-box:view-box">
        <path d="M24 4C16 4 10 10 10 18C10 28 24 42 24 42C24 42 38 28 38 18C38 10 32 4 24 4Z" fill="${C.cyan}"/>
        <circle cx="24" cy="18" r="5" fill="${C.white}"/>
        <circle cx="24" cy="42" r="6" fill="${C.cyan}" opacity="0.3">
          <animate attributeName="r" values="6;14;6" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        ${anim.bounce(3, 1.2)}
      </g>
    `),

    // ── WIND ──────────────────────────────────────────────
    wind: () => svg(`
      <g stroke="${C.cyan}" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M4 16L24 16C26 16 28 14 28 12C28 10 26 8 24 8C22 8 20 10 20 12"/>
        <path d="M4 24L34 24C36 24 38 22 38 20C38 18 36 16 34 16"/>
        <path d="M4 32L30 32C32 32 34 34 34 36C34 38 32 40 30 40C28 40 26 38 26 36"/>
        ${anim.float(2, 2.2)}
      </g>
    `),

    // ── ACTIVITY: RUN ─────────────────────────────────────
    run: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="30" cy="9" r="4" fill="${C.amber}"/>
        <path d="M14 30 L20 22 L25 27 L22 35 L18 38" stroke="${C.amber}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 22 L28 17 L34 22 L36 28" stroke="${C.amber}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 22 L14 18" stroke="${C.amber}" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${anim.bounce(2, 0.8)}
      </g>
    `),

    walk: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="26" cy="9" r="4" fill="${C.cyan}"/>
        <path d="M18 32 L22 22 L26 26 L24 34 L20 40" stroke="${C.cyan}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 22 L28 18 L32 28" stroke="${C.cyan}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.bounce(1.5, 1)}
      </g>
    `),

    bed: () => svg(`
      <g>
        <path d="M4 24V36H44V28C44 25.8 42.2 24 40 24H4Z" fill="${C.violet}"/>
        <rect x="4" y="36" width="40" height="3" fill="${C.violetDark}"/>
        <path d="M12 24V18C12 16 13.5 14.5 15.5 14.5H22.5C24.5 14.5 26 16 26 18V24" fill="${C.violet}"/>
        <text x="36" y="14" font-size="10" fill="${C.violet}" font-weight="800">Z</text>
        <text x="40" y="20" font-size="8" fill="${C.violet}" opacity="0.6" font-weight="800">z</text>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite"/>
      </g>
    `),

    barbell: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="4" y="20" width="4" height="8" rx="1" fill="${C.dark}"/>
        <rect x="40" y="20" width="4" height="8" rx="1" fill="${C.dark}"/>
        <rect x="8" y="16" width="6" height="16" rx="1.5" fill="${C.violet}"/>
        <rect x="34" y="16" width="6" height="16" rx="1.5" fill="${C.violet}"/>
        <rect x="14" y="22" width="20" height="4" fill="${C.dark}"/>
        ${anim.scale(1, 1.05, 1.2)}
      </g>
    `),

    // ── BATTERY ───────────────────────────────────────────
    'battery-low': () => svg(`
      <g>
        <rect x="4" y="14" width="38" height="20" rx="3" stroke="${C.coral}" stroke-width="2.5" fill="${C.bg || 'transparent'}"/>
        <rect x="44" y="20" width="3" height="8" rx="1" fill="${C.coral}"/>
        <rect x="7" y="17" width="6" height="14" rx="1" fill="${C.coral}">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
        </rect>
        <text x="22" y="29" font-size="14" fill="${C.coral}" font-weight="800">!</text>
      </g>
    `),

    battery: () => svg(`
      <g>
        <rect x="4" y="14" width="38" height="20" rx="3" stroke="${C.green}" stroke-width="2.5" fill="transparent"/>
        <rect x="44" y="20" width="3" height="8" rx="1" fill="${C.green}"/>
        <rect x="7" y="17" width="28" height="14" rx="1" fill="${C.green}">
          <animate attributeName="width" values="28;30;28" dur="2s" repeatCount="indefinite"/>
        </rect>
      </g>
    `),

    // ── SYNC (rotating) ──────────────────────────────────
    sync: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M8 24C8 15.2 15.2 8 24 8C29 8 33.5 10.3 36.5 14L40 10V20H30L33.5 16.5C31 13.7 27.7 12 24 12C17.4 12 12 17.4 12 24" fill="${C.cyan}"/>
        <path d="M40 24C40 32.8 32.8 40 24 40C19 40 14.5 37.7 11.5 34L8 38V28H18L14.5 31.5C17 34.3 20.3 36 24 36C30.6 36 36 30.6 36 24" fill="${C.cyanDark}"/>
        ${anim.rotateCenter(24, 24, 2.5)}
      </g>
    `),

    // ── CHECKS ────────────────────────────────────────────
    'check-c': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.green}"/>
        <path d="M15 25L21 31L33 18" stroke="${C.white}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.scale(1, 1.08, 2)}
      </g>
    `),

    check: () => svg(`
      <path d="M9 27L18 36L39 14" stroke="${C.green}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${anim.scale(1, 1.1, 1.4)}
      </path>
    `),

    // ── WARN ──────────────────────────────────────────────
    'warn-c': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.amber}"/>
        <rect x="22" y="12" width="4" height="14" rx="2" fill="${C.white}"/>
        <circle cx="24" cy="32" r="2.5" fill="${C.white}"/>
        ${anim.flash(1.4)}
      </g>
    `),

    warn: () => svg(`
      <g style="transform-origin:24px 28px;transform-box:view-box">
        <path d="M24 6L44 40H4L24 6Z" fill="${C.amber}" stroke="${C.amberDark}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="22" y="18" width="4" height="12" rx="2" fill="${C.white}"/>
        <circle cx="24" cy="35" r="2" fill="${C.white}"/>
        ${anim.flash(1.6)}
      </g>
    `),

    danger: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.coral}"/>
        <line x1="10" y1="10" x2="38" y2="38" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>
        ${anim.flash(1.2)}
      </g>
    `),

    critical: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.coral}">
          <animate attributeName="r" values="20;21;20" dur="0.7s" repeatCount="indefinite"/>
        </circle>
        <rect x="22" y="11" width="4" height="16" rx="2" fill="${C.white}"/>
        <circle cx="24" cy="34" r="3" fill="${C.white}"/>
      </g>
    `),

    info: () => svg(`
      <g>
        <circle cx="24" cy="24" r="20" fill="${C.blue}"/>
        <circle cx="24" cy="14" r="2.5" fill="${C.white}"/>
        <rect x="22" y="20" width="4" height="16" rx="2" fill="${C.white}"/>
      </g>
    `),

    // ── SHIELD ────────────────────────────────────────────
    shield: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 4L8 10V22C8 32 14 40 24 44C34 40 40 32 40 22V10L24 4Z" fill="${C.cyan}"/>
        <path d="M16 24L22 30L32 18" stroke="${C.white}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.scale(1, 1.05, 2.4)}
      </g>
    `),

    // ── DEVICE ────────────────────────────────────────────
    watch: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="14" y="4" width="20" height="8" rx="2" fill="${C.dark}"/>
        <rect x="14" y="36" width="20" height="8" rx="2" fill="${C.dark}"/>
        <rect x="10" y="11" width="28" height="26" rx="6" fill="${C.dark}"/>
        <rect x="13" y="14" width="22" height="20" rx="3" fill="${C.cyan}"/>
        <text x="24" y="27" font-size="8" fill="${C.white}" font-weight="800" text-anchor="middle">A</text>
        <animate attributeName="opacity" values="1;0.92;1" dur="2s" repeatCount="indefinite"/>
      </g>
    `),

    phone: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="12" y="4" width="24" height="40" rx="5" fill="${C.dark}"/>
        <rect x="15" y="9" width="18" height="28" rx="1" fill="${C.cyan}"/>
        <circle cx="24" cy="41" r="2" fill="${C.cyanDark}"/>
        ${anim.float(2, 3)}
      </g>
    `),

    bot: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="8" y="18" width="32" height="22" rx="5" fill="${C.cyan}"/>
        <circle cx="24" cy="9" r="3" fill="${C.cyanDark}"/>
        <line x1="24" y1="12" x2="24" y2="18" stroke="${C.cyan}" stroke-width="2.5"/>
        <circle cx="16" cy="28" r="2.5" fill="${C.white}"><animate attributeName="r" values="2.5;1;2.5" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="32" cy="28" r="2.5" fill="${C.white}"><animate attributeName="r" values="2.5;1;2.5" dur="2s" begin="0.3s" repeatCount="indefinite"/></circle>
        <rect x="18" y="33" width="12" height="2" rx="1" fill="${C.cyanDark}"/>
        ${anim.float(2, 3.4)}
      </g>
    `),

    package: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 4L8 12V32L24 40L40 32V12L24 4Z" fill="${C.violet}" stroke="${C.violetDark}" stroke-width="1.5"/>
        <path d="M24 4L40 12L24 20L8 12L24 4Z" fill="${C.violetDark}"/>
        <path d="M24 20V40" stroke="${C.white}" stroke-width="1.5" opacity="0.5"/>
        ${anim.bounce(1.5, 2)}
      </g>
    `),

    key: () => svg(`
      <g style="transform-origin:14px 24px;transform-box:view-box">
        <circle cx="14" cy="24" r="9" fill="${C.amber}"/>
        <circle cx="14" cy="24" r="3" fill="${C.dark}"/>
        <path d="M22 24L40 24L40 30L36 30L36 26L32 26L32 30L26 30L26 26L22 26" fill="${C.amber}"/>
        ${anim.rotate(8)}
      </g>
    `),

    // ── CHARTS ────────────────────────────────────────────
    'chart-bar': () => svg(`
      <g>
        <rect x="6" y="28" width="8" height="14" rx="1" fill="${C.cyan}"><animate attributeName="height" values="14;18;14" dur="2s" repeatCount="indefinite"/><animate attributeName="y" values="28;24;28" dur="2s" repeatCount="indefinite"/></rect>
        <rect x="20" y="20" width="8" height="22" rx="1" fill="${C.violet}"><animate attributeName="height" values="22;26;22" dur="2s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="y" values="20;16;20" dur="2s" begin="0.3s" repeatCount="indefinite"/></rect>
        <rect x="34" y="12" width="8" height="30" rx="1" fill="${C.coral}"><animate attributeName="height" values="30;34;30" dur="2s" begin="0.6s" repeatCount="indefinite"/><animate attributeName="y" values="12;8;12" dur="2s" begin="0.6s" repeatCount="indefinite"/></rect>
      </g>
    `),

    'chart-line': () => svg(`
      <g>
        <polyline points="6,38 16,28 24,32 32,18 42,12" stroke="${C.cyan}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="points" values="6,38 16,28 24,32 32,18 42,12;6,36 16,30 24,28 32,22 42,16;6,38 16,28 24,32 32,18 42,12" dur="3s" repeatCount="indefinite"/>
        </polyline>
        <circle cx="42" cy="12" r="3" fill="${C.cyan}">
          <animate attributeName="cy" values="12;16;12" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    `),

    'trend-up': () => svg(`
      <g>
        <polyline points="6,36 18,28 26,32 38,12" stroke="${C.green}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="32,12 38,12 38,18" stroke="${C.green}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.bounce(2, 1.4)}
      </g>
    `),

    'trend-down': () => svg(`
      <g>
        <polyline points="6,12 18,20 26,16 38,36" stroke="${C.coral}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="32,36 38,36 38,30" stroke="${C.coral}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${anim.bounce(2, 1.4)}
      </g>
    `),

    // ── COMM ──────────────────────────────────────────────
    bell_classic: () => svg(`
      <g style="transform-origin:24px 16px;transform-box:view-box">
        <path d="M12 32C12 23 16 14 24 14C32 14 36 23 36 32H38L40 36H8L10 32H12Z" fill="${C.amber}"/>
        <circle cx="24" cy="10" r="3" fill="${C.amberDark}"/>
        ${anim.shake(1.6)}
      </g>
    `),

    message: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M8 12C8 9.8 9.8 8 12 8H36C38.2 8 40 9.8 40 12V30C40 32.2 38.2 34 36 34H20L12 40V34C9.8 34 8 32.2 8 30V12Z" fill="${C.cyan}"/>
        <circle cx="18" cy="21" r="2" fill="${C.white}"/>
        <circle cx="24" cy="21" r="2" fill="${C.white}"/>
        <circle cx="30" cy="21" r="2" fill="${C.white}"/>
        ${anim.float(2, 2.6)}
      </g>
    `),

    email: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="4" y="10" width="40" height="28" rx="3" fill="${C.violet}"/>
        <polyline points="4,12 24,26 44,12" stroke="${C.white}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        ${anim.bounce(1.5, 2.4)}
      </g>
    `),

    // ── TIME ──────────────────────────────────────────────
    clock: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.cyan}"/>
        <circle cx="24" cy="24" r="16" fill="${C.bg || '#1a2433'}" stroke="${C.cyanDark}" stroke-width="1"/>
        <line x1="24" y1="24" x2="24" y2="12" stroke="${C.white}" stroke-width="3" stroke-linecap="round">
          ${anim.rotateCenter(24, 24, 8)}
        </line>
        <line x1="24" y1="24" x2="32" y2="24" stroke="${C.white}" stroke-width="2.5" stroke-linecap="round">
          ${anim.rotateCenter(24, 24, 1.5)}
        </line>
        <circle cx="24" cy="24" r="2" fill="${C.cyan}"/>
      </g>
    `),

    calendar: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <rect x="6" y="10" width="36" height="32" rx="3" fill="${C.violet}"/>
        <rect x="6" y="10" width="36" height="8" fill="${C.violetDark}"/>
        <rect x="12" y="4" width="3" height="10" rx="1" fill="${C.dark}"/>
        <rect x="33" y="4" width="3" height="10" rx="1" fill="${C.dark}"/>
        <text x="24" y="34" font-size="14" fill="${C.white}" font-weight="800" text-anchor="middle">15</text>
        ${anim.float(2, 3)}
      </g>
    `),

    // ── DOC ───────────────────────────────────────────────
    doc: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M10 4H28L38 14V40C38 42.2 36.2 44 34 44H10C7.8 44 6 42.2 6 40V8C6 5.8 7.8 4 10 4Z" fill="${C.cyan}"/>
        <path d="M28 4V14H38L28 4Z" fill="${C.cyanDark}"/>
        <rect x="12" y="22" width="20" height="2" rx="1" fill="${C.white}"/>
        <rect x="12" y="28" width="20" height="2" rx="1" fill="${C.white}"/>
        <rect x="12" y="34" width="12" height="2" rx="1" fill="${C.white}"/>
        ${anim.float(2, 3)}
      </g>
    `),

    bookmark: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M12 4H36V44L24 36L12 44V4Z" fill="${C.violet}"/>
        ${anim.bounce(2, 2)}
      </g>
    `),

    trash: () => svg(`
      <g>
        <rect x="8" y="14" width="32" height="4" rx="2" fill="${C.coral}"/>
        <path d="M10 18H38L36 42C35.8 43.1 34.9 44 33.7 44H14.3C13.1 44 12.2 43.1 12 42L10 18Z" fill="${C.coralDark}"/>
        <rect x="20" y="10" width="8" height="4" rx="1" fill="${C.coral}"/>
        ${anim.shake(2)}
      </g>
    `),

    globe: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.blue}"/>
        <ellipse cx="24" cy="24" rx="20" ry="8" stroke="${C.white}" stroke-width="1.5" fill="none" opacity="0.6"/>
        <ellipse cx="24" cy="24" rx="8" ry="20" stroke="${C.white}" stroke-width="1.5" fill="none" opacity="0.6"/>
        <line x1="4" y1="24" x2="44" y2="24" stroke="${C.white}" stroke-width="1.5" opacity="0.6"/>
        ${anim.rotateCenter(24, 24, 8)}
      </g>
    `),

    flag: () => svg(`
      <g>
        <line x1="8" y1="6" x2="8" y2="42" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>
        <path d="M8 8L40 8L34 16L40 24L8 24L8 8Z" fill="${C.coral}"/>
        <animateTransform attributeName="transform" type="skewX" values="0;3;0;-3;0" dur="2.4s" repeatCount="indefinite"/>
      </g>
    `),

    play: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.cyan}"/>
        <path d="M19 16L33 24L19 32Z" fill="${C.dark}"/>
        ${anim.scale(1, 1.05, 2)}
      </g>
    `),

    // ── COMMON UI ─────────────────────────────────────────
    search: () => svg(`
      <g>
        <circle cx="20" cy="20" r="12" stroke="${C.cyan}" stroke-width="3.5" fill="none"/>
        <line x1="29" y1="29" x2="42" y2="42" stroke="${C.cyan}" stroke-width="3.5" stroke-linecap="round"/>
        ${anim.bounce(1.5, 2.4)}
      </g>
    `),

    plus: () => svg(`
      <g>
        <line x1="24" y1="6" x2="24" y2="42" stroke="${C.cyan}" stroke-width="4" stroke-linecap="round"/>
        <line x1="6" y1="24" x2="42" y2="24" stroke="${C.cyan}" stroke-width="4" stroke-linecap="round"/>
        ${anim.scale(1, 1.1, 1.6)}
      </g>
    `),

    close: () => svg(`
      <g>
        <line x1="10" y1="10" x2="38" y2="38" stroke="${C.coral}" stroke-width="4" stroke-linecap="round"/>
        <line x1="38" y1="10" x2="10" y2="38" stroke="${C.coral}" stroke-width="4" stroke-linecap="round"/>
      </g>
    `),

    menu: () => svg(`
      <g>
        <rect x="6" y="10" width="36" height="4" rx="2" fill="${C.cyan}"/>
        <rect x="6" y="22" width="36" height="4" rx="2" fill="${C.cyan}"/>
        <rect x="6" y="34" width="36" height="4" rx="2" fill="${C.cyan}"/>
      </g>
    `),

    // ── EMOTIONS ──────────────────────────────────────────
    stress: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.violet}"/>
        <ellipse cx="16" cy="20" rx="2" ry="2.5" fill="${C.dark}"/>
        <ellipse cx="32" cy="20" rx="2" ry="2.5" fill="${C.dark}"/>
        <path d="M14 32 Q24 28 34 32" stroke="${C.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        ${anim.scale(1, 1.04, 1.6)}
      </g>
    `),

    'face-panic': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="24" r="20" fill="${C.coral}"/>
        <ellipse cx="16" cy="20" rx="2.5" ry="3.5" fill="${C.white}"/>
        <circle cx="16" cy="21" r="1.5" fill="${C.dark}"/>
        <ellipse cx="32" cy="20" rx="2.5" ry="3.5" fill="${C.white}"/>
        <circle cx="32" cy="21" r="1.5" fill="${C.dark}"/>
        <ellipse cx="24" cy="34" rx="6" ry="4" fill="${C.dark}"/>
        ${anim.shake(0.8)}
      </g>
    `),

    smile: () => svg(`
      <g>
        <circle cx="24" cy="24" r="20" fill="${C.amber}"/>
        <circle cx="16" cy="20" r="2.5" fill="${C.dark}"/>
        <circle cx="32" cy="20" r="2.5" fill="${C.dark}"/>
        <path d="M14 28 Q24 38 34 28" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    `),

    mindful: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="14" r="5" fill="${C.violet}"/>
        <path d="M16 38C16 33 19 30 24 30C29 30 32 33 32 38V42H16V38Z" fill="${C.violet}"/>
        <path d="M12 26C9 24 8 21 8 18" stroke="${C.violet}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M36 26C39 24 40 21 40 18" stroke="${C.violet}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${anim.breath(4)}
      </g>
    `),

    sneeze: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="24" cy="20" r="14" fill="${C.amber}"/>
        <circle cx="20" cy="18" r="1.5" fill="${C.dark}"/>
        <circle cx="28" cy="18" r="1.5" fill="${C.dark}"/>
        <ellipse cx="24" cy="26" rx="3" ry="2" fill="${C.dark}"/>
        <g fill="${C.blue}" opacity="0.7">
          <circle cx="38" cy="32" r="2.5"><animate attributeName="cx" values="38;42;38" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/></circle>
          <circle cx="36" cy="38" r="2"><animate attributeName="cx" values="36;42;36" dur="1.5s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" begin="0.3s" repeatCount="indefinite"/></circle>
        </g>
        ${anim.shake(1)}
      </g>
    `),

    cough: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <circle cx="20" cy="20" r="14" fill="${C.amber}"/>
        <circle cx="16" cy="18" r="1.5" fill="${C.dark}"/>
        <circle cx="24" cy="18" r="1.5" fill="${C.dark}"/>
        <ellipse cx="20" cy="26" rx="3" ry="2" fill="${C.dark}"/>
        <g stroke="${C.coral}" stroke-width="2.5" stroke-linecap="round" opacity="0.8">
          <line x1="34" y1="20" x2="42" y2="18">
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite"/>
          </line>
          <line x1="36" y1="26" x2="44" y2="26">
            <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" repeatCount="indefinite"/>
          </line>
          <line x1="34" y1="32" x2="42" y2="34">
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" begin="0.3s" repeatCount="indefinite"/>
          </line>
        </g>
        ${anim.shake(0.8)}
      </g>
    `),

    couch: () => svg(`
      <path d="M4 28V22C4 19.8 5.8 18 8 18H40C42.2 18 44 19.8 44 22V28L46 34V40H40L38 36H10L8 40H2V34L4 28Z" fill="${C.violet}"/>
    `),

    // ── ARROWS (for trends) ──────────────────────────────
    'arrow-up': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 8L8 24L18 24L18 40L30 40L30 24L40 24L24 8Z" fill="${C.green}"/>
        ${anim.bounce(3, 1.4)}
      </g>
    `),

    'arrow-down': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M24 40L40 24L30 24L30 8L18 8L18 24L8 24L24 40Z" fill="${C.coral}"/>
        ${anim.bounce(3, 1.4)}
      </g>
    `),

    'arrow-right': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M40 24L24 8L24 18L8 18L8 30L24 30L24 40L40 24Z" fill="${C.cyan}"/>
        <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="1.4s" repeatCount="indefinite" additive="sum"/>
      </g>
    `),

    // ── DATABASE ─────────────────────────────────────────
    database: () => svg(`
      <g>
        <ellipse cx="24" cy="10" rx="16" ry="5" fill="${C.cyan}"/>
        <path d="M8 10V20C8 22.8 15.2 25 24 25C32.8 25 40 22.8 40 20V10" fill="${C.cyanDark}"/>
        <path d="M8 20V30C8 32.8 15.2 35 24 35C32.8 35 40 32.8 40 30V20" fill="${C.cyan}"/>
        <path d="M8 30V40C8 42.8 15.2 45 24 45C32.8 45 40 42.8 40 40V30" fill="${C.cyanDark}"/>
        ${anim.flicker(2)}
      </g>
    `),

    bone: () => svg(`<path d="M12 12 Q8 8 12 4 Q16 4 16 8 L32 8 Q32 4 36 4 Q40 8 36 12 Q40 16 36 20 Q32 20 32 16 L16 16 Q16 20 12 20 Q8 16 12 12 Z" fill="${C.white}" stroke="${C.dark}" stroke-width="1.5"/>`),

    // ── AERVINEX BRAND LOGO ────────────────────────────
    // Simplified (untuk FAB / kecil) — stylized A + swoosh + heart pulse
    'aervinex-logo': () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <!-- Letter A (vertikal arms) -->
        <path d="M14 38 L24 10 L34 38" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Swoosh / checkmark through A -->
        <path d="M9 26 L20 30 L38 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
        <!-- Heart pulse di tengah-bawah A -->
        <circle cx="24" cy="33" r="2" fill="currentColor" opacity="0.85">
          <animate attributeName="r" values="2;2.6;2" dur="1.3s" repeatCount="indefinite"/>
        </circle>
        <!-- Subtle scale pulse -->
        <animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="2.4s" repeatCount="indefinite" additive="sum"/>
      </g>
    </svg>`,

    // Full version dengan watch ring + tick marks + crown (untuk hero/loading/large)
    'aervinex-logo-full': () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <!-- Watch ring -->
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="2" opacity="0.75"/>
        <!-- Tick marks 12/3/6/9 -->
        <line x1="24" y1="5" x2="24" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="24" y1="40" x2="24" y2="43" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="5" y1="24" x2="8" y2="24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="40" y1="24" x2="43" y2="24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Watch crown (right side) -->
        <rect x="43" y="22" width="3" height="4" rx="0.6" fill="currentColor"/>
        <!-- Letter A -->
        <path d="M16 34 L24 14 L32 34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Swoosh / checkmark -->
        <path d="M11 26 L20 30 L36 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
        <!-- Heart pulse -->
        <circle cx="24" cy="30" r="1.8" fill="currentColor" opacity="0.85">
          <animate attributeName="r" values="1.8;2.4;1.8" dur="1.3s" repeatCount="indefinite"/>
        </circle>
        <animateTransform attributeName="transform" type="scale" values="1;1.03;1" dur="2.4s" repeatCount="indefinite" additive="sum"/>
      </g>
    </svg>`,

    // ── ASSESSMENT / QUESTIONNAIRE (clipboard with sequential checks) ──
    assessment: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <!-- Clipboard body -->
        <rect x="8" y="10" width="32" height="34" rx="4" fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.32)" stroke-width="1.5"/>
        <!-- Clip top -->
        <rect x="17" y="4" width="14" height="10" rx="2" fill="rgba(0,0,0,0.38)"/>
        <circle cx="24" cy="9" r="1.5" fill="${C.white}" opacity="0.5"/>

        <!-- Row 1 -->
        <rect x="13" y="18" width="5" height="5" rx="1.2" fill="${C.white}" opacity="0.95"/>
        <rect x="21" y="19.5" width="18" height="2" rx="1" fill="${C.white}" opacity="0.55"/>
        <path d="M14 20.5 l1.4 1.4 2.8 -2.8" stroke="${C.dark}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.18;0.85;1" dur="3s" repeatCount="indefinite"/>
        </path>

        <!-- Row 2 -->
        <rect x="13" y="26" width="5" height="5" rx="1.2" fill="${C.white}" opacity="0.85"/>
        <rect x="21" y="27.5" width="14" height="2" rx="1" fill="${C.white}" opacity="0.5"/>
        <path d="M14 28.5 l1.4 1.4 2.8 -2.8" stroke="${C.dark}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.35;0.5;0.85;1" dur="3s" repeatCount="indefinite"/>
        </path>

        <!-- Row 3 -->
        <rect x="13" y="34" width="5" height="5" rx="1.2" fill="${C.white}" opacity="0.7"/>
        <rect x="21" y="35.5" width="10" height="2" rx="1" fill="${C.white}" opacity="0.45"/>
        <path d="M14 36.5 l1.4 1.4 2.8 -2.8" stroke="${C.dark}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="opacity" values="0;0;0;1;0" keyTimes="0;0.55;0.7;0.9;1" dur="3s" repeatCount="indefinite"/>
        </path>

        <!-- Subtle float -->
        ${anim.float(1.5, 4)}
      </g>
    `),

    pulse: () => svg(`
      <polyline points="4,24 14,24 18,12 22,36 26,18 30,24 44,24" stroke="${C.coral}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${anim.flash(1.2)}
      </polyline>
    `),

    // ── ALERT / NOTIFICATION (alarm bell with badge) ────
    skin: () => svg(`<path d="M24 4C14 4 8 14 8 24C8 36 16 44 24 44C32 44 40 36 40 24C40 14 34 4 24 4Z" fill="${C.amber}"/>`),
    band: () => svg(`<rect x="4" y="16" width="40" height="16" rx="4" fill="${C.amber}"/><circle cx="14" cy="24" r="1.5" fill="${C.dark}"/><circle cx="20" cy="24" r="1.5" fill="${C.dark}"/><circle cx="28" cy="24" r="1.5" fill="${C.dark}"/><circle cx="34" cy="24" r="1.5" fill="${C.dark}"/>`),
    stomach: () => svg(`<path d="M24 6C29 6 33 10 33 15V20H37V26C37 35 32 42 24 42C16 42 11 35 11 26V15C11 10 15 6 24 6Z" fill="${C.coral}"/>`),
    freeze: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <line x1="24" y1="4" x2="24" y2="44" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
        <line x1="4" y1="24" x2="44" y2="24" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
        <line x1="10" y1="10" x2="38" y2="38" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
        <line x1="38" y1="10" x2="10" y2="38" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
        ${anim.rotateCenter(24, 24, 6)}
      </g>
    `),
    salt: () => svg(`
      <g>
        <path d="M16 6L32 6L34 18L14 18L16 6Z" fill="${C.amber}"/>
        <path d="M14 18H34V42H14V18Z" fill="${C.white}" stroke="${C.amberDark}" stroke-width="1"/>
        <circle cx="20" cy="26" r="0.8" fill="${C.dark}"/>
        <circle cx="26" cy="30" r="0.8" fill="${C.dark}"/>
        <circle cx="22" cy="34" r="0.8" fill="${C.dark}"/>
      </g>
    `),

    'low-energy': () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M26 4L10 26L20 26L18 44L36 22L26 22L28 4Z" fill="${C.coral}" opacity="0.5">
          ${anim.flicker(0.8)}
        </path>
      </g>
    `),

    'sun-warn-circle': () => svg(`
      <g>
        <circle cx="24" cy="24" r="20" fill="${C.amber}"/>
        <circle cx="24" cy="24" r="8" fill="${C.coral}"/>
        ${anim.flicker(1.4)}
      </g>
    `),

    sleep: () => svg(`
      <g style="transform-origin:24px 24px;transform-box:view-box">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="${C.violet}" transform="translate(8,8) scale(1.5)"/>
        ${anim.float(2, 3)}
      </g>
    `),

    leaf2: () => svg(`<path d="M40 8C40 8 16 8 12 24C8 36 14 40 20 40C30 40 38 32 40 22C42 14 40 8 40 8Z" fill="${C.green}"/>`),
    'sun-warn-old': () => svg(`<circle cx="24" cy="24" r="9" fill="${C.amber}"/>`),
  };

  // Emoji → icon key mapping
  const EMOJI_MAP = {
    // Body / Anatomy
    '🫁': 'lung', '❤️': 'heart', '💗': 'heart', '🧠': 'brain', '👁️': 'eye', '🩸': 'pulse', '🫨': 'heart-pulse',
    // Disease / symptom
    '🦠': 'virus', '😷': 'cough', '🤧': 'sneeze', '🤒': 'fever', '🥶': 'freeze', '🌡️': 'thermometer',
    '😱': 'face-panic', '😰': 'stress', '🪫': 'battery-low', '😪': 'sleep', '😴': 'bed', '🚬': 'cough',
    // Environment
    '☀️': 'sun', '🌞': 'sun', '🌙': 'moon', '☁️': 'cloud', '🌫️': 'cloud-fog',
    '🥵': 'flame', '🔥': 'flame', '💧': 'water-drop', '🧂': 'salt', '🌳': 'leaf', '📍': 'pin', '🍃': 'leaf',
    // Activity
    '🏃': 'run', '🚶': 'walk', '🏋️': 'barbell', '🛋️': 'couch', '🦵': 'walk',
    '📈': 'trend-up', '📉': 'trend-down', '📊': 'chart-bar', '📦': 'package',
    // Mental
    '😀': 'smile', '🙂': 'smile', '🧘': 'mindful',
    // Alert
    '✅': 'check-c', '✓': 'check', '⚠️': 'warn-c', '⚠': 'warn-c', '❌': 'close', '✗': 'close',
    '🚨': 'critical', 'ℹ️': 'info', '🔔': 'bell',
    '🟢': 'check-c', '🟡': 'warn-c', '🔴': 'danger',
    // Device
    '⌚': 'watch', '📱': 'phone', '🤖': 'bot', '🔑': 'key', '🛡️': 'shield',
    '🔋': 'battery', '🔄': 'sync',
    // Comm
    '💬': 'message', '📧': 'email', '📩': 'email',
    // Time / misc
    '⏰': 'clock', '⏱️': 'clock', '📅': 'calendar',
    '⚡': 'lightning', '✨': 'sparkles', '🔬': 'doc', '📖': 'bookmark', '📋': 'doc', '🗑️': 'trash',
    '🌍': 'globe', '🇮🇩': 'flag', '▶️': 'play', '🎯': 'pin-active',
    '🔍': 'search', '➕': 'plus', '🤚': 'skin', '🏥': 'shield',
    // Special
    '🐢': 'arrow-down', '🐇': 'arrow-up', '🌬️': 'wind', '🥤': 'water-drop',
    '👤': 'face-panic', '👥': 'face-panic',
  };

  window.AervinexIcons = {
    get(key, opts = {}) {
      const fn = ICONS[key];
      if (!fn) return '';
      return fn();
    },
    fromEmoji(emoji, opts) {
      const key = EMOJI_MAP[emoji];
      if (!key) return '';
      return this.get(key, opts);
    },
    render(input, opts) {
      if (!input) return '';
      if (EMOJI_MAP[input]) return this.fromEmoji(input, opts);
      if (ICONS[input]) return this.get(input, opts);
      return input;
    },
    replaceInString(str) {
      if (!str) return str;
      let out = str;
      Object.keys(EMOJI_MAP).forEach(emoji => {
        if (out.includes(emoji)) out = out.split(emoji).join(this.fromEmoji(emoji));
      });
      return out;
    },
    hasKey(key) { return key in ICONS; },
    hasEmoji(emoji) { return emoji in EMOJI_MAP; },
    autoReplace(root) {
      root = root || document;
      const selectors = [
        '.kpi-icon', '.list-row-icon', '.metric-icon', '.sensor-icon-wrap',
        '.setting-icon', '.land-feature-icon', '.rl-icon-wrap', '#introIcon',
      ];
      root.querySelectorAll(selectors.join(',')).forEach(el => {
        if (el.querySelector('svg')) return;
        const txt = el.textContent.trim();
        if (!txt || txt.length > 4) return;
        if (EMOJI_MAP[txt]) {
          el.innerHTML = this.fromEmoji(txt);
        }
      });
    },
  };

  function runAuto() { try { window.AervinexIcons.autoReplace(); } catch (_) {} }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAuto);
  } else {
    runAuto();
  }
  let raf = null;
  const observer = new MutationObserver(() => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(runAuto);
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => observer.observe(document.body, { childList: true, subtree: true }));
  }
})();
