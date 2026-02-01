import type { EventHandlerRequest, H3Event } from 'h3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';
import { runtimeConfig } from './runtimeConfig';

export const getDB = (
  event?: H3Event<EventHandlerRequest>,
  dbSchema?: typeof schema
) => {
  // for cli
  if (!event) return drizzle(runtimeConfig.database.url, { schema: dbSchema });

  return drizzle(event.context.cloudflare.env.db, { schema: dbSchema });
};

export const useDB = async (
  event: H3Event<EventHandlerRequest>
): Promise<LibSQLDatabase<typeof schema>> => {
  if (event && event.context.db) return event.context.db;

  const dbInstance = getDB(event, schema);

  if (event) event.context.db = dbInstance;

  return dbInstance;
};
