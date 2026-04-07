// diagnostiikka.js — kevyt resurssidiagnostiikka monkey-patchauksella
// Ladataan jokaiseen sivuun ENNEN muita skripteja.
(function () {
    var piilossa = document.hidden || false;

    var diag = {
        sivu: location.pathname.split('/').pop() || 'tuntematon',
        kaynnistys: Date.now(),
        ajastimet: {
            interval: [], // { id, ms, kutsut, luotu }
            timeout: []   // { id, ms, kutsut, luotu, aktiivinen }
        },
        tarkkailijat: {
            resize: 0, resizeKutsut: 0, resizeKutsutPiilossa: 0,
            mutation: 0, mutationKutsut: 0, mutationKutsutPiilossa: 0
        },
        fetch: { pyyntoja: 0 },
        visibility: { piilossa: 0, nakyvissa: 0 }
    };

    window.__diag = diag;

    // -- setInterval / clearInterval --
    var _setInterval = window.setInterval;
    var _clearInterval = window.clearInterval;

    window.setInterval = function (fn, ms) {
        var entry = { ms: ms || 0, kutsut: 0, luotu: Date.now() };
        var wrapped = function () {
            entry.kutsut++;
            fn();
        };
        var id = _setInterval(wrapped, ms);
        entry.id = id;
        diag.ajastimet.interval.push(entry);
        return id;
    };

    window.clearInterval = function (id) {
        diag.ajastimet.interval = diag.ajastimet.interval.filter(function (e) { return e.id !== id; });
        return _clearInterval(id);
    };

    // -- setTimeout / clearTimeout --
    var _setTimeout = window.setTimeout;
    var _clearTimeout = window.clearTimeout;

    window.setTimeout = function (fn, ms) {
        var entry = { ms: ms || 0, kutsut: 0, luotu: Date.now(), aktiivinen: true };
        var wrapped = function () {
            entry.kutsut++;
            entry.aktiivinen = false;
            fn();
        };
        var id = _setTimeout(wrapped, ms);
        entry.id = id;
        diag.ajastimet.timeout.push(entry);
        return id;
    };

    window.clearTimeout = function (id) {
        for (var i = 0; i < diag.ajastimet.timeout.length; i++) {
            if (diag.ajastimet.timeout[i].id === id) {
                diag.ajastimet.timeout[i].aktiivinen = false;
            }
        }
        return _clearTimeout(id);
    };

    // -- ResizeObserver --
    if (window.ResizeObserver) {
        var _RO = window.ResizeObserver;
        window.ResizeObserver = function (cb) {
            diag.tarkkailijat.resize++;
            var wrapped = function () {
                diag.tarkkailijat.resizeKutsut++;
                if (piilossa) diag.tarkkailijat.resizeKutsutPiilossa++;
                cb.apply(this, arguments);
            };
            return new _RO(wrapped);
        };
        window.ResizeObserver.prototype = _RO.prototype;
    }

    // -- MutationObserver --
    var _MO = window.MutationObserver;
    window.MutationObserver = function (cb) {
        diag.tarkkailijat.mutation++;
        var wrapped = function () {
            diag.tarkkailijat.mutationKutsut++;
            if (piilossa) diag.tarkkailijat.mutationKutsutPiilossa++;
            cb.apply(this, arguments);
        };
        var obs = new _MO(wrapped);
        return obs;
    };
    window.MutationObserver.prototype = _MO.prototype;

    // -- fetch --
    if (window.fetch) {
        var _fetch = window.fetch;
        window.fetch = function () {
            diag.fetch.pyyntoja++;
            return _fetch.apply(this, arguments);
        };
    }

    // -- Visibility tracking --
    document.addEventListener('visibilitychange', function () {
        piilossa = document.hidden;
        if (piilossa) {
            diag.visibility.piilossa++;
        } else {
            diag.visibility.nakyvissa++;
        }
    });

    // -- Swipe-navigointi: vasemmalle = seuraava, oikealle = edellinen --
    var swipeStartX = 0;
    var swipeStartY = 0;
    var SWIPE_MIN = 50;   // min px vaakasuuntaan
    var SWIPE_MAX_Y = 80; // max px pystysuuntaan (ei reagoi scrolliin)

    document.addEventListener('touchstart', function (e) {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - swipeStartX;
        var dy = e.changedTouches[0].clientY - swipeStartY;
        if (Math.abs(dy) < SWIPE_MAX_Y && Math.abs(dx) > SWIPE_MIN) {
            if (dx < 0) {
                window.parent.postMessage({ type: 'seuraavaDia' }, '*');
            } else {
                window.parent.postMessage({ type: 'edellinenDia' }, '*');
            }
        }
    });

    // -- Viestiprotokolla: parent pyytaa, child vastaa --
    window.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'keraaDiagnostiikka') {
            // Lisaa reaaliaikaiset arvot
            diag.uptime = performance.now();
            if (performance.memory) {
                diag.muisti = {
                    kaytetty: performance.memory.usedJSHeapSize,
                    kokonais: performance.memory.totalJSHeapSize
                };
            }
            window.parent.postMessage({
                type: 'diagnostiikka',
                data: JSON.parse(JSON.stringify(diag)),
                sivu: diag.sivu
            }, '*');
        }
    });
})();
