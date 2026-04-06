import type { EventHandlerRequest, H3Event } from 'h3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import * as schema from '../database/schema';
import { runtimeConfig } from './runtimeConfig';

export const getDB = (
  event?: H3Event<EventHandlerRequest>,
  dbSchema?: typeof schema
) => {
  // for cli
  if (!event)
    return drizzleLibsql(runtimeConfig.database.url, { schema: dbSchema });

  return drizzleD1(event.context.cloudflare.env.db, { schema: dbSchema });
};

export const useDB = async (
  event: H3Event<EventHandlerRequest>
): Promise<DrizzleD1Database<typeof schema>> => {
  if (event.context.db) return event.context.db;

  const dbInstance = getDB(event, schema);
  event.context.db = dbInstance;

  return dbInstance;
};
