Saastolaskuri (Paula & Tomi)

Selaimessa toimiva kolmen sivun slideshow Boox Go 7 E-ink -laitteelle. Nayttaa saastojen kertyman reaaliajassa, tavoitelistat ja kuvakarusellin.

Sivut

Laskuri (laskuri.html)
Laskee Paulan ja Tomin saastot sekunnin tarkkuudella. Nayttaa kuukausi- ja vuosisumman. Paivittyy 60 sekunnin valein.

Goals (goals.html)
Tavoitelista kolmelle kategorialle: Paula, Tomi ja Yhdessa. Jokaisella ASCII-taide-ikoni. Tukee lisaysta, muokkausta ja poistoa. Landscape-tilassa osiot rinnakkain.

Kuvat (kuvat.html)
Kuvakaruselli IndexedDB-tallennuksella. Kuvat lisataan drag-drop tai tiedostovalitsimella. E-ink-optimoitu (grayscale + kontrasti).

Arkkitehtuuri

index.html toimii master-kontrollerina ja pyorittaa sivuja iframessa:

  index.html (slideshow)
    |
    +-- laskuri.html  (saastolaskuri)
    +-- kuvat.html    (kuvakaruselli)
    +-- goals.html    (tavoitelistat)

Sivujen valiset viestit kulkevat postMessage-APIlla. Asetukset (sivujen nayttoajat) tallentuvat localStorageen. Goals tallentuvat localStorageen, kuvat IndexedDB:hen.

Saastokaava

Tomi:
Lahde: Actual Budget (https://axiomatic-beagle.pikapod.net/budget)
Raportti: "Kulutusosio vain" (Reports-sivu)
Kategoriat: Yllattavat kulut, Seka, Mina 480e vuosi, Bensa, Lounas, Ruoka + Sekatavara ym.

Vertailuarvo = (loka 2025 + marras 2025 + joulu 2025) / 3
            = (1929.43 + 1607.25 + 1762.86) / 3
            = 1766.51 euroa/kk

Kuukauden saasto = vertailuarvo - edellisen kuukauden todellinen kulutus
Esim. huhtikuu: 1766.51 - 1274.62 (maalis) = 491.89 euroa/kk

Paula:
Annetaan manuaalisesti eri jarjestelmasta.

Kk-arvojen paivitys

Tomin arvot paivitetaan kuukausittain:
1. Avaa Actual Budget > Reports > Kulutusosio vain
2. Aseta Compare: edellinen kk, To: sama kk
3. Lue "Spent" -luku oikealta
4. Laske: 1766.51 - spent = uusi summa
5. Lisaa laskuri.html tomiHistory-taulukkoon:
   { alkaen: [2026, KK, 1], summa: UUSI_ARVO }

Paulan arvot paivitetaan manuaalisesti paulaHistory-taulukkoon.

Kayttoonotto Booxilla

1. Avaa: https://tomipetteri-ops.github.io/lounaslaskuri/
2. Valitse selaimen valikosta "Add to Home Screen"
3. Saada E-ink Centerista: Regal-virkistystila, Dark Enhancement ylos
4. Lentokonetila akun saastamiseksi (toimii offline latauksen jalkeen)

Kehitys

Paikallinen kehityspalvelin:
  python3 -m http.server 8080

Testit:
  node test-laskuri.js

Tiedostorakenne

  index.html          Slideshow-kontrolleri (master)
  laskuri.html        Saastolaskuri
  goals.html          Tavoitelistat + ASCII-taide
  kuvat.html          Kuvakaruselli (IndexedDB)
  style.css           Jaetut E-ink-tyylit
  test-laskuri.js     Testit (Node.js)
  test-laskuri.html   Testit (selain)
  goals_vanha.html    Arkistoitu vanha versio
