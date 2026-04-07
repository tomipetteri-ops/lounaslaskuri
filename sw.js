var CACHE_VERSION = 2;
var CACHE_NAME = 'lounaslaskuri-v' + CACHE_VERSION;
var URLS = [
    './',
    './index.html',
    './laskuri.html',
    './goals.html',
    './kuvat.html',
    './style.css',
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

self.addEventListener('fetch', function (e) {
    e.respondWith(
        fetch(e.request).then(function (response) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(e.request, clone);
            });
            return response;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
