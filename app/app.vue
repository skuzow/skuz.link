<script setup lang="ts">
import 'vue-sonner/style.css';
</script>

<template>
  <LazyAlertProvider />
  <UiToaster />

  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
