const fs = require('node:fs');
const path = require('node:path');
const { readJson } = require('./lib/read-json');
const { findReserveProblems, findCanonicalMismatch } = require('./lib/validate-reserve');

const ROOT = path.join(__dirname, '..');
const RESERVE = path.join(ROOT, 'private', 'reserve.json');

const report = (problems, heading) => {
  if (problems.length === 0) return false;
  console.error(heading);
  for (const problem of problems) console.error(`  - ${problem}`);
  return true;
};

try {
  const es = readJson(path.join(ROOT, 'data', 'cv.json'));
  const en = readJson(path.join(ROOT, 'data', 'cv.en.json'));

  let failed = report(
    findCanonicalMismatch(es, en),
    'ERROR: los dos CV canonicos han dejado de ser paralelos:'
  );

  if (!fs.existsSync(RESERVE)) {
    if (!failed) {
      console.log(
        'No hay private/reserve.json todavia. El personalizador funcionara solo con el CV canonico.'
      );
    }
    process.exit(failed ? 1 : 0);
  }

  failed =
    report(
      findReserveProblems(readJson(RESERVE), es),
      'ERROR: la reserva no encaja con el CV canonico:'
    ) || failed;

  if (failed) process.exit(1);

  console.log('Reserva coherente con el CV canonico, y los dos idiomas son paralelos.');
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
