/* =========================================================================
   sw.js — Service Worker (PWA)
   Cache-first untuk fail setempat supaya platform boleh digunakan offline.
   Tiada permintaan ke pelayan luar daripada service worker ini.
   ========================================================================= */
const CACHE = 'aipk-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/main.js',
  './assets/js/core.js',
  './assets/js/engine.js',
  './assets/js/ui.js',
  './assets/js/games-a.js',
  './assets/js/games-b.js',
  './assets/img/icon.svg',
  './assets/img/icon-maskable.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => { });
        return res;
      }).catch(() => caches.match('./index.html')))
    );
    return;
  }

  // Fon Google: cuba rangkaian dahulu, jika gagal guna cache (jika ada).
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => { });
      return res;
    }).catch(() => caches.match(req))
  );
});
