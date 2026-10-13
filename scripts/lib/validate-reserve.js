const findReserveProblems = (reserve, canonical) => {
  const problems = [];
  const source = reserve || {};

  const roles = (canonical.experience || []).map((entry) => entry.role);
  for (const key of Object.keys(source.experience || {})) {
    if (!roles.includes(key)) {
      problems.push(
        `reserve.experience["${key}"] no coincide con ningun role de cv.json. ` +
          `Roles validos: ${roles.join(' | ')}`
      );
    }
  }

  const groups = (canonical.skills || []).map((group) => group.title);
  for (const key of Object.keys(source.skills || {})) {
    if (!groups.includes(key)) {
      problems.push(
        `reserve.skills["${key}"] no coincide con ningun grupo de cv.json. ` +
          `Grupos validos: ${groups.join(' | ')}`
      );
    }
  }

  return problems;
};

module.exports = { findReserveProblems };
