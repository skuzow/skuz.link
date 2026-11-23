import Markdown from 'unplugin-vue-markdown/vite';
import type { LegalSection } from './app/types/legal';
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
            // the numbered sections in order, for the "On this page" index.
            // The plugin exports each frontmatter key, so pages import them
            // as `sections` and the index renders on the server
            const sections: LegalSection[] = [];
            state.env.frontmatter = { ...state.env.frontmatter, sections };

            state.tokens.forEach((token, index) => {
              const inline = state.tokens[index + 1];
              if (token.type !== 'heading_open' || !inline) return;

              const id = slugifyHeading(inline.content);
              token.attrSet('id', id);

              // "## 2. What I process" gets its number as a label, "/ 02"
              const number = sectionNumber.exec(inline.content)?.[1];
              const text = inline.children?.[0];
              if (token.tag !== 'h2' || !number || !text) return;

              text.content = text.content.replace(sectionNumber, '');
              const paddedNumber = number.padStart(2, '0');

              // the title as the heading shows it, typographer quotes included
              const title = (inline.children ?? [])
                .map((child) => child.content)
                .join('');
              sections.push({ number: paddedNumber, title, id });

              const label = new state.Token('html_inline', '', 0);
              label.content = `<span><span aria-hidden="true">/</span> ${paddedNumber}</span>`;
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
