const CACHE = 'echo-drift-v4';
const APP_SHELL = ['/echo-drift/', '/echo-drift/index.html', '/echo-drift/manifest.webmanifest'];
const SAME_ORIGIN = self.location.origin;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      const url = new URL(request.url);
      const cacheable = response && response.ok && url.origin === SAME_ORIGIN;
      if (cacheable) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (request.mode === 'navigate') return caches.match('/echo-drift/index.html');
      return caches.match('/echo-drift/');
    }
  })());
});
