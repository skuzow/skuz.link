import type { NitroRuntimeConfig } from 'nitropack/types';
import { config } from 'dotenv';

let runtimeConfigInstance: NitroRuntimeConfig;

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

if (typeof useRuntimeConfig !== 'undefined') {
  runtimeConfigInstance = useRuntimeConfig();
} else {
  // for cli: pnpm auth:schema
  config();
  runtimeConfigInstance =
    generateRuntimeConfig() as unknown as NitroRuntimeConfig;
}

export const runtimeConfig = runtimeConfigInstance;
