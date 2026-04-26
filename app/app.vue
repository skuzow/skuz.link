<script setup lang="ts">
import 'vue-sonner/style.css';
</script>

<template>
  <LazyAuthSettings />
  <LazyAlertProvider />
  <UiToaster />

  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
