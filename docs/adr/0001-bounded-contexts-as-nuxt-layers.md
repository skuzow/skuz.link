# Bounded contexts are full-stack Nuxt layers

The code is split into two bounded contexts, Auth and Links. Each is a Nuxt layer (`layers/auth`, `layers/links`) that owns its own `app/`, `server/` and `shared/` code, drizzle tables and translations. Both sit on `layers/base`, which holds the design system and the server platform code (D1 client, background tasks, runtime config). The root project is only the composition shell: layout, nav, landing page and app config. We chose full-stack layers so that everything about a context lives in one folder, and its dependencies show up at that folder's boundary.

## Considered Options

- Front-only layers, with the API in a separate `server/contexts/` tree. Rejected: every context would live in two places.
- A third Redirects context. Rejected: redirecting shares the Link model, the Slug rules and the cache purge with Link management, so splitting it out would add a cross-context call to every write.

## Consequences

- Dependencies point one way: `root → links → auth → base`. An ESLint `no-restricted-imports` rule enforces this for explicit imports. The same rule bans `@/` and `~/` inside layers, because those aliases resolve to the root app, not to the layer; it bans the other root aliases (`~~/`, `@@/`, `#shared`, `#server`) too. Test files inside a layer may still import the root integration test harness from `~~/server/testing/`. Auto-imported components and composables can still cross layers without an import, so code review has to catch those.
- All contexts share one D1 database, and D1 has a single `migrations_dir`. Migrations therefore stay in the root `server/database/migrations/`, while each context defines its own tables. Links may reference Auth's `user` table, but Auth never references Links.
- Auth's front reads where to send a signed-in User from `app.config` (`auth.signedInRoute`). Root sets that value, so Auth never has to import a Links route.
- Nitro runs server middleware in layer order: root first, then layers in reverse alphabetical order. No middleware may rely on running before middleware from another layer.
