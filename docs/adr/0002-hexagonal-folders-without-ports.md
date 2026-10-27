# Hexagonal folders without ports

Inside each context's `server/`, route files and middleware act as the controllers. `application/` holds the services (use cases), and `infrastructure/` holds the adapters: the D1 repository, the Workers cache and the drizzle tables. Domain rules live in the layer's `shared/domain/`, so the front can reuse them. Services receive the concrete adapters through their constructor, so there are no port interfaces and no in-memory adapters. Every port would have exactly one production adapter, and the server tests already run against a real local D1 and Workers cache (Miniflare). Interfaces and fakes would add files and a second copy of D1's behaviour without catching anything new.

Add a port when a second real adapter appears, not before.

## Consequences

- The D1 binding comes from the request, so `container.ts` in each context builds its services per request (`useLinkService(event)`) rather than once at startup.
