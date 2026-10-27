import type { AuthSession } from '../current-user';

declare module 'h3' {
  interface H3EventContext {
    // lazy and memoized per request: only the requests that need the
    // Session look it up, and they look it up once
    getAuthSession: () => Promise<AuthSession>;
    authSessionLookup?: Promise<AuthSession>;
  }
}
