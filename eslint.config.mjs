import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import withNuxt from './.nuxt/eslint.config.mjs';

import eslintConfigPrettier from 'eslint-config-prettier/flat';

// lowest first: each layer may import only the layers before it (ADR-0001)
const LAYERS = ['base', 'auth', 'links'];

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

// these resolve to the root app, not to the layer
const ROOT_ALIASES = ['~', '@', '~~', '@@', '#shared', '#server'];

const ROOT_IMPORT_MESSAGE =
  'Layers cannot import the root app; import from your own layer or a lower one through #layers/<name> (ADR-0001).';

const higherLayersMessage = (higherLayers) =>
  `Dependencies point root → links → auth → base, so this layer cannot import ${higherLayers.join(' or ')} (ADR-0001).`;

const rootAliasesPattern = ({ allowTestHarness }) => ({
  regex: `^(${ROOT_ALIASES.map((alias) =>
    allowTestHarness && alias === '~~' ? '~~(?!/server/testing/)' : alias
  ).join('|')})(/|$)`,
  message: ROOT_IMPORT_MESSAGE
});

const higherLayersPattern = (higherLayers) => ({
  regex: `^#layers/(${higherLayers.join('|')})(/|$)`,
  message: higherLayersMessage(higherLayers)
});

// a relative path only shows its target once resolved against the importing file
const relativeImportsRule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { allowTestHarness: { type: 'boolean' } },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const { allowTestHarness = false } = context.options[0] ?? {};
    const importerPath = relative(ROOT_DIR, context.filename).split(sep);
    if (importerPath[0] !== 'layers') return {};

    const higherLayers = LAYERS.slice(LAYERS.indexOf(importerPath[1]) + 1);

    const check = (source) => {
      if (typeof source?.value !== 'string' || !source.value.startsWith('.'))
        return;

      const targetPath = relative(
        ROOT_DIR,
        resolve(dirname(context.filename), source.value)
      ).split(sep);

      if (targetPath[0] !== 'layers' || targetPath.length < 3) {
        const isTestHarness =
          targetPath[0] === 'server' && targetPath[1] === 'testing';
        if (!(allowTestHarness && isTestHarness))
          context.report({ node: source, message: ROOT_IMPORT_MESSAGE });
        return;
      }

      if (higherLayers.includes(targetPath[1]))
        context.report({
          node: source,
          message: higherLayersMessage(higherLayers)
        });
    };

    return {
      ImportDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source)
    };
  }
};

const layerBoundaries = LAYERS.flatMap((layer, index) => {
  const higherLayers = LAYERS.slice(index + 1);

  const boundaryRule = ({ allowTestHarness }) => ({
    'skuz/relative-imports': ['error', { allowTestHarness }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          rootAliasesPattern({ allowTestHarness }),
          ...(higherLayers.length ? [higherLayersPattern(higherLayers)] : [])
        ]
      }
    ]
  });

  return [
    {
      name: `skuz/layer-boundaries/${layer}`,
      files: [`layers/${layer}/**`],
      rules: boundaryRule({ allowTestHarness: false })
    },
    {
      // tests inside a layer may use the root integration test harness
      name: `skuz/layer-boundaries/${layer}/tests`,
      files: [`layers/${layer}/**/*.test.ts`],
      rules: boundaryRule({ allowTestHarness: true })
    }
  ];
});

export default withNuxt(
  eslintConfigPrettier,
  {
    name: 'skuz/plugin',
    plugins: { skuz: { rules: { 'relative-imports': relativeImportsRule } } }
  },
  ...layerBoundaries
);
