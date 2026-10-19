// service-worker.js - PWA offline support
const CACHE_NAME = 'fletbox-v3';
// Deployment prefix: a worker's own URL always sits at the app root, so on a
// GitHub Pages project site this is '/flet-box-docs/' and at the origin root
// it is '/'. Hard-coded '/' paths would miss every precache entry under a
// subpath and the offline navigation fallback would never hit.
const BASE = new URL('./', self.location).pathname;
// The shipped (baked-in) shell, precached so the app opens with no connection.
// loader.js owns a SEPARATE cache ('fletbox-ota') for downloaded bundles.
const PRECACHE = [BASE, `${BASE}index.html`, `${BASE}404.html`, `${BASE}loader.js`, `${BASE}config.json`, `${BASE}src/app.js`];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const urls = PRECACHE;
        
        for (const url of urls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.log('🔧 [INSTALL] ⚠️ Not cached: ' + url + ' - status: ' + response.status);
            }
          } catch (err) {
            console.log('🔧 [INSTALL] ❌ Error caching ' + url + ':', err.message);
          }
        }
        
        self.skipWaiting();
      } catch (error) {
        console.error('🔧 [INSTALL] ❌ Fatal error:', error);
      }
    })()
  );
});

self.addEventListener('activate', event => {
  console.log('🔧 [ACTIVATE] Activate event started');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName !== CACHE_NAME && cacheName !== 'fletbox-ota') {
            await caches.delete(cacheName);
          }
        }
        await self.clients.claim();
      } catch (error) {
        console.error('🔧 [ACTIVATE] ❌ Error:', error);
      }
    })()
  );
});

// Hybrid caching:
//  - Static assets (fonts/icons/images/css): cache-first (they are immutable
//    per release and re-fetched only when missing).
//  - Updatable shell (html/js/json, incl. src/app.js + config.json):
//    network-first so a new release is picked up immediately, falling back to
//    the cache when offline. This is what keeps OTA correct: the service worker
//    must never hand back a stale app.js while online.
// Cross-origin requests (the remote OTA config/bundle) are left to the network.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = /\.(png|jpe?g|svg|gif|webp|ico|woff2?|ttf|otf|css)$/i.test(url.pathname);

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      if (isStatic) {
        const hit = await cache.match(req);
        if (hit) return hit;
      }
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          // 404.html is the fallback copy with absolute references, so it also
          // boots correctly when served for a deep offline URL.
          const shell =
            (await cache.match(`${BASE}404.html`)) ||
            (await cache.match(`${BASE}index.html`));
          if (shell) return shell;
        }
        return Response.error();
      }
    })()
  );
});
