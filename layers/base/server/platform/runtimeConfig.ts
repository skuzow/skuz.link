import type { NitroRuntimeConfig } from 'nitropack/types';

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

export const runtimeConfig = generateRuntimeConfig() as NitroRuntimeConfig;
