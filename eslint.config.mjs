import withNuxt from './.nuxt/eslint.config.mjs';

import eslintConfigPrettier from 'eslint-config-prettier/flat';

// lowest first: each layer may import only the layers before it (ADR-0001)
const LAYERS = ['base', 'auth', 'links'];

// these resolve to the root app, not to the layer
const ROOT_ALIASES = ['~', '@', '~~', '@@', '#shared', '#server'];

const rootAliasesPattern = ({ allowTestHarness }) => ({
  regex: `^(${ROOT_ALIASES.map((alias) =>
    allowTestHarness && alias === '~~' ? '~~(?!/server/testing/)' : alias
  ).join('|')})(/|$)`,
  message:
    'Layers cannot import the root app; import from your own layer or a lower one through #layers/<name> (ADR-0001).'
});

const higherLayersPattern = (higherLayers) => ({
  // the relative form catches imports that climb out of the layer folder
  regex: `^(#layers/|(\\.\\./)+)(${higherLayers.join('|')})(/|$)`,
  message: `Dependencies point root → links → auth → base, so this layer cannot import ${higherLayers.join(' or ')} (ADR-0001).`
});

const layerBoundaries = LAYERS.flatMap((layer, index) => {
  const higherLayers = LAYERS.slice(index + 1);

  const boundaryRule = ({ allowTestHarness }) => ({
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

export default withNuxt(eslintConfigPrettier, ...layerBoundaries);
