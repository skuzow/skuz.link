import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const currentDir = dirname(fileURLToPath(import.meta.url));

// https://nuxt.com/docs/guide/going-further/layers
export default defineNuxtConfig({
  css: [join(currentDir, './app/assets/css/tailwind.css')],
  vite: {
    plugins: [tailwindcss()]
  },

  modules: ['shadcn-nuxt'],

  shadcn: {
    prefix: 'Ui',
    componentDir: join(currentDir, './app/components/ui')
  },

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
  },

  imports: {
    dirs: ['lib']
  }
});
