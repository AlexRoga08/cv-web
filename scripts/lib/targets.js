const path = require('node:path');

const DEFAULT_TARGETS = [
  { data: 'cv.json', out: 'cv.pdf' },
  { data: 'cv.en.json', out: 'cv-en.pdf' },
];

const FLAGS = ['--data', '--out'];

const parseArgs = (argv) => {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      throw new Error(`Argumento no reconocido: ${token}. Solo se aceptan --data y --out.`);
    }

    const separator = token.indexOf('=');
    const flag = separator === -1 ? token : token.slice(0, separator);

    if (!FLAGS.includes(flag)) {
      throw new Error(`Bandera no reconocida: ${flag}. Solo se aceptan --data y --out.`);
    }

    if (separator !== -1) {
      const value = token.slice(separator + 1);
      if (!value) throw new Error(`Falta el valor de ${flag}.`);
      parsed[flag.slice(2)] = value;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Falta el valor de ${flag}.`);
    }
    parsed[flag.slice(2)] = value;
    i += 1;
  }
  return parsed;
};

const isInside = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};

const assertOutputIsPrivate = (outPath, root) => {
  if (isInside(root, outPath) && !isInside(path.join(root, 'private'), outPath)) {
    throw new Error(
      `--out apunta dentro del repositorio y fuera de private/: ${outPath}. ` +
        'El repositorio es publico y las variantes revelan a que empresas se aplica.'
    );
  }
};

const resolveTargets = (argv, roots) => {
  const { data, out } = parseArgs(argv);

  if (data && out) {
    const outPath = path.resolve(roots.cwd, out);
    assertOutputIsPrivate(outPath, path.resolve(roots.root));
    return [{ dataPath: path.resolve(roots.cwd, data), outPath, label: out }];
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
