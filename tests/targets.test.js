const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { parseArgs, resolveTargets } = require('../scripts/lib/targets');

const roots = { root: '/repo', cwd: '/repo' };
const variant = (out) => ['--data', 'private/variants/acme/cv.json', '--out', out];

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
  const targets = resolveTargets(variant('private/variants/acme/CV.pdf'), roots);
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

test('acepta la forma --bandera=valor', () => {
  assert.deepStrictEqual(parseArgs(['--data=a.json', '--out=b.pdf']), {
    data: 'a.json',
    out: 'b.pdf',
  });
});

test('--bandera= sin valor aborta', () => {
  assert.throws(() => parseArgs(['--data=']), /Falta el valor/);
});

test('una bandera desconocida aborta en vez de caer en los canonicos', () => {
  assert.throws(() => parseArgs(['--verbose', '--data', 'a.json', '--out', 'b.pdf']), /no reconocida/);
  assert.throws(() => parseArgs(['--dat=a.json', '--out=b.pdf']), /no reconocida/);
});

test('un argumento suelto sin -- aborta', () => {
  assert.throws(() => parseArgs(['a.json']), /no reconocido/);
});

test('--out dentro del repo y fuera de private/ aborta', () => {
  assert.throws(() => resolveTargets(variant('assets/cv.pdf'), roots), /private/);
  assert.throws(() => resolveTargets(variant('CV.pdf'), roots), /private/);
  assert.throws(() => resolveTargets(variant('en/CV.pdf'), roots), /private/);
});

test('--out dentro de private/ se acepta', () => {
  const targets = resolveTargets(variant('private/variants/acme/CV.pdf'), roots);
  assert.strictEqual(targets[0].outPath, path.resolve('/repo/private/variants/acme/CV.pdf'));
});

test('--out completamente fuera del repo se acepta', () => {
  const outside = path.resolve('/otro/sitio/CV.pdf');
  const targets = resolveTargets(variant(outside), roots);
  assert.strictEqual(targets[0].outPath, outside);
});
