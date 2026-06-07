/* AERVINEX Service Worker — offline-first cache for shell assets.
   Strategy matrix:
     - HTML navigations  → network-first w/ cached fallback (freshness wins).
     - CSS / JS / fonts  → stale-while-revalidate (instant paint, background refresh).
     - SVG / icons / manifest → cache-first w/ background refresh.
     - Firebase API hosts → bypass (always network). */
const VERSION = 'aervinex-v12';
const RUNTIME = 'aervinex-runtime-v1';
const SHELL = [
  '/',
  '/index.html',
  '/onboarding.html',
  '/dashboard.html',
  '/running.html',
  '/recovery.html',
  '/history.html',
  '/profile.html',
  '/risk-list.html',
  '/risk-detail.html',
  '/metric-detail.html',
  '/session-detail.html',
  '/assessment.html',
  '/device.html',
  '/alerts.html',
  '/login.html',
  '/register.html',
  '/about.html',
  '/help.html',
  '/privacy.html',
  '/evidence.html',
  '/ml-results-report.html',
  '/ml-improvement-plan.html',
  '/aervinex-roadmap.html',
  '/community.html',
  '/community-channel.html',
  '/ai-chat.html',
  '/edit-profile.html',
  '/css/aervinex-ui.css',
  '/css/a11y-tokens.css',
  '/js/firebase-config.js',
  '/js/web-vitals-reporter.js',
  '/js/auth.js',
  '/js/aervinex-app.js',
  '/js/icon-lib.js',
  '/js/disease-list.js',
  '/js/assessments.js',
  '/js/tour.js',
  '/js/utils.js',
  '/js/ml-client.js',
  '/js/ml-test-runner.js',
  '/js/onboarding.js',
  '/js/i18n.js',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== VERSION && k !== RUNTIME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- helpers ---------- */
function isHTMLNavigation(req) {
  return req.mode === 'navigate' ||
         (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
}

function isStaleWhileRevalidateAsset(url) {
  // CSS / JS / web fonts — assets where instant paint matters AND we can
  // tolerate a one-revision-stale render while we refresh in background.
  return /\.(?:css|js|mjs|woff2?)$/i.test(url.pathname) ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com';
}

function isCacheFirstAsset(url) {
  return /\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$/i.test(url.pathname) ||
         url.pathname === '/manifest.json';
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      const clone = fresh.clone();
      caches.open(RUNTIME).then((c) => c.put(req, clone)).catch(() => {});
    }
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return caches.match('/index.html');
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);
  // Return cached immediately when available; otherwise wait for network.
  return cached || (await networkPromise) || caches.match('/index.html');
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) {
    // Background refresh, fire and forget
    fetch(req).then((fresh) => {
      if (fresh && fresh.status === 200) {
        caches.open(RUNTIME).then((c) => c.put(req, fresh.clone())).catch(() => {});
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      const clone = fresh.clone();
      caches.open(RUNTIME).then((c) => c.put(req, clone)).catch(() => {});
    }
    return fresh;
  } catch (_) {
    return caches.match('/index.html');
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept Firebase / Firestore / auth — they need fresh tokens
  if (url.hostname.includes('googleapis') ||
      url.hostname.includes('firebaseio') ||
      url.hostname.includes('firebaseapp') ||
      url.hostname.includes('gstatic.com') && url.pathname.includes('/firebasejs/')) {
    return;
  }

  if (isHTMLNavigation(req)) {
    e.respondWith(networkFirst(req));
    return;
  }
  if (isStaleWhileRevalidateAsset(url)) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (isCacheFirstAsset(url)) {
    e.respondWith(cacheFirst(req));
    return;
  }
  // Default: stale-while-revalidate for same-origin GETs.
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(req));
  }
});

// Allow page to trigger an immediate activation after a deploy.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
