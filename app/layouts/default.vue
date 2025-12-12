<script lang="ts" setup>
import { Theme, ThemeColor } from '@/constants/theme.constant';

const colorMode = useColorMode();

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

useSeoMeta({
  themeColor: themeColor,
  author: 'Alejandro Porras - skuzow',
  keywords: 'skuz, link, url, shortener',

  twitterCard: 'summary_large_image',
  twitterSite: '@skuzow',
  twitterCreator: '@skuzow',

  ogType: 'website',
  ogImageType: 'image/png',
  ogImageWidth: '1200',
  ogImageHeight: '630'
});
</script>

<template>
  <div class="relative grid min-h-dvh grid-rows-[auto_1fr_auto] gap-2">
    <!-- <NavHeader /> -->
    <main class="container mb-4 max-w-6xl py-4 md:my-11 md:px-8">
      <slot />
    </main>
    <!-- <NavFooter /> -->
  </div>
</template>
