var CACHE_VERSION = 6;
var CACHE_NAME = 'lounaslaskuri-v' + CACHE_VERSION;
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

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(URLS);
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

// stale-while-revalidate: vastaa cachesta heti, paivittaa taustalla.
// E Inkilla / akkukriittisilla laitteilla tama valttaa turhia radioherattamisia
// joka iframe-reloadilla (~7000/vrk).
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (cached) {
            var fetchPromise = fetch(e.request).then(function (response) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(e.request, clone);
                });
                return response;
            }).catch(function () { return cached; });
            return cached || fetchPromise;
        })
    );
});
