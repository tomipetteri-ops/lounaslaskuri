/**
 * Säästölaskurin testit - eri määrät, kuukaudet ja vuodet
 */

function parseDate(arr) { return new Date(arr[0], arr[1], arr[2]).getTime(); }
function getDaysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }

function calculateSavings(history, start, end) {
    let total = 0;
    for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        const entryStart = parseDate(entry.alkaen);
        let entryEnd = (i + 1 < history.length) ? parseDate(history[i+1].alkaen) : end;
        const activeStart = Math.max(entryStart, start);
        const activeEnd = Math.min(entryEnd, end);
        if (activeEnd <= activeStart) continue;

        let current = activeStart;
        while (current < activeEnd) {
            const currentDate = new Date(current);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
            const segmentEnd = Math.min(monthEnd + 1, activeEnd);
            const seconds = (segmentEnd - current) / 1000;
            const days = getDaysInMonth(currentDate);
            total += seconds * (entry.summa / (days * 24 * 60 * 60));
            current = segmentEnd;
        }
    }
    return total;
}

function test(name, condition) {
    const ok = condition ? '✓' : '✗';
    console.log(`  ${ok} ${name}`);
    return condition;
}

let passed = 0, failed = 0;

console.log('\n=== Säästölaskurin testit ===\n');

// 1. Koko kuukausi – yksi määrä
console.log('1. Koko kuukausi (eri määrät):');
const tammiAlku = new Date(2026, 0, 1).getTime();
const tammiLoppu = new Date(2026, 0, 31, 23, 59, 59, 999).getTime() + 1;
for (const summa of [100, 410, 870, 1000]) {
    const h = [{ alkaen: [2026, 0, 1], summa }];
    const t = calculateSavings(h, tammiAlku, tammiLoppu);
    const odotus = summa;
    const ok = Math.abs(t - odotus) < 0.01;
    if (test(`${summa} € tammikuussa → ${t.toFixed(2)} € (odotus ${odotus})`, ok)) passed++; else failed++;
}

// 2. Puolikas kuukausi
console.log('\n2. Puolikas kuukausi (15 päivää):');
const tammi15 = new Date(2026, 0, 15, 23, 59, 59, 999).getTime() + 1;
const h410 = [{ alkaen: [2026, 0, 1], summa: 410 }];
const puolikas = calculateSavings(h410, tammiAlku, tammi15);
const odotus15 = 410 * (15 / 31);
if (test(`410 € × 15/31 päivää → ${puolikas.toFixed(2)} € (odotus ~${odotus15.toFixed(2)})`, Math.abs(puolikas - odotus15) < 0.5)) passed++; else failed++;

// 3. Helmikuu (28 päivää) vs karkausvuosi (29 päivää)
console.log('\n3. Helmikuu – 28 vs 29 päivää:');
const helmi2025 = new Date(2025, 1, 1).getTime();
const helmi2025Loppu = new Date(2025, 1, 28, 23, 59, 59, 999).getTime() + 1;
const helmi2024 = new Date(2024, 1, 1).getTime();
const helmi2024Loppu = new Date(2024, 1, 29, 23, 59, 59, 999).getTime() + 1;
const h100 = [{ alkaen: [2025, 1, 1], summa: 100 }];
const h100_24 = [{ alkaen: [2024, 1, 1], summa: 100 }];
const t25 = calculateSavings(h100, helmi2025, helmi2025Loppu);
const t24 = calculateSavings(h100_24, helmi2024, helmi2024Loppu);
if (test(`2025 helmikuu (28 pv): ${t25.toFixed(2)} €`, Math.abs(t25 - 100) < 0.01)) passed++; else failed++;
if (test(`2024 helmikuu (29 pv, karkaus): ${t24.toFixed(2)} €`, Math.abs(t24 - 100) < 0.01)) passed++; else failed++;

// 4. Useampi kuukausi – eri vuodet
console.log('\n4. Useampi kuukausi (tammi–maalis 2026):');
const maalisLoppu = new Date(2026, 2, 31, 23, 59, 59, 999).getTime() + 1;
const kolmeKk = calculateSavings(h410, tammiAlku, maalisLoppu);
const odotus3kk = 410 * 3; // 31+28+31 päivää, jokaisesta koko summa
if (test(`410 € × 3 kk → ${kolmeKk.toFixed(2)} € (odotus 1230)`, Math.abs(kolmeKk - 1230) < 0.5)) passed++; else failed++;

// 5. History-vaihto kesken kuukauden
console.log('\n5. History-vaihto kesken kuukauden:');
const historyVaihto = [
    { alkaen: [2026, 0, 1], summa: 200 },
    { alkaen: [2026, 0, 16], summa: 400 }
];
const tammiKoko = new Date(2026, 0, 31, 23, 59, 59, 999).getTime() + 1;
const vaihto = calculateSavings(historyVaihto, tammiAlku, tammiKoko);
const odotusV = 200 * (15/31) + 400 * (16/31); // 15 pv @ 200, 16 pv @ 400
if (test(`200€ 1–15, 400€ 16–31 → ${vaihto.toFixed(2)} € (odotus ~${odotusV.toFixed(2)})`, Math.abs(vaihto - odotusV) < 1)) passed++; else failed++;

// 6. Eri vuosi – 2024 vs 2025 vs 2026
console.log('\n6. Eri vuodet (koko tammikuu):');
for (const vuosi of [2024, 2025, 2026]) {
    const alku = new Date(vuosi, 0, 1).getTime();
    const loppu = new Date(vuosi, 0, 31, 23, 59, 59, 999).getTime() + 1;
    const h = [{ alkaen: [vuosi, 0, 1], summa: 500 }];
    const t = calculateSavings(h, alku, loppu);
    if (test(`${vuosi} tammikuu 500 € → ${t.toFixed(2)} €`, Math.abs(t - 500) < 0.01)) passed++; else failed++;
}

// 7. Nykyinen data (Paula 410, Tomi 870) – tarkistus
console.log('\n7. Nykyinen data (Paula 410 €, Tomi 870 €):');
const nyt = new Date();
const kkAlku = new Date(nyt.getFullYear(), nyt.getMonth(), 1).getTime();
const vuosiAlku = new Date(nyt.getFullYear(), 0, 1).getTime();
const paulaH = [{ alkaen: [2026, 0, 1], summa: 410 }];
const tomiH = [{ alkaen: [2026, 0, 1], summa: 870 }];
const pM = calculateSavings(paulaH, kkAlku, nyt.getTime());
const tM = calculateSavings(tomiH, kkAlku, nyt.getTime());
const pY = calculateSavings(paulaH, vuosiAlku, nyt.getTime());
const tY = calculateSavings(tomiH, vuosiAlku, nyt.getTime());
const daysInMonth = getDaysInMonth(nyt);
const dayOfMonth = nyt.getDate();
const expectedMonth = (410 + 870) * (dayOfMonth / daysInMonth);
if (test(`Kuukausi yhteensä: Paula ${pM.toFixed(2)} + Tomi ${tM.toFixed(2)} = ${(pM+tM).toFixed(2)} €`, (pM + tM) > 0 && (pM + tM) < 1280 * 1.1)) passed++; else failed++;
if (test(`Vuosi yhteensä: ${(pY+tY).toFixed(2)} €`, (pY + tY) > 0)) passed++; else failed++;

console.log('\n=== Yhteenveto ===');
console.log(`Läpäisty: ${passed}, epäonnistunut: ${failed}`);
console.log(failed === 0 ? '\nKaikki testit läpäisty ✓\n' : '\nJoitakin testejä epäonnistui.\n');
process.exit(failed > 0 ? 1 : 0);
