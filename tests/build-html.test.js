const test = require('node:test');
const assert = require('node:assert');
const { buildHtml, read } = require('../scripts/build-pdf');

test('sin summary el PDF no lleva bloque de resumen', () => {
  assert.doesNotMatch(buildHtml(read('cv.en.json')), /summary-text"/);
});

test('con summary el resumen va antes de las columnas', () => {
  const html = buildHtml({ ...read('cv.en.json'), summary: 'Texto de resumen.' });
  assert.match(html, /<p class="summary-text">Texto de resumen\.<\/p>/);
  assert.ok(html.indexOf('summary-text">') < html.indexOf('<div class="body">'));
});
