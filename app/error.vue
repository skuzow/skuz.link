<script lang="ts" setup>
import 'vue-sonner/style.css';

import type { NuxtError } from '#app';
import HomeIcon from '~icons/pixelarticons/home';

const { error } = defineProps<{ error: NuxtError }>();

const { t: $t } = useI18n();
const route = useRoute();

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
  <NuxtLayout hide-field>
    <!-- the extra top padding below md balances the layout's bottom margin on main -->
    <section
      class="flex h-full min-h-130 flex-col items-center justify-center gap-6 px-4 pt-12 pb-8 text-center md:pt-8"
    >
      <p class="type-status text-muted-foreground">
        {{ error.status }}
      </p>

      <LinksShortUrlPlate
        v-if="variant === 'notFound'"
        :slug="route.path.slice(1)"
        failed
      />

      <div class="flex flex-col items-center gap-2">
        <h1 class="type-display-sm">
          {{ $t(`error.${variant}.title`) }}
        </h1>

        <p class="type-lead text-muted-foreground max-w-md">
          {{ $t(`error.${variant}.description`) }}
        </p>
      </div>

      <UiButton as-child size="lg">
        <NuxtLinkLocale to="/">
          <HomeIcon />
          {{ $t('error.home') }}
        </NuxtLinkLocale>
      </UiButton>
    </section>
  </NuxtLayout>
</template>
