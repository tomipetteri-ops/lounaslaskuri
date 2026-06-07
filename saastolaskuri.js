// saastolaskuri.js — keskitetty saastolaskenta (DST-tietoinen).
// Yksi totuuden lahde: kaytetaan seka selaimessa (window.Saastolaskuri)
// etta Node-testeissa (module.exports). Alustana laskuri.html ja test-laskuri.*.
(function (root) {
    function parseDate(arr) { return new Date(arr[0], arr[1], arr[2]).getTime(); }
    function getDaysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }

    function calculateSavings(history, start, end) {
        var total = 0;
        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            var entryStart = parseDate(entry.alkaen);
            var entryEnd = (i + 1 < history.length) ? parseDate(history[i + 1].alkaen) : end;
            var activeStart = Math.max(entryStart, start);
            var activeEnd = Math.min(entryEnd, end);
            if (activeEnd <= activeStart) continue;

            // Jaa laskenta kuukausittain - kayta kuukauden todellista kestoa (DST-oikea)
            var current = activeStart;
            while (current < activeEnd) {
                var currentDate = new Date(current);
                var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
                var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
                var segmentEnd = Math.min(monthEnd + 1, activeEnd);
                var segmentMs = segmentEnd - current;
                var monthMs = monthEnd + 1 - monthStart;
                total += (segmentMs / monthMs) * entry.summa;
                current = segmentEnd;
            }
        }
        return total;
    }

    var api = { parseDate: parseDate, getDaysInMonth: getDaysInMonth, calculateSavings: calculateSavings };
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.Saastolaskuri = api;
    }
})(typeof self !== 'undefined' ? self : this);
