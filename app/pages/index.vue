<script lang="ts" setup>
import { RocketIcon } from 'lucide-vue-next';

seoMeta();
</script>

<template>
  <SharedFadeIn as-child>
    <section
      class="flex h-full -translate-y-4 flex-col items-center justify-center gap-y-6 text-center 2xl:-translate-y-16"
    >
      <NavLogo :size="48" />

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
        <NuxtLinkLocale to="/login">
          {{ $t('landing.cta') }}
          <RocketIcon :size="16" />
        </NuxtLinkLocale>
      </UiButton>
    </section>
  </SharedFadeIn>
</template>
