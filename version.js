// version.js — keskitetty versionumero (yksi totuuden lahde).
// Ei DOM-koodia: ladataan seka sivuille (<script src>) etta service workeriin
// (importScripts sw.js:ssa). versio.js renderoi tasta leiman, sw.js johtaa
// CACHE_NAMEn. Bumppaa VAIN tata: leima ja cache paivittyvat yhdesta paikasta.
var BUILD = 25;
