💶 Säästölaskuri (Paula & Tomi)

Tämä on kevyt, selaimessa toimiva säästölaskuri, joka on optimoitu erityisesti Boox Go 7 E-ink -laitteelle. Laskuri laskee lounassäästöjen kertymää reaaliajassa ja näyttää sekä kuukausittaisen että vuosittaisen säästötilanteen.

✨ Ominaisuudet

E-ink Optimointi: Korkea kontrasti, suuret fontit ja vähän välkkymistä aiheuttavat päivitykset.

Reaaliaikainen laskenta: Laskee säästöt sekunnin tarkkuudella laitteen kelloon perustuen.

Historiahallinta: Tukee muuttuvia säästötavoitteita ilman, että kertyneen historian laskenta menee sekaisin.

Yksityisyys: Kaikki laskenta tapahtuu paikallisesti selaimessa. Mitään tietoja ei lähetetä palvelimelle.

🛠 Käyttöönotto Booxilla

Avaa osoite: https://tomipetteri-ops.github.io/lounaslaskuri/

Valitse selaimen valikosta "Add to Home Screen".

Säädä E-ink Centeristä virkistystilaksi Regal ja nosta Dark Enhancement -asetusta.

Käytä laitetta lentokonetilassa akun säästämiseksi (laskuri toimii ilman verkkoa latauksen jälkeen).

📝 Säästötavoitteiden muuttaminen

Jos kuukausittainen säästötavoite muuttuu, päivitä index.html-tiedoston historia-osio:

const paulaHistoria = [
    { alkaen: "2026-01-01", summa: 410 },
    { alkaen: "2026-04-01", summa: 500 } // Lisää tällainen rivi muutoksen tapahtuessa
];


🔋 Akun säästövinkit

Pidä taustavalo pois päältä.

Käytä Auto Sleep: Never ja Auto Wi-Fi Off (tai lentokonetilaa).

Päivitysväli on asetettu koodissa 60 sekuntiin virrankulutuksen minimoimiseksi.

Tehty yhteistyössä Geminin kanssa.
