const CACHE = 'echo-drift-v9';
const APP_SHELL = ['/echo-drift/', '/echo-drift/index.html', '/echo-drift/manifest.webmanifest', '/echo-drift/icon.svg'];
const SAME_ORIGIN = self.location.origin;
const OWN_CACHE_PREFIX = 'echo-drift-';

async function safePut(cache, request, response) {
  if (!response || !response.ok || new URL(request.url).origin !== SAME_ORIGIN) return;
  try { await cache.put(request, response.clone()); } catch {}
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(APP_SHELL.map(async path => {
      try { const response = await fetch(path, { cache: 'no-store' }); await safePut(cache, path, response); } catch {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(OWN_CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    if ('navigationPreload' in self.registration) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SAME_ORIGIN) return;

  event.respondWith((async () => {
    const isNavigation = request.mode === 'navigate';
    if (isNavigation) {
      try {
        const fresh = await (event.preloadResponse || fetch(request, { cache: 'no-store' }));
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
      return (await caches.match('/echo-drift/')) || new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
