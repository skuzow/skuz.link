# Auth tells Links about deleted Users through a Nitro hook

When a User is deleted, the database cascade removes their Links, but the cached Redirects for their Slugs keep working until they expire. To prevent that, Auth's `beforeDelete` awaits the Nitro hook `auth:user:deleting` with the request event and the User's id. A Links Nitro plugin listens for the hook and purges those Redirects. This keeps Auth from importing Links. Such an import would form a cycle, because Links already depends on Auth for the signed-in User.

## Considered Options

- Auth calls the Links service directly. Rejected: this creates the cycle.
- No purge, relying on cache expiry. Rejected: a deleted User's Short URLs would keep redirecting for up to 60 seconds.

## Consequences

- The integration test server builds an h3 app from the route files rather than a real Nitro app. It therefore has to load each layer's `server/plugins/` itself and provide the hooks that `useNitroApp()` returns.
