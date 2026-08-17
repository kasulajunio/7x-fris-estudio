const CACHE_NAME = '7x-fris-ultra-v5';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('/index.html') || requestUrl.pathname.endsWith('/');

  event.respondWith(
    (isNavigation ? fetch(event.request, { cache: 'no-store' }) : fetch(event.request))
      .then(response => {
        if (response.ok && requestUrl.origin === self.location.origin && !isNavigation) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || new Response(
        '<!doctype html><meta charset="utf-8"><title>7x Fris Estudio offline</title><p>Você está offline. Tente novamente quando a conexão voltar.</p>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Vídeos incorporados do YouTube dependem da internet e anúncios são controlados pela plataforma.
// Nenhuma API key ou credencial é armazenada no service worker.
