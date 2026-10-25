# Testing

Tests sit next to their source, in root or inside a layer (`layers/<name>/`). The folder and file name pick the Vitest project in `vitest.config.ts`, and each glob covers root and every layer:

- `*.test.ts` in `shared/` or `app/` runs in `unit`: plain node.
- `*.test.ts` in `server/` runs in `server`. An unimport plugin replays Nitro's auto-imports (h3, root `server/utils`, and `useNitroApp` and `defineNitroPlugin` from the test Nitro app in `server/testing/nitro.ts`) so handlers and plugins load unchanged; when server code starts using another auto-import source (e.g. `useRuntimeConfig`), add it to that plugin.
- `*.nuxt.test.ts` in `app/` runs in `nuxt` (`@nuxt/test-utils`, happy-dom). Mock API calls with `registerEndpoint`.

For example, the background-task test lives in `layers/base/server/platform/` and runs in `server`. Both node projects alias `#layers/<name>` the way Nuxt does, so layer code and its tests import other layers through that alias.

## Server integration tests

Start the file with `const server = await setupTestServer()` from root `server/testing/server.ts`; tests inside a layer import it from there too. It runs the real Nitro plugins and serves the real middleware and API routes of root and every layer, in Nitro's order: root first, then layers in reverse alphabetical order. The plugins register their hooks on the test Nitro app, so a hook that server code calls through `useNitroApp()`, like `auth:user:deleting`, reaches them. They run on a fresh Miniflare D1 and Workers cache, and `server.login()` returns a real better-auth session. Click counts and cache writes run through `waitUntil`, so `await server.flush()` before asserting on them.

## Helpers

Test helpers live in root `server/testing/` and in the `app/testing/` folder of root or a layer, like the Link fixture in `layers/links/app/testing/`. Nitro auto-imports every export in `server/utils/` into the worker bundle, so that folder holds production code and its tests, which export nothing. Layers have no `server/utils/` folder, because Nitro would auto-import it too (ADR-0004): base platform code lives in `layers/base/server/platform/` and is imported explicitly.
