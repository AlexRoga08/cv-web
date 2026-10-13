const fs = require('node:fs');

const readJson = (filePath) => {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`No se puede leer el JSON de datos: ${filePath} (${err.code})`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`El JSON de datos no es valido: ${filePath} (${err.message})`);
  }
};

module.exports = { readJson };
