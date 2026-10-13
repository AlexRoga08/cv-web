const test = require('node:test');
const assert = require('node:assert');
const { buildHtml, read } = require('../scripts/build-pdf');

test('sin summary el PDF no lleva bloque de resumen', () => {
  assert.doesNotMatch(buildHtml(read('cv.en.json')), /summary-text"/);
});

test('con summary el resumen va antes de las columnas', () => {
  const en = read('cv.en.json');
  const html = buildHtml({
    ...en,
    summary: 'Texto de resumen.',
    ui: { ...en.ui, pdf: { ...en.ui.pdf, summary: 'Summary' } },
  });
  assert.match(html, /<p class="summary-text">Texto de resumen\.<\/p>/);
  assert.ok(html.indexOf('summary-text">') < html.indexOf('<div class="body">'));
});

test('el titulo del resumen sale del locale, no de un literal en ingles', () => {
  const es = read('cv.json');
  const html = buildHtml({
    ...es,
    summary: 'Texto de resumen.',
    ui: { ...es.ui, pdf: { ...es.ui.pdf, summary: 'Resumen' } },
  });
  assert.match(html, /<div class="section-title">Resumen<\/div>/);
  assert.doesNotMatch(html, /<div class="section-title">Summary<\/div>/);
});
