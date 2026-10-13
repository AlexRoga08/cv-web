const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { findCvProblems } = require('../scripts/lib/validate-cv');

const load = (name) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8'));

const hasProblem = (cv, needle) => findCvProblems(cv).some((p) => p.includes(needle));

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
  assert.ok(hasProblem(cv, 'contact.email'));
});

test('detecta una lista obligatoria vacia', () => {
  const cv = load('cv.json');
  cv.experience = [];
  assert.ok(hasProblem(cv, 'experience[]'));
});

test('detecta una lista obligatoria ausente', () => {
  const cv = load('cv.json');
  delete cv.projects;
  assert.ok(hasProblem(cv, 'projects[]'));
});

test('no revienta con un objeto vacio ni con null', () => {
  assert.ok(findCvProblems({}).length > 0);
  assert.ok(findCvProblems(null).length > 0);
});

test('detecta campos mutilados dentro de una experiencia', () => {
  const cv = load('cv.json');
  delete cv.experience[0].dates;
  assert.ok(hasProblem(cv, 'experience[0].dates'));

  const otro = load('cv.json');
  delete otro.experience[1].company;
  assert.ok(hasProblem(otro, 'experience[1].company'));

  const tercero = load('cv.json');
  delete tercero.experience[0].role;
  assert.ok(hasProblem(tercero, 'experience[0].role'));
});

test('detecta bullets ausentes, que hacen reventar el render con un map de undefined', () => {
  const cv = load('cv.json');
  delete cv.experience[0].bullets;
  assert.ok(hasProblem(cv, 'experience[0].bullets'));
});

test('detecta un bullet que no es texto', () => {
  const cv = load('cv.json');
  cv.experience[0].bullets[1] = { texto: 'objeto en vez de string' };
  assert.ok(hasProblem(cv, 'experience[0].bullets[1]'));
});

test('detecta un proyecto sin urlLabel ni tag, que imprimiria undefined', () => {
  const cv = load('cv.json');
  delete cv.projects[0].urlLabel;
  assert.ok(hasProblem(cv, 'projects[0]'));
});

test('un proyecto con tag en vez de urlLabel es valido', () => {
  const cv = load('cv.json');
  delete cv.projects[0].urlLabel;
  cv.projects[0].tag = 'Uso interno';
  assert.deepStrictEqual(findCvProblems(cv), []);
});

test('detecta campos mutilados dentro de un proyecto', () => {
  const cv = load('cv.json');
  delete cv.projects[1].name;
  assert.ok(hasProblem(cv, 'projects[1].name'));

  const otro = load('cv.json');
  delete otro.projects[0].desc;
  assert.ok(hasProblem(otro, 'projects[0].desc'));
});

test('un proyecto con descPdf y sin desc es valido, porque el PDF usa descPdf', () => {
  const cv = load('cv.json');
  cv.projects[1].descPdf = 'version corta';
  delete cv.projects[1].desc;
  assert.deepStrictEqual(findCvProblems(cv), []);
});

test('detecta campos mutilados dentro de formacion', () => {
  const cv = load('cv.json');
  delete cv.education[0].year;
  assert.ok(hasProblem(cv, 'education[0].year'));

  const otro = load('cv.json');
  delete otro.education[2].degree;
  assert.ok(hasProblem(otro, 'education[2].degree'));
});

test('formacion con degreePdf y schoolPdf es valida sin degree ni school', () => {
  const cv = load('cv.json');
  cv.education[0].degreePdf = 'Master corto';
  cv.education[0].schoolPdf = 'EAE';
  delete cv.education[0].degree;
  delete cv.education[0].school;
  assert.deepStrictEqual(findCvProblems(cv), []);
});

test('detecta un grupo de skills sin badges', () => {
  const cv = load('cv.json');
  delete cv.skills[0].badges;
  assert.ok(hasProblem(cv, 'skills[0].badges'));

  const otro = load('cv.json');
  delete otro.skills[1].title;
  assert.ok(hasProblem(otro, 'skills[1].title'));
});

test('detecta un idioma que no es texto', () => {
  const cv = load('cv.json');
  cv.languages[0] = { nombre: 'Espanol' };
  assert.ok(hasProblem(cv, 'languages[0]'));
});

test('sin summary no se exige el titulo de la seccion', () => {
  const cv = load('cv.json');
  delete cv.summary;
  assert.deepStrictEqual(findCvProblems(cv), []);
});

test('con summary se exige ui.pdf.summary, o el titulo saldria en ingles', () => {
  const cv = load('cv.json');
  cv.summary = 'Perfil de negocio con capacidad de construir con IA.';
  assert.ok(hasProblem(cv, 'ui.pdf.summary'));
});

test('con summary y su titulo traducido es valido', () => {
  const cv = load('cv.json');
  cv.summary = 'Perfil de negocio con capacidad de construir con IA.';
  cv.ui.pdf.summary = 'Resumen';
  assert.deepStrictEqual(findCvProblems(cv), []);
});

test('un summary vacio se detecta en vez de pintar una seccion sin texto', () => {
  const cv = load('cv.json');
  cv.summary = '   ';
  cv.ui.pdf.summary = 'Resumen';
  assert.ok(hasProblem(cv, 'summary'));
});
