const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-pdf.js');

const runCli = (args, timeout = 30000) =>
  spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, timeout, encoding: 'utf8' });

const assertNoHang = (result) =>
  assert.strictEqual(result.signal, null, 'el proceso fue matado por timeout: se colgo');

test('un fallo al escribir el PDF termina el proceso en vez de colgarlo', () => {
  const result = runCli([
    '--data',
    'data/cv.json',
    '--out',
    'private/directorio-que-no-existe/CV.pdf',
  ]);
  assertNoHang(result);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /ERROR:/);
});

test('--data sin --out no toca los PDF canonicos', () => {
  const before = fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs;
  const result = runCli(['--data', 'data/cv.json']);
  assertNoHang(result);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /deben usarse juntos/);
  assert.strictEqual(fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs, before);
});

test('la forma --bandera=valor no cae silenciosamente en los canonicos', () => {
  const before = fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs;
  const result = runCli(['--data=data/cv.json', '--out=assets/cv.pdf']);
  assertNoHang(result);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /private/);
  assert.strictEqual(fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs, before);
});

test('una bandera desconocida aborta sin regenerar los canonicos', () => {
  const before = fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs;
  const result = runCli(['--verbose', '--data', 'data/cv.json', '--out', 'private/x.pdf']);
  assertNoHang(result);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /no reconocida/);
  assert.strictEqual(fs.statSync(path.join(ROOT, 'assets', 'cv.pdf')).mtimeMs, before);
});

test('un JSON de datos inexistente aborta con mensaje legible y sin stack', () => {
  const result = runCli(['--data', 'data/no-existe.json', '--out', 'private/x.pdf']);
  assertNoHang(result);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /No se puede leer el JSON de datos/);
  assert.doesNotMatch(result.stderr, /at Object\./);
});
