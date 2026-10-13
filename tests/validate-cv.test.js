const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { findCvProblems } = require('../scripts/lib/validate-cv');

const load = (name) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8'));

test('el CV canonico en castellano es valido', () => {
  assert.deepStrictEqual(findCvProblems(load('cv.json')), []);
});

test('el CV canonico en ingles es valido', () => {
  assert.deepStrictEqual(findCvProblems(load('cv.en.json')), []);
});

test('detecta la falta de ui.pdf, que imprimiria undefined en el PDF', () => {
  const cv = load('cv.json');
  delete cv.ui.pdf;
  const problems = findCvProblems(cv);
  assert.ok(problems.some((p) => p.includes('ui.pdf.skills')));
  assert.ok(problems.some((p) => p.includes('ui.pdf.experience')));
});

test('detecta un campo de texto vacio', () => {
  const cv = load('cv.json');
  cv.contact.email = '   ';
  assert.ok(findCvProblems(cv).some((p) => p.includes('contact.email')));
});

test('detecta una lista obligatoria vacia', () => {
  const cv = load('cv.json');
  cv.experience = [];
  assert.ok(findCvProblems(cv).some((p) => p.includes('experience[]')));
});

test('detecta una lista obligatoria ausente', () => {
  const cv = load('cv.json');
  delete cv.projects;
  assert.ok(findCvProblems(cv).some((p) => p.includes('projects[]')));
});

test('no revienta con un objeto vacio ni con null', () => {
  assert.ok(findCvProblems({}).length > 0);
  assert.ok(findCvProblems(null).length > 0);
});
