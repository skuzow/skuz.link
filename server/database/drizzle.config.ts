import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  // every layer defines its own tables; D1 has one migrations folder
  schema: './layers/*/server/infrastructure/schema.ts',
  out: './server/database/migrations',
  driver: 'd1-http',

  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID as string,
    token: process.env.DRIZZLE_API_TOKEN as string
  }
});
