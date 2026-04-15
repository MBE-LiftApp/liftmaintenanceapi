const CACHE_NAME = 'technician-app-v1';
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

  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, copy);
        });
        return networkRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/technician.html')))
  );
});