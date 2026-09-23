const CACHE = 'echo-drift-v10';
const APP_SHELL = ['/echo-drift/', '/echo-drift/index.html', '/echo-drift/manifest.webmanifest', '/echo-drift/icon.svg'];
const SAME_ORIGIN = self.location.origin;
const OWN_CACHE_PREFIX = 'echo-drift-';

async function safePut(cache, request, response) {
  if (!response || !response.ok || new URL(request.url).origin !== SAME_ORIGIN) return;
  try { await cache.put(request, response.clone()); } catch {}
}

async function refresh(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(CACHE);
    await safePut(cache, request, response);
    return response;
  } catch {
    return null;
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(APP_SHELL.map(async path => {
      const response = await refresh(new Request(path));
      if (response) await safePut(cache, path, response);
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
      const fresh = await (event.preloadResponse || refresh(request));
      if (fresh) return fresh;
      return (await caches.match(request)) || caches.match('/echo-drift/index.html') || new Response('Offline', { status: 503, statusText: 'Offline' });
    }

    const cached = await caches.match(request);
    if (cached) {
      event.waitUntil(refresh(request));
      return cached;
    }

    const fresh = await refresh(request);
    return fresh || (await caches.match('/echo-drift/')) || new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
