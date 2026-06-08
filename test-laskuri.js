/**
 * Säästölaskurin testit (Node) — yhtasuuruustapaukset jaettu testitapaukset.js:aan,
 * nykyhetkeen sidottu data tassa harnessissa.
 */

const { calculateSavings } = require('./saastolaskuri.js');
const tapaukset = require('./testitapaukset.js');

function test(name, condition) {
    console.log(`  ${condition ? '✓' : '✗'} ${name}`);
    return condition;
}

let passed = 0, failed = 0;

console.log('\n=== Säästölaskurin testit ===\n');

// Jaetut yhtasuuruustapaukset
console.log('Yhtasuuruustapaukset (testitapaukset.js):');
tapaukset.forEach(function (t) {
    const tulos = calculateSavings(t.history, t.start, t.end);
    const ok = Math.abs(tulos - t.odotus) < t.tol;
    if (test(`${t.nimi} → ${tulos.toFixed(2)} € (odotus ${t.odotus.toFixed(2)})`, ok)) passed++; else failed++;
});

// Nykyinen data — monirivinen historia, tulos > 0
console.log('\nNykyinen data (Paula 589.26/629.04/365.08, Tomi 957.51/757.18/491.89):');
const nyt = new Date();
const kkAlku = new Date(nyt.getFullYear(), nyt.getMonth(), 1).getTime();
const vuosiAlku = new Date(nyt.getFullYear(), 0, 1).getTime();
const paulaH = [
    { alkaen: [2026, 0, 1], summa: 589.26 },
    { alkaen: [2026, 1, 1], summa: 629.04 },
    { alkaen: [2026, 2, 1], summa: 365.08 }
];
const tomiH = [
    { alkaen: [2026, 0, 1], summa: 957.51 },
    { alkaen: [2026, 1, 1], summa: 757.18 },
    { alkaen: [2026, 2, 1], summa: 491.89 }
];
const pM = calculateSavings(paulaH, kkAlku, nyt.getTime());
const tM = calculateSavings(tomiH, kkAlku, nyt.getTime());
const pY = calculateSavings(paulaH, vuosiAlku, nyt.getTime());
const tY = calculateSavings(tomiH, vuosiAlku, nyt.getTime());
if (test(`Kuukausi yhteensä: Paula ${pM.toFixed(2)} + Tomi ${tM.toFixed(2)} = ${(pM + tM).toFixed(2)} €`, (pM + tM) > 0)) passed++; else failed++;
if (test(`Vuosi yhteensä: ${(pY + tY).toFixed(2)} €`, (pY + tY) > 0)) passed++; else failed++;

console.log('\n=== Yhteenveto ===');
console.log(`Läpäisty: ${passed}, epäonnistunut: ${failed}`);
console.log(failed === 0 ? '\nKaikki testit läpäisty ✓\n' : '\nJoitakin testejä epäonnistui.\n');
process.exit(failed > 0 ? 1 : 0);
