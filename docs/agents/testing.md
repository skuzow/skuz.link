# Testing

Tests sit next to their source, and the file name picks the Vitest project in `vitest.config.ts`:

- `*.test.ts` in `shared/` or `app/` runs in `unit`: plain node.
- `*.test.ts` in `server/` runs in `server`. An unimport plugin replays Nitro's auto-imports (h3 and `server/utils`) so handlers load unchanged; when server code starts using another auto-import source (e.g. `useRuntimeConfig`), add it to that plugin.
- `*.nuxt.test.ts` in `app/` runs in `nuxt` (`@nuxt/test-utils`, happy-dom). Mock API calls with `registerEndpoint`.

## Server integration tests

Start the file with `const server = await setupTestServer()` from `server/testing/server.ts`. It serves the real middleware and API routes from a fresh Miniflare D1 and Workers cache, and `server.login()` returns a real better-auth session. Click counts and cache writes run through `waitUntil`, so `await server.flush()` before asserting on them.

## Helpers

Test helpers live in `server/testing/` and `app/testing/`. Nitro auto-imports every export in `server/utils/` into the worker bundle, so that folder holds production code and its tests, which export nothing.
