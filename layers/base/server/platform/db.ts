import type { EventHandlerRequest, H3Event } from 'h3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
// declares globalThis.__env__
import type {} from '../types/bindings';

// each context owns its tables, so the client is not bound to one schema
export type Database = DrizzleD1Database<Record<string, unknown>>;

export const getDB = (event?: H3Event<EventHandlerRequest>): Database => {
  // the internal fetch that renders Nuxt's error page on the Worker carries
  // no Cloudflare context, so fall back to the bindings Nitro keeps globally
  const d1 = (event?.context.cloudflare?.env ?? globalThis.__env__)?.db;

  return drizzle((d1 ?? {}) as Parameters<typeof drizzle>[0]);
};

export const useDB = async (
  event: H3Event<EventHandlerRequest>
): Promise<Database> => {
  if (event.context.db) return event.context.db;

  const dbInstance = getDB(event);
  event.context.db = dbInstance;

  return dbInstance;
};
