const path = require('node:path');

const DEFAULT_TARGETS = [
  { data: 'cv.json', out: 'cv.pdf' },
  { data: 'cv.en.json', out: 'cv-en.pdf' },
];

const parseArgs = (argv) => {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag !== '--data' && flag !== '--out') continue;
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Falta el valor de ${flag}.`);
    }
    parsed[flag.slice(2)] = value;
    i += 1;
  }
  return parsed;
};

const resolveTargets = (argv, roots) => {
  const { data, out } = parseArgs(argv);

  if (data && out) {
    return [
      {
        dataPath: path.resolve(roots.cwd, data),
        outPath: path.resolve(roots.cwd, out),
        label: out,
      },
    ];
  }

  if (data || out) {
    throw new Error(
      '--data y --out deben usarse juntos. Sin --out se sobrescribiria el CV canonico de assets/.'
    );
  }

  return DEFAULT_TARGETS.map((target) => ({
    dataPath: path.resolve(roots.root, 'data', target.data),
    outPath: path.resolve(roots.root, 'assets', target.out),
    label: `assets/${target.out}`,
  }));
};

module.exports = { DEFAULT_TARGETS, parseArgs, resolveTargets };
