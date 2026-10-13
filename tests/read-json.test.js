const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readJson } = require('../scripts/lib/read-json');

const tmp = (name, contents) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-test-'));
  const file = path.join(dir, name);
  fs.writeFileSync(file, contents, 'utf8');
  return file;
};

test('lee un JSON valido', () => {
  const file = tmp('ok.json', '{"a":1}');
  assert.deepStrictEqual(readJson(file), { a: 1 });
});

test('un fichero inexistente da error legible con el codigo, sin stack de JSON.parse', () => {
  assert.throws(() => readJson(path.join(os.tmpdir(), 'no-existe-jamas.json')), (err) => {
    assert.ok(err.message.includes('No se puede leer el JSON de datos'));
    assert.ok(err.message.includes('ENOENT'));
    return true;
  });
});

test('un JSON corrupto da error legible nombrando el fichero', () => {
  const file = tmp('roto.json', '{ esto no es json');
  assert.throws(() => readJson(file), (err) => {
    assert.ok(err.message.includes('no es valido'));
    assert.ok(err.message.includes(file));
    return true;
  });
});
