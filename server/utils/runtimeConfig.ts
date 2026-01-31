import type { NitroRuntimeConfig } from 'nitropack/types';
import { config } from 'dotenv';

let runtimeConfigInstance: NitroRuntimeConfig;

export const generateRuntimeConfig = () => ({
  public: {
    baseUrl: process.env.NUXT_APP_URL as string
  },
  database: {
    url: process.env.NUXT_DATABASE_URL as string
  },
  betterAuth: {
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

if (typeof useRuntimeConfig !== 'undefined') {
  runtimeConfigInstance = useRuntimeConfig();
} else {
  // for cli: pnpm auth:schema
  config();
  runtimeConfigInstance =
    generateRuntimeConfig() as unknown as NitroRuntimeConfig;
}

export const runtimeConfig = runtimeConfigInstance;
