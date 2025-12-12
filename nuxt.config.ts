import tailwindcss from '@tailwindcss/vite';
import locales from './i18n/locales';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  },

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
    'nitro-cloudflare-dev'
  ],

  i18n: {
    defaultLocale: 'en',
    locales
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
});
