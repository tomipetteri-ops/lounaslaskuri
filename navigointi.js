// navigointi.js — tap-zone-navigointi (e-ink-yhteensopiva)
// Napauta vasenta reunaa = edellinen, oikeaa reunaa = seuraava
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
