// navigointi.js — kaikille dia-sivuille jaettu apukirjasto.
// Sisaltaa: diagnostiikan ehdollisen latauksen, lapsi->parent-dia-ohjauksen,
// fullscreen-pyynnon ja tap-zone-navigoinnin. Keskitetty tanne koska jokainen
// dia-sivu (paitsi diagnostiikka.html) lataa taman ensin.

// --- Diagnostiikka.js ladataan vain jos diagnostiikka on paalla ---
if (localStorage.getItem('lounas_diagnostiikka') === 'true') {
    var diagScript = document.createElement('script');
    diagScript.src = 'diagnostiikka.js';
    document.head.appendChild(diagScript);
}

// --- Dia-ohjauskomennot: lapsi-iframe -> parent (kuvat.html, goals.html) ---
window.pysaytaDia = function () { try { window.parent.postMessage('pysayta', '*'); } catch (e) { } };
window.jatkaDia = function () { try { window.parent.postMessage('jatka', '*'); } catch (e) { } };
window.kaynnistaDia = function () { try { window.parent.postMessage('kaynnista', '*'); } catch (e) { } };

// --- Fullscreen-pyynto (index.html, laskuri.html) ---
window.pyydaFullscreen = function () {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () { });
    }
};

// --- Tap-zone-navigointi: napauta vasenta reunaa = edellinen, oikeaa = seuraava ---
(function () {
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
})();
