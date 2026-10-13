const REQUIRED_STRINGS = [
  'locale.lang',
  'locale.pdfDownloadName',
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

const valueAt = (obj, dotted) =>
  dotted.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const findCvProblems = (cv) => {
  if (cv == null || typeof cv !== 'object') {
    return ['el JSON de datos no es un objeto'];
  }

  const problems = [];

  for (const field of REQUIRED_STRINGS) {
    const value = valueAt(cv, field);
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`falta o esta vacio: ${field}`);
    }
  }

  for (const field of REQUIRED_ARRAYS) {
    if (!Array.isArray(cv[field]) || cv[field].length === 0) {
      problems.push(`falta o esta vacio: ${field}[]`);
    }
  }

  return problems;
};

module.exports = { findCvProblems, REQUIRED_STRINGS, REQUIRED_ARRAYS };
