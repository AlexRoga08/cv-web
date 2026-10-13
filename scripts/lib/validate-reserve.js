const isText = (value) => typeof value === 'string' && value.trim() !== '';

const checkExtraBullets = (entry, at) => {
  if (entry == null || typeof entry !== 'object') {
    return [`${at} no es un objeto`];
  }

  const unknown = Object.keys(entry).filter((key) => key !== 'extraBullets');
  const problems = unknown.map(
    (key) => `${at}.${key} no se reconoce; el unico campo valido es extraBullets`
  );

  if (!Array.isArray(entry.extraBullets)) {
    problems.push(`${at}.extraBullets falta o no es una lista`);
    return problems;
  }

  entry.extraBullets.forEach((bullet, i) => {
    if (!isText(bullet)) problems.push(`${at}.extraBullets[${i}] no es texto`);
  });

  return problems;
};

const findReserveProblems = (reserve, canonical) => {
  const problems = [];
  const source = reserve || {};

  const roles = (canonical.experience || []).map((entry) => entry.role);
  for (const [key, entry] of Object.entries(source.experience || {})) {
    if (!roles.includes(key)) {
      problems.push(
        `reserve.experience["${key}"] no coincide con ningun role de cv.json. ` +
          `Roles validos: ${roles.join(' | ')}`
      );
      continue;
    }
    problems.push(...checkExtraBullets(entry, `reserve.experience["${key}"]`));
  }

  const groups = (canonical.skills || []).map((group) => group.title);
  for (const [key, badges] of Object.entries(source.skills || {})) {
    if (!groups.includes(key)) {
      problems.push(
        `reserve.skills["${key}"] no coincide con ningun grupo de cv.json. ` +
          `Grupos validos: ${groups.join(' | ')}`
      );
      continue;
    }
    if (!Array.isArray(badges)) {
      problems.push(`reserve.skills["${key}"] no es una lista`);
      continue;
    }
    badges.forEach((badge, i) => {
      if (!isText(badge)) problems.push(`reserve.skills["${key}"][${i}] no es texto`);
    });
  }

  return problems;
};

const findCanonicalMismatch = (es, en) => {
  const problems = [];

  for (const field of ['experience', 'skills']) {
    const left = Array.isArray(es[field]) ? es[field].length : -1;
    const right = Array.isArray(en[field]) ? en[field].length : -1;
    if (left !== right) {
      problems.push(
        `cv.json y cv.en.json no son paralelos en ${field}: ${left} frente a ${right}. ` +
          'La reserva se mapea al ingles por posicion, asi que un desajuste la perderia en silencio.'
      );
    }
  }

  return problems;
};

module.exports = { findReserveProblems, findCanonicalMismatch };
