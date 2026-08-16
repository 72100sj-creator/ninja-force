const CACHE_NAME = 'ninja-force-v4';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/data.js',
    './js/app.js',
    './manifest.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/mascot/ninja-prep.png',
    './assets/mascot/ninja-active.png',
    './assets/mascot/ninja-rest.png',
    './assets/mascot/ninja-victory.png',
    './assets/exercises/01-squat.jpg',
    './assets/exercises/02-fentes.jpg',
    './assets/exercises/03-pont.jpg',
    './assets/exercises/04-pompes.jpg',
    './assets/exercises/05-dips.jpg',
    './assets/exercises/06-birddog.jpg',
    './assets/exercises/07-ytw.jpg',
    './assets/exercises/08-planche.jpg',
    './assets/exercises/09-planchelat.jpg',
    './assets/exercises/10-deadbug.jpg',
    './assets/exercises/11-pike.jpg',
    './assets/exercises/12-commando.jpg',
    './assets/exercises/13-mollets.jpg',
    './assets/exercises/14-climbers.jpg',
    './assets/exercises/15-jacks.jpg',
    './assets/exercises/16-genoux.jpg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
