const test = require('node:test');
const assert = require('node:assert');
const { findReserveProblems } = require('../scripts/lib/validate-reserve');

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
