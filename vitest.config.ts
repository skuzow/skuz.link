import { fileURLToPath } from 'node:url';
import { defineVitestProject } from '@nuxt/test-utils/config';
import * as h3 from 'h3';
import Unimport from 'unimport/unplugin';
import { configDefaults, defineConfig } from 'vitest/config';

const resolvePath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

const projectAliases = [
  // mirrors the #layers/<name> aliases Nuxt creates for every layer
  { find: /^#layers\/([\w-]+)/, replacement: `${resolvePath('./layers')}/$1` }
];

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: projectAliases
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            '{app,shared}/**/*.test.ts',
            'layers/*/{app,shared}/**/*.test.ts'
          ],
          exclude: [...configDefaults.exclude, '**/*.nuxt.test.ts']
        }
      },
      {
        resolve: {
          alias: [
            ...projectAliases,
            { find: '~~', replacement: resolvePath('.') }
          ]
        },
        plugins: [
          // replays Nitro auto-imports so server files load unchanged
          Unimport.vite({
            imports: [
              ...Object.keys(h3).map((name) => ({ name, from: 'h3' })),
              ...['useNitroApp', 'defineNitroPlugin'].map((name) => ({
                name,
                from: resolvePath('./server/testing/nitro.ts')
              }))
            ],
            include: [/[\\/]server[\\/].+\.ts$/],
            dts: false
          })
        ],
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.ts', 'layers/*/server/**/*.test.ts'],
          env: {
            NUXT_BETTER_AUTH_URL: 'http://localhost:3000',
            NUXT_BETTER_AUTH_SECRET: 'skuz-link-test-secret-0123456789abcdef',
            NUXT_GOOGLE_CLIENT_ID: 'test-google-client-id',
            NUXT_GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
            NUXT_GITHUB_CLIENT_ID: 'test-github-client-id',
            NUXT_GITHUB_CLIENT_SECRET: 'test-github-client-secret',
            WRANGLER_SEND_METRICS: 'false'
          },
          // local D1 and cache run in a workerd process per test file
          testTimeout: 30_000,
          hookTimeout: 60_000
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['app/**/*.nuxt.test.ts', 'layers/*/app/**/*.nuxt.test.ts']
        }
      })
    ]
  }
});
