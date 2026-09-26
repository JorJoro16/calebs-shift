const CACHE_NAME = 'calebs-shift-v55';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/game.js',
  './manifest.json',
  './service-worker.js',
  './assets/icon.svg',
  './assets/apple-touch-icon.png',
  './assets/icon-512.png',
  './assets/noah-cap.png',
  './assets/idiot-mask.png',
  './assets/cowboy-hat.png',
  './assets/jordan-mask.png',
  './assets/luffy-hat.png',
  './assets/spongebob-mask.png',
  './assets/krusty-krab-hat.png',
  './assets/smile-mask.png',
  './assets/cs-train-sound.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
