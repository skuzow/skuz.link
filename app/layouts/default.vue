<script lang="ts" setup>
import { Theme, ThemeColor } from '@/constants/theme.constant';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { locale, locales } = useI18n();
const colorMode = useColorMode();
const route = useRoute();
const localePath = useLocalePath();

type LocaleCode = (typeof locales.value)[number]['code'];

const ogLocales: Record<LocaleCode, string> = {
  en: 'en_US',
  es: 'es_ES'
};

const ogLocale = computed(() => ogLocales[locale.value as LocaleCode]);
// the server can't see a first visit's system theme, so it renders the fallback
const themeColor = computed(() =>
  colorMode.value === Theme.LIGHT ? ThemeColor.LIGHT : ThemeColor.DARK
);
const isLanding = computed(() => route.path === localePath('/'));

if (import.meta.server) {
  useHead({
    // Pixel labels sit on Buttons above the fold, and Geist Mono loads when needed
    link: ['/fonts/Geist-Variable.woff2', '/fonts/GeistPixel-Square.woff2'].map(
      (href) => ({
        rel: 'preload',
        href,
        as: 'font',
        type: 'font/woff2',
        crossorigin: ''
      })
    )
  });
}

useHead({
  htmlAttrs: {
    lang: locale
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    },
    {
      rel: 'mask-icon',
      href: '/favicon.svg',
      color: '#FFFFFF'
    },

    {
      rel: 'sitemap',
      href: '/sitemap.xml'
    }
  ]
});

useSeoMeta({
  themeColor: themeColor,
  author: 'Alejandro Porras - skuzow',

  twitterCard: 'summary_large_image',
  twitterSite: '@skuzow',
  twitterCreator: '@skuzow',

  ogLocale: ogLocale,
  ogType: 'website',
  ogImageType: 'image/png',
  ogImageWidth: '1200',
  ogImageHeight: '630'
});
</script>

<template>
  <div class="relative grid min-h-dvh grid-rows-[auto_1fr_auto] gap-2">
    <LandingGridBackground v-if="isLanding" />

    <NavHeader :is-landing="isLanding" />
    <main class="mx-auto mb-4 w-full max-w-6xl p-4 md:my-11 md:px-8">
      <slot />
    </main>
    <NavFooter />
  </div>
</template>
