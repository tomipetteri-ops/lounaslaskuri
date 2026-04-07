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

    // -- Tap-zone-navigointi (e-ink-yhteensopiva) --
    // Napauta vasenta reunaa = edellinen, oikeaa reunaa = seuraava
    var TAP_ZONE = 0.15; // 15% naytonleveydesta kummallakin reunalla
    var tapStartX = 0;
    var tapStartY = 0;
    var tapStartTime = 0;

    document.addEventListener('touchstart', function (e) {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
        tapStartTime = Date.now();
    });

    document.addEventListener('touchend', function (e) {
        // Ohita napaytukset interaktiivisiin elementteihin (napit, linkit, inputit, editoitavat)
        var el = e.target;
        while (el && el !== document.body) {
            var tag = el.tagName;
            if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' ||
                tag === 'TEXTAREA' || el.contentEditable === 'true' ||
                el.classList.contains('popup-vaihtoehto') || el.classList.contains('popup') ||
                el.classList.contains('goals-rivi') || el.onclick) {
                return;
            }
            el = el.parentElement;
        }

        var dx = Math.abs(e.changedTouches[0].clientX - tapStartX);
        var dy = Math.abs(e.changedTouches[0].clientY - tapStartY);
        var dt = Date.now() - tapStartTime;

        // Vain lyhyet napaytukset (< 300ms) jotka eivat liiku paljoa (< 15px)
        if (dt > 300 || dx > 15 || dy > 15) return;

        var x = e.changedTouches[0].clientX;
        var leveys = window.innerWidth;
        var zone = leveys * TAP_ZONE;

        if (x < zone) {
            window.parent.postMessage({ type: 'edellinenDia' }, '*');
        } else if (x > leveys - zone) {
            window.parent.postMessage({ type: 'seuraavaDia' }, '*');
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
