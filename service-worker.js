const CACHE_NAME = 'calebs-shift-v94';
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
  './assets/stop-sign-mask.png',
  './assets/headlight-hat.png',
  './assets/troll-face-skin.png',
  './assets/generator-skin.png',
  './assets/train-skin.png',
  './assets/bronze-skin.png',
  './assets/silver-skin.png',
  './assets/gold-skin.png',
  './assets/WallCrashSoundEffect.mp3',
  './assets/big-c.mp3',
  './assets/noah-lullaby.mp3',
  './assets/noah-chase.mp3',
  './assets/noah-scream.mp3',
  './assets/rhys-chase.mp3',
  './assets/rhys-scream.mp3',
  './assets/caleb-boss.png',
  './assets/caleb-left-hand.png',
  './assets/caleb-right-hand.png',
  './assets/cal.png',
  './assets/leb.png'
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
