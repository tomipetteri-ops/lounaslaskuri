var CACHE_NAME = 'lounaslaskuri';
var URLS = [
    './',
    './index.html',
    './laskuri.html',
    './goals.html',
    './kuvat.html',
    './style.css'
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
