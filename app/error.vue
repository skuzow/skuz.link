<script lang="ts" setup>
import 'vue-sonner/style.css';

import type { NuxtError } from '#app';

const { error } = defineProps<{ error: NuxtError }>();

const { t: $t } = useI18n();

const variant = computed(() => (error.status === 404 ? 'notFound' : 'generic'));

seoMeta({
  title: $t(`error.${variant.value}.title`),
  description: $t(`error.${variant.value}.description`)
});
</script>

<template>
  <!-- Nuxt renders this page instead of app.vue, so it mounts the same global pieces -->
  <LazyAuthSettings />
  <LazyAlertProvider />
  <UiToaster />

  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <section
      class="flex h-11/12 flex-col items-center justify-center gap-y-6 text-center"
    >
      <p
        class="text-muted-foreground text-7xl font-semibold tracking-tight sm:text-8xl"
      >
        {{ error.status }}
      </p>

      <div class="space-y-3">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          {{ $t(`error.${variant}.title`) }}
        </h1>

        <p class="text-muted-foreground mx-auto max-w-md text-lg">
          {{ $t(`error.${variant}.description`) }}
        </p>
      </div>

      <UiButton as-child>
        <NuxtLinkLocale to="/">
          {{ $t('error.home') }}
        </NuxtLinkLocale>
      </UiButton>
    </section>
  </NuxtLayout>
</template>
