import type { NitroRuntimeConfig } from 'nitropack/types';
import { config } from 'dotenv';

export const generateRuntimeConfig = () => ({
  betterAuth: {
    url: process.env.NUXT_BETTER_AUTH_URL as string,
    secret: process.env.NUXT_BETTER_AUTH_SECRET as string
  },
  google: {
    clientId: process.env.NUXT_GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET as string
  },
  github: {
    clientId: process.env.NUXT_GITHUB_CLIENT_ID as string,
    clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET as string
  }
});

// for cli: pnpm auth:schema
if (!process.env.NUXT_BETTER_AUTH_SECRET) config();

export const runtimeConfig = generateRuntimeConfig() as NitroRuntimeConfig;
