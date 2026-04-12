// Keskitetty versionumero - muuta VAIN tata tiedostoa
var VERSIO = 'TESTI v8';

// Renderoi leima automaattisesti oikeaan ylakulmaan
(function () {
    var div = document.createElement('div');
    div.textContent = VERSIO;
    div.style.cssText = 'position:fixed;top:5px;right:10px;font-size:18px;opacity:0.7;pointer-events:none;color:black;font-family:"Courier New",monospace;z-index:9999;';
    document.body.appendChild(div);
})();
