import type { AnyD1Database } from 'drizzle-orm/d1';

declare global {
  // Nitro's Cloudflare entry keeps the Worker's bindings here on every request
  var __env__: { db: AnyD1Database } | undefined;
}
