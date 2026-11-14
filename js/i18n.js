/* Idioma: a página em inglês usa <html lang="en">.
   L(pt, en) escolhe o texto; tr(pt) traduz textos fixos do cenário 3D via TR (preenchido em lang-en.js). */
window.LANG = (document.documentElement.lang || 'pt').slice(0, 2) === 'en' ? 'en' : 'pt';
window.L = function (pt, en) { return window.LANG === 'en' && en !== undefined ? en : pt; };
window.TR = window.TR || {};
window.tr = function (s) { return (window.LANG === 'en' && s && window.TR[s]) || s; };
