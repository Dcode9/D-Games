const CACHE = 'echo-drift-v6';
const APP_SHELL = ['/echo-drift/', '/echo-drift/index.html', '/echo-drift/manifest.webmanifest'];
const SAME_ORIGIN = self.location.origin;
const OWN_CACHE_PREFIX = 'echo-drift-';

async function safePut(cache, request, response) {
  if (!response || !response.ok || new URL(request.url).origin !== SAME_ORIGIN) return;
  try {
    await cache.put(request, response.clone());
  } catch {
    // Storage can fail in private mode or when the quota is full; gameplay should continue.
  }
}

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
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(OWN_CACHE_PREFIX) && key !== CACHE)
          .map(key => caches.delete(key))
      ))
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
    const url = new URL(request.url);
    const isNavigation = request.mode === 'navigate';

    if (isNavigation) {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        await safePut(cache, request, fresh);
        return fresh;
      } catch {
        return (await caches.match(request)) || caches.match('/echo-drift/index.html');
      }
    }

    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE);
      await safePut(cache, request, response);
      return response;
    } catch {
      return caches.match('/echo-drift/');
    }
  })());
});
