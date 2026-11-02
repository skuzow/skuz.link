<script lang="ts" setup>
import ZapIcon from '~icons/pixelarticons/zap';

import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';

const { isAuthenticated } = useAuth();
</script>

<template>
  <SharedFadeIn as-child>
    <section
      class="flex h-11/12 flex-col items-center justify-center gap-y-6 text-center"
    >
      <IconLogo :size="48" />

      <div class="space-y-3">
        <h1
          class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          {{ $t('landing.headline.first') }}
          <br />
          {{ $t('landing.headline.second') }}
        </h1>

        <p class="text-muted-foreground mx-auto max-w-md text-lg">
          {{ $t('landing.subline') }}
        </p>
      </div>

      <UiButton as-child>
        <NuxtLinkLocale :to="isAuthenticated ? LINKS_ROUTE : '/login'">
          {{ $t('landing.cta') }}
          <ZapIcon />
        </NuxtLinkLocale>
      </UiButton>
    </section>
  </SharedFadeIn>
</template>
