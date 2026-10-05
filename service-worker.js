const CACHE_NAME = 'calebs-shift-v167';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/archive.css',
  './css/wardrobe.css',
  './css/market.css',
  './css/loadouts.css',
  './css/play.css',
  './css/run-flow.css',
  './css/generator-ui.css',
  './assets/ui/icons/modes/CampaignModeIcon.svg',
  './assets/ui/icons/modes/DailyChallengeIcon.svg',
  './assets/ui/icons/modes/SurvivalIcon.svg',
  './assets/ui/icons/modes/EndlessModeIcon.svg',
  './assets/ui/icons/notifications/InfoNotiIcon.svg',
  './assets/ui/icons/notifications/RewardNotiIcon.svg',
  './assets/ui/icons/notifications/DangerNotiIcon.svg',
  './js/game.js',
  './js/ui-sounds.js',
  './js/market-ui.js',
  './js/menu-music.js',
  './js/menu-ui.js',
  './js/play-ui.js',
  './js/settings-ui.js',
  './js/records-ui.js',
  './js/daily-shift-ui.js',
  './js/archive-ui.js',
  './js/wardrobe-ui.js',
  './manifest.json',
  './service-worker.js',
  './assets/icon.svg',
  './assets/apple-touch-icon.png',
  './assets/icon-512.png',
  './assets/ui/themes/the-lobby-wallpaper.png',
  './assets/audio/menu/still-life.mp3',
  './assets/audio/menu/back-there.mp3',
  './assets/audio/menu/camaraderie.mp3',
  './assets/audio/ui/switch-006.mp3',
  './assets/audio/ui/store-purchase.mp3',
  './assets/audio/ui/select-006.mp3',
  './assets/audio/ui/click-8bit.mp3',
  './assets/audio/ui/store-discard.mp3',
  './assets/ui/icons/daily-shift.svg',
  './assets/ui/icons/loadouts.svg',
  './assets/ui/icons/loadouts/FreeCarryIcon.svg',
  './assets/ui/icons/loadouts/UtilityKitIcon.svg',
  './assets/ui/icons/archive.svg',
  './assets/ui/icons/records.svg',
  './assets/ui/icons/records/FieldReportIcon.svg',
  './assets/ui/icons/records/MapLocationIcon.svg',
  './assets/ui/icons/records/EntityContactsIcon.svg',
  './assets/ui/icons/records/MilestoneIcon.svg',
  './assets/ui/icons/settings.svg',
  './assets/ui/icons/menu-style.svg',
  './assets/ui/icons/audio-controls/play.svg',
  './assets/ui/icons/audio-controls/pause.svg',
  './assets/ui/icons/audio-controls/skip-next.svg',
  './assets/ui/icons/audio-controls/skip-previous.svg',
  './assets/ui/icons/market/BlackMarketIcon.svg',
  './assets/ui/icons/market/MapsIcon.svg',
  './assets/ui/icons/market/ShopIcon.svg',
  './assets/ui/icons/market/EmergencyFlareIcon.svg',
  './assets/ui/icons/market/EmergencyBatteryIcon.svg',
  './assets/ui/icons/market/AdrenalineSyringeIcon.svg',
  './assets/ui/icons/market/BearTrapIcon.svg',
  './assets/ui/icons/market/DashIcon.svg',
  './assets/ui/icons/market/LuckyCoinIcon.svg',
  './assets/ui/icons/market/QuickHandsIcon.svg',
  './assets/ui/icons/market/HackerGlovesIcon.svg',
  './assets/ui/icons/market/RunningShoesIcon.svg',
  './assets/ui/icons/market/SignalScramblerIcon.svg',
  './assets/ui/icons/market/NoiseMakerIcon.svg',
  './assets/ui/icons/market/FlashbangIcon.svg',
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
  './assets/caleb-crown.png',
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
  './assets/caleb-black-eyes.png',
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
