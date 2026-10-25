// https://nuxt.com/docs/guide/going-further/layers
export default defineNuxtConfig({
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en-US.json'
      },
      {
        code: 'es',
        file: 'es-ES.json'
      }
    ]
  }
});
