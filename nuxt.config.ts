import Markdown from 'unplugin-vue-markdown/vite';
import { generateRuntimeConfig } from './layers/base/server/platform/runtimeConfig';

const sectionNumber = /^(\d+)\.\s*/;

// "## 1. Quién gestiona skuz.link" gets the id "quien-gestiona-skuz-link":
// no section number, so links survive renumbering, and no accents to escape
const slugifyHeading = (heading: string) =>
  heading
    .replace(sectionNumber, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-23',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nitro-cloudflare-dev'
  ],

  colorMode: {
    fallback: 'dark'
  },

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

  // the legal texts compile from Markdown at build time, so no parser ships
  vite: {
    vue: {
      include: [/\.vue$/, /\.md$/]
    },
    plugins: [
      Markdown({
        wrapperDiv: false,
        markdownItSetup: (md) => {
          // anchor ids, so a single section can be linked
          md.core.ruler.push('heading_ids', (state) => {
            state.tokens.forEach((token, index) => {
              const inline = state.tokens[index + 1];
              if (token.type !== 'heading_open' || !inline) return;

              token.attrSet('id', slugifyHeading(inline.content));

              // "## 2. What I process" gets its number as a label, "/ 02"
              const number = sectionNumber.exec(inline.content)?.[1];
              const text = inline.children?.[0];
              if (token.tag !== 'h2' || !number || !text) return;

              text.content = text.content.replace(sectionNumber, '');

              const label = new state.Token('html_inline', '', 0);
              label.content = `<span><span aria-hidden="true">/</span> ${number.padStart(2, '0')}</span>`;
              inline.children?.unshift(label);
            });
          });
        }
      })
    ]
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
});
