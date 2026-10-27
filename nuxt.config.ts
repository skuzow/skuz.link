import { generateRuntimeConfig } from './layers/base/server/platform/runtimeConfig';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nitro-cloudflare-dev'
  ],

  i18n: {
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en-US.json'
      },
      {
        code: 'es',
        name: 'Español',
        file: 'es-ES.json'
      }
    ]
  },

  site: {
    indexable: false // TODO: remove when ready to launch,
    // url: 'https://skuz.link',
    // name: 'skuz.link'
  },
  robots: {
    disallow: ['/links']
  },

  runtimeConfig: generateRuntimeConfig(),

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
});
