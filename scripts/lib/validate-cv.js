const REQUIRED_STRINGS = [
  'locale.lang',
  'name.first',
  'name.last',
  'tagline.pdf',
  'contact.email',
  'contact.linkedinLabel',
  'contact.siteLabel',
  'contact.location',
  'ui.pdf.skills',
  'ui.pdf.education',
  'ui.pdf.languages',
  'ui.pdf.experience',
  'ui.pdf.projects',
  'about.highlight',
];

const REQUIRED_ARRAYS = ['skills', 'education', 'languages', 'experience', 'projects'];

const isText = (value) => typeof value === 'string' && value.trim() !== '';

const valueAt = (obj, dotted) =>
  dotted.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const checkTextList = (list, at) => {
  if (!Array.isArray(list)) return [`falta o no es una lista: ${at}`];
  return list.flatMap((item, i) => (isText(item) ? [] : [`no es texto: ${at}[${i}]`]));
};

const checkExperience = (entry, at) => [
  ...['role', 'dates', 'company'].flatMap((field) =>
    isText(entry[field]) ? [] : [`falta o esta vacio: ${at}.${field}`]
  ),
  ...checkTextList(entry.bullets, `${at}.bullets`),
];

const checkProject = (entry, at) => {
  const problems = [];
  if (!isText(entry.name)) problems.push(`falta o esta vacio: ${at}.name`);
  if (!isText(entry.descPdf) && !isText(entry.desc)) {
    problems.push(`falta o esta vacio: ${at}.desc (o descPdf)`);
  }
  if (!isText(entry.urlLabel) && !isText(entry.tag)) {
    problems.push(`${at} necesita urlLabel o tag; sin uno de los dos el PDF imprime undefined`);
  }
  return problems;
};

const checkEducation = (entry, at) => {
  const problems = [];
  if (!isText(entry.year)) problems.push(`falta o esta vacio: ${at}.year`);
  if (!isText(entry.degreePdf) && !isText(entry.degree)) {
    problems.push(`falta o esta vacio: ${at}.degree (o degreePdf)`);
  }
  if (!isText(entry.schoolPdf) && !isText(entry.school)) {
    problems.push(`falta o esta vacio: ${at}.school (o schoolPdf)`);
  }
  return problems;
};

const checkSkillGroup = (entry, at) => [
  ...(isText(entry.title) ? [] : [`falta o esta vacio: ${at}.title`]),
  ...checkTextList(entry.badges, `${at}.badges`),
];

const ENTRY_CHECKS = {
  experience: checkExperience,
  projects: checkProject,
  education: checkEducation,
  skills: checkSkillGroup,
};

const findCvProblems = (cv) => {
  if (cv == null || typeof cv !== 'object') {
    return ['el JSON de datos no es un objeto'];
  }

  const problems = [];

  for (const field of REQUIRED_STRINGS) {
    if (!isText(valueAt(cv, field))) {
      problems.push(`falta o esta vacio: ${field}`);
    }
  }

  for (const field of REQUIRED_ARRAYS) {
    if (!Array.isArray(cv[field]) || cv[field].length === 0) {
      problems.push(`falta o esta vacio: ${field}[]`);
    }
  }

  for (const [field, check] of Object.entries(ENTRY_CHECKS)) {
    if (!Array.isArray(cv[field])) continue;
    cv[field].forEach((entry, i) => {
      const at = `${field}[${i}]`;
      if (entry == null || typeof entry !== 'object') {
        problems.push(`${at} no es un objeto`);
        return;
      }
      problems.push(...check(entry, at));
    });
  }

  if (Array.isArray(cv.languages)) {
    problems.push(...checkTextList(cv.languages, 'languages'));
  }

  return problems;
};

module.exports = { findCvProblems, REQUIRED_STRINGS, REQUIRED_ARRAYS };
