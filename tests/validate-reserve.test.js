const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  findReserveProblems,
  findCanonicalMismatch,
} = require('../scripts/lib/validate-reserve');

const load = (name) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8'));

const canonical = {
  experience: [{ role: 'Branch Manager' }, { role: 'Sales Assistant' }],
  skills: [{ title: 'Marketing' }, { title: 'Datos &amp; Reporting' }],
};

test('una reserva vacia es valida', () => {
  assert.deepStrictEqual(findReserveProblems({}, canonical), []);
});

test('claves que casan con el canonico son validas', () => {
  const reserve = {
    experience: { 'Branch Manager': { extraBullets: ['algo cierto'] } },
    skills: { Marketing: ['SEM'] },
  };
  assert.deepStrictEqual(findReserveProblems(reserve, canonical), []);
});

test('un role que no existe aborta y nombra los validos', () => {
  const reserve = { experience: { 'Branch Manger': { extraBullets: ['x'] } } };
  const problems = findReserveProblems(reserve, canonical);
  assert.strictEqual(problems.length, 1);
  assert.ok(problems[0].includes('Branch Manger'));
  assert.ok(problems[0].includes('Branch Manager'));
  assert.ok(problems[0].includes('Sales Assistant'));
});

test('un grupo de skills que no existe aborta', () => {
  const problems = findReserveProblems({ skills: { Marketin: ['x'] } }, canonical);
  assert.strictEqual(problems.length, 1);
  assert.ok(problems[0].includes('Marketin'));
});

test('acumula varios problemas a la vez', () => {
  const reserve = {
    experience: { Inventado: { extraBullets: ['x'] } },
    skills: { Tambien: ['y'] },
  };
  assert.strictEqual(findReserveProblems(reserve, canonical).length, 2);
});

test('extraBullets mal escrito se detecta en vez de perderse en silencio', () => {
  const reserve = { experience: { 'Branch Manager': { extraBullet: ['logro real'] } } };
  const problems = findReserveProblems(reserve, canonical);
  assert.ok(problems.some((p) => p.includes('extraBullet')));
});

test('extraBullets ausente se detecta', () => {
  const reserve = { experience: { 'Branch Manager': {} } };
  assert.ok(findReserveProblems(reserve, canonical).some((p) => p.includes('extraBullets')));
});

test('extraBullets que no es lista se detecta', () => {
  const reserve = { experience: { 'Branch Manager': { extraBullets: 'un string' } } };
  assert.ok(findReserveProblems(reserve, canonical).some((p) => p.includes('extraBullets')));
});

test('un bullet que no es texto se detecta', () => {
  const reserve = { experience: { 'Branch Manager': { extraBullets: [{ t: 'x' }] } } };
  assert.ok(findReserveProblems(reserve, canonical).some((p) => p.includes('extraBullets[0]')));
});

test('un grupo de skills cuyo valor no es lista se detecta', () => {
  const problems = findReserveProblems({ skills: { Marketing: 'SEM' } }, canonical);
  assert.ok(problems.some((p) => p.includes('skills["Marketing"]')));
});

test('un badge que no es texto se detecta', () => {
  const problems = findReserveProblems({ skills: { Marketing: [42] } }, canonical);
  assert.ok(problems.some((p) => p.includes('skills["Marketing"][0]')));
});

test('los dos canonicos reales son paralelos, que es lo que permite mapear la reserva al ingles', () => {
  assert.deepStrictEqual(findCanonicalMismatch(load('cv.json'), load('cv.en.json')), []);
});

test('detecta que los canonicos dejan de ser paralelos en experiencia', () => {
  const es = load('cv.json');
  const en = load('cv.en.json');
  en.experience.pop();
  const problems = findCanonicalMismatch(es, en);
  assert.ok(problems.some((p) => p.includes('experience')));
});

test('detecta que los canonicos dejan de ser paralelos en skills', () => {
  const es = load('cv.json');
  const en = load('cv.en.json');
  en.skills.pop();
  const problems = findCanonicalMismatch(es, en);
  assert.ok(problems.some((p) => p.includes('skills')));
});
