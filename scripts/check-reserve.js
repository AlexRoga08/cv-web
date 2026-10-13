const fs = require('node:fs');
const path = require('node:path');
const { readJson } = require('./lib/read-json');
const { findReserveProblems } = require('./lib/validate-reserve');

const ROOT = path.join(__dirname, '..');
const RESERVE = path.join(ROOT, 'private', 'reserve.json');

if (!fs.existsSync(RESERVE)) {
  console.log(
    'No hay private/reserve.json todavia. El personalizador funcionara solo con el CV canonico.'
  );
  process.exit(0);
}

try {
  const reserve = readJson(RESERVE);
  const canonical = readJson(path.join(ROOT, 'data', 'cv.json'));
  const problems = findReserveProblems(reserve, canonical);

  if (problems.length > 0) {
    console.error('ERROR: la reserva no encaja con el CV canonico:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log('Reserva coherente con el CV canonico.');
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
