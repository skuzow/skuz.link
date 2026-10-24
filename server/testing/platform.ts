import { readdirSync, readFileSync } from 'node:fs';
import type { AnyD1Database } from 'drizzle-orm/d1';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const MIGRATIONS_DIR = new URL('../database/migrations/', import.meta.url);
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';

const readMigrations = () =>
  readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => readFileSync(new URL(file, MIGRATIONS_DIR), 'utf8'));

// wrangler's getPlatformProxy stubs caches as a no-op, so use Miniflare
// directly to get a real local D1 and Workers cache
export const createTestPlatform = async () => {
  const miniflare = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: 'export default {}',
      d1Databases: ['db']
    })
  );

  const db = (await miniflare.getD1Database('db')) as unknown as AnyD1Database;
  const caches = await miniflare.getCaches();

  for (const migration of readMigrations()) {
    const statements = migration
      .split(STATEMENT_BREAKPOINT)
      .map((statement) => statement.trim())
      .filter(Boolean);

    await db.batch(statements.map((statement) => db.prepare(statement)));
  }

  return {
    env: { db },
    caches,
    dispose: () => miniflare.dispose()
  };
};
