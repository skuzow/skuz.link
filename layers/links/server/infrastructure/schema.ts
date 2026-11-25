import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
// relative import: drizzle-kit loads the schema without Nuxt's #layers aliases
import { user } from '../../../auth/server/infrastructure/schema';

export const links = sqliteTable(
  'links',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    redirectUrl: text('redirect_url').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    clicks: integer('clicks').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index('links_userId_idx').on(table.userId)]
);

// a Click keeps no IP address and no full user agent (ADR-0007)
export const clicks = sqliteTable(
  'clicks',
  {
    id: integer('id').primaryKey(),
    linkId: text('link_id')
      .notNull()
      .references(() => links.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    country: text('country'),
    region: text('region'),
    city: text('city'),
    referrer: text('referrer'),
    browser: text('browser'),
    os: text('os'),
    device: text('device'),
    bot: integer('bot', { mode: 'boolean' }).notNull().default(false),
    botName: text('bot_name')
  },
  (table) => [
    // the ranges and the cursor, newest first
    index('clicks_linkId_createdAt_id_idx').on(
      table.linkId,
      table.createdAt,
      table.id
    ),
    // the purge of Clicks older than 12 months
    index('clicks_createdAt_idx').on(table.createdAt)
  ]
);
