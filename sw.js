var CACHE_VERSION = 15;
var CACHE_NAME = 'lounaslaskuri-v' + CACHE_VERSION;
var FETCH_STRATEGIA = 'cache-first';
var URLS = [
    './',
    './index.html',
    './laskuri.html',
    './goals.html',
    './kuvat.html',
    './style.css',
    './navigointi.js',
    './diagnostiikka.html',
    './diagnostiikka.js'
];

// Tilastot — paivitetaan fetch-handlerissa, luetaan message-rajapinnalla
var tilastot = {
    cacheOsumat: 0,
    verkkopyynnot: 0,
    verkkoVirheet: 0,
    alkanut: Date.now()
};

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            // Bypass browser HTTP cache during install — pakottaa tuoreet fetchit,
            // muuten SW:n addAll voi tallentaa vanhan kopion jonka HTTP-cache palautti.
            var requests = URLS.map(function (u) { return new Request(u, { cache: 'reload' }); });
            return cache.addAll(requests);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (name) {
                    return name !== CACHE_NAME;
                }).map(function (name) {
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// cache-first: vastaa cachesta, EI revalidoi taustalla.
// Paivitykset tulevat vain CACHE_VERSION-bumpilla (uusi SW install).
// Poistaa ~32 turhaa WiFi-heratysta/min jotka stale-while-revalidate aiheutti.
self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(function (cached) {
            if (cached) {
                tilastot.cacheOsumat++;
                return cached;
            }
            // Ei cachessa — hae verkosta ja tallenna
            return fetch(e.request).then(function (response) {
                tilastot.verkkopyynnot++;
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(e.request, clone);
                });
                return response;
            }).catch(function () {
                tilastot.verkkoVirheet++;
            });
        })
    );
});

// Tilastojen luku MessageChannel-rajapinnalla: client lahettaa
// { type: 'haeTilastot' } + port2, me vastaamme port2:en.
self.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.type === 'haeTilastot') {
        var vastaus = {
            cacheOsumat: tilastot.cacheOsumat,
            verkkopyynnot: tilastot.verkkopyynnot,
            verkkoVirheet: tilastot.verkkoVirheet,
            alkanut: tilastot.alkanut,
            strategia: FETCH_STRATEGIA,
            cacheVersion: CACHE_VERSION
        };
        if (e.ports && e.ports[0]) {
            e.ports[0].postMessage(vastaus);
        } else if (e.source && e.source.postMessage) {
            e.source.postMessage({ type: 'tilastot', data: vastaus });
        }
    } else if (e.data.type === 'nollaaTilastot') {
        tilastot.cacheOsumat = 0;
        tilastot.verkkopyynnot = 0;
        tilastot.verkkoVirheet = 0;
        tilastot.alkanut = Date.now();
    }
});
