const CACHE_NAME = 'technician-app-v2';
const APP_SHELL = [
  '/technician.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.url.includes('/alert.mp3')) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.url.includes('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.method !== 'GET') return;

  // ✅ Cache only static files
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((networkRes) => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, copy);
        });
        return networkRes;
      });
    })
  );
});