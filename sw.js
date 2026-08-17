const CACHE_NAME = '7xfris-ultra-v2';
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

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
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

// Vídeos incorporados do YouTube e Vimeo continuam dependendo da internet.
// Nenhuma API key ou credencial é armazenada no service worker.
