import type { EventHandlerRequest, H3Event } from 'h3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export const getDB = (
  event?: H3Event<EventHandlerRequest>,
  dbSchema?: typeof schema
) => {
  return drizzle(event?.context.cloudflare.env.db ?? {}, { schema: dbSchema });
};

export const useDB = async (
  event: H3Event<EventHandlerRequest>
): Promise<DrizzleD1Database<typeof schema>> => {
  if (event.context.db) return event.context.db;

  const dbInstance = getDB(event, schema);
  event.context.db = dbInstance;

  return dbInstance;
};
