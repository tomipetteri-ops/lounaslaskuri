// testitapaukset.js — jaetut saastolaskurin yhtasuuruustestit.
// Kaytetaan seka Node- (test-laskuri.js) etta selain- (test-laskuri.html)
// harnessissa, jotta tapaukset eivat eriydy. Suhteelliset / nykyhetkeen
// sidotut tapaukset jaavat harnessikohtaisiksi.
(function (root) {
    function pvm(y, m, d) { return new Date(y, m, d).getTime(); }
    function kkLoppu(y, m, d) { return new Date(y, m, d, 23, 59, 59, 999).getTime() + 1; }

    var h410 = [{ alkaen: [2026, 0, 1], summa: 410 }];
    var historyEriKk = [
        { alkaen: [2026, 0, 1], summa: 410 },
        { alkaen: [2026, 1, 1], summa: 500 },
        { alkaen: [2026, 2, 1], summa: 600 }
    ];

    var tapaukset = [];

    // 1. Koko kuukausi (eri maarat) — tammikuu 2026
    [100, 410, 870, 1000].forEach(function (summa) {
        tapaukset.push({
            nimi: summa + ' € koko tammikuu', history: [{ alkaen: [2026, 0, 1], summa: summa }],
            start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 31), odotus: summa, tol: 0.01
        });
    });

    // 2. Puolikas kuukausi (15 pv)
    tapaukset.push({
        nimi: '410 € × 15/31 pv', history: h410,
        start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 15), odotus: 410 * (15 / 31), tol: 0.5
    });

    // 3. Helmikuu 28 vs 29 pv (karkausvuosi)
    tapaukset.push({
        nimi: '2025 helmikuu (28 pv)', history: [{ alkaen: [2025, 1, 1], summa: 100 }],
        start: pvm(2025, 1, 1), end: kkLoppu(2025, 1, 28), odotus: 100, tol: 0.01
    });
    tapaukset.push({
        nimi: '2024 helmikuu (29 pv, karkaus)', history: [{ alkaen: [2024, 1, 1], summa: 100 }],
        start: pvm(2024, 1, 1), end: kkLoppu(2024, 1, 29), odotus: 100, tol: 0.01
    });

    // 4. Useampi kuukausi (tammi–maalis 2026), 410 €/kk
    tapaukset.push({
        nimi: '410 € × 3 kk (tammi–maalis)', history: h410,
        start: pvm(2026, 0, 1), end: kkLoppu(2026, 2, 31), odotus: 1230, tol: 0.5
    });

    // 4b. Eri kuukaudet erikseen (410 €/kk, eri pituiset)
    tapaukset.push({ nimi: 'Tammikuu 410 € (31 pv)', history: h410, start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 31), odotus: 410, tol: 0.01 });
    tapaukset.push({ nimi: 'Helmikuu 410 € (28 pv)', history: h410, start: pvm(2026, 1, 1), end: kkLoppu(2026, 1, 28), odotus: 410, tol: 0.01 });
    tapaukset.push({ nimi: 'Maaliskuu 410 € (31 pv)', history: h410, start: pvm(2026, 2, 1), end: kkLoppu(2026, 2, 31), odotus: 410, tol: 0.01 });
    tapaukset.push({ nimi: '10 pv tammikuussa', history: h410, start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 10), odotus: 410 * (10 / 31), tol: 0.1 });
    tapaukset.push({ nimi: '10 pv helmikuussa', history: h410, start: pvm(2026, 1, 1), end: kkLoppu(2026, 1, 10), odotus: 410 * (10 / 28), tol: 0.1 });
    // Maaliskuu sisaltaa kesaaikaan siirtymisen -> kuukausi ~1h lyhyempi, joten
    // osakuukauden DST-oikea osuus poikkeaa hieman naivista 10/31:sta (loysempi tol).
    tapaukset.push({ nimi: '10 pv maaliskuussa', history: h410, start: pvm(2026, 2, 1), end: kkLoppu(2026, 2, 10), odotus: 410 * (10 / 31), tol: 0.5 });

    // 4c. Eri maarat per kuukausi (410/500/600, monirivinen historia)
    tapaukset.push({ nimi: 'Tammikuu 410 € (monirivi)', history: historyEriKk, start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 31), odotus: 410, tol: 0.01 });
    tapaukset.push({ nimi: 'Helmikuu 500 € (monirivi)', history: historyEriKk, start: pvm(2026, 1, 1), end: kkLoppu(2026, 1, 28), odotus: 500, tol: 0.01 });
    tapaukset.push({ nimi: 'Maaliskuu 600 € (monirivi)', history: historyEriKk, start: pvm(2026, 2, 1), end: kkLoppu(2026, 2, 31), odotus: 600, tol: 0.01 });
    tapaukset.push({ nimi: 'Yhteensa tammi–maalis (410/500/600)', history: historyEriKk, start: pvm(2026, 0, 1), end: kkLoppu(2026, 2, 31), odotus: 1510, tol: 0.5 });

    // 5. History-vaihto kesken kuukauden
    tapaukset.push({
        nimi: '200€ 1–15, 400€ 16–31',
        history: [{ alkaen: [2026, 0, 1], summa: 200 }, { alkaen: [2026, 0, 16], summa: 400 }],
        start: pvm(2026, 0, 1), end: kkLoppu(2026, 0, 31), odotus: 200 * (15 / 31) + 400 * (16 / 31), tol: 1
    });

    // 6. Eri vuodet (tammikuu 500 €)
    [2024, 2025, 2026].forEach(function (vuosi) {
        tapaukset.push({
            nimi: vuosi + ' tammikuu 500 €', history: [{ alkaen: [vuosi, 0, 1], summa: 500 }],
            start: pvm(vuosi, 0, 1), end: kkLoppu(vuosi, 0, 31), odotus: 500, tol: 0.01
        });
    });

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = tapaukset;
    } else {
        root.TESTITAPAUKSET = tapaukset;
    }
})(typeof self !== 'undefined' ? self : this);
