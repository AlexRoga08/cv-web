const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { parseArgs, resolveTargets } = require('../scripts/lib/targets');

const roots = { root: '/repo', cwd: '/repo' };

test('sin argumentos devuelve los dos locales canonicos', () => {
  const targets = resolveTargets([], roots);
  assert.strictEqual(targets.length, 2);
  assert.strictEqual(targets[0].dataPath, path.resolve('/repo/data/cv.json'));
  assert.strictEqual(targets[0].outPath, path.resolve('/repo/assets/cv.pdf'));
  assert.strictEqual(targets[0].label, 'assets/cv.pdf');
  assert.strictEqual(targets[1].dataPath, path.resolve('/repo/data/cv.en.json'));
  assert.strictEqual(targets[1].outPath, path.resolve('/repo/assets/cv-en.pdf'));
});

test('con --data y --out devuelve un unico objetivo resuelto desde cwd', () => {
  const targets = resolveTargets(
    ['--data', 'private/variants/acme/cv.json', '--out', 'private/variants/acme/CV.pdf'],
    roots
  );
  assert.strictEqual(targets.length, 1);
  assert.strictEqual(targets[0].dataPath, path.resolve('/repo/private/variants/acme/cv.json'));
  assert.strictEqual(targets[0].outPath, path.resolve('/repo/private/variants/acme/CV.pdf'));
});

test('--data sin --out aborta para no sobrescribir el CV canonico', () => {
  assert.throws(
    () => resolveTargets(['--data', 'private/variants/acme/cv.json'], roots),
    /deben usarse juntos/
  );
});

test('--out sin --data aborta', () => {
  assert.throws(() => resolveTargets(['--out', 'x.pdf'], roots), /deben usarse juntos/);
});

test('una bandera sin valor aborta', () => {
  assert.throws(() => parseArgs(['--data']), /Falta el valor/);
  assert.throws(() => parseArgs(['--data', '--out']), /Falta el valor/);
});

test('ignora argumentos desconocidos', () => {
  assert.deepStrictEqual(parseArgs(['--verbose', '--data', 'a.json', '--out', 'b.pdf']), {
    data: 'a.json',
    out: 'b.pdf',
  });
});
