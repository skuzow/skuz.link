<script lang="ts" setup>
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
</script>

<template>
  <NuxtRouteAnnouncer />
  <h1 class="text-5xl font-bold">Hello world</h1>
  <UiButton>Button</UiButton>
</template>
