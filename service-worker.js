const CACHE = 'speak-boldly-offline-v1';
const offline = new URL('./offline.html', self.location.href).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add(offline)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('speak-boldly-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
// Only the connection-help page is cached. Portal pages, files and API responses
// always go to the network, so private data and old application code stay out.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(offline)));
});
