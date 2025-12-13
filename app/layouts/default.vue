<script lang="ts" setup>
import { Theme, ThemeColor } from '@/constants/theme.constant';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { locale, locales } = useI18n();

const colorMode = useColorMode();

type LocaleCode = (typeof locales.value)[number]['code'];

const ogLocales: Record<LocaleCode, string> = {
  en: 'en_US',
  es: 'es_ES'
};

const ogLocale = computed(() => ogLocales[locale.value as LocaleCode]);

const themeColor = computed(() =>
  colorMode.value === Theme.DARK ? ThemeColor.DARK : ThemeColor.LIGHT
);

if (import.meta.server) {
  useHead({
    link: [
      {
        rel: 'preload',
        href: '/fonts/Geist[wght].woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: ''
      }
    ]
  });
}

useHead({
  htmlAttrs: {
    lang: locale
  }
});

useSeoMeta({
  themeColor: themeColor,
  author: 'Alejandro Porras - skuzow',
  keywords: 'skuz, link, url, shortener',

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
    <NavHeader />
    <main class="mx-auto mb-4 w-full max-w-6xl p-4 md:my-11 md:px-8">
      <slot />
    </main>
    <NavFooter />
  </div>
</template>
