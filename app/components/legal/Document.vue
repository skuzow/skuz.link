<script lang="ts" setup>
import type { Component } from 'vue';
import InfoIcon from '~icons/pixelarticons/circle-info';

interface Props {
  title: string;
  // the date the text takes effect, as YYYY-MM-DD
  updated: string;
  // the compiled Markdown body of each locale
  bodies: Record<string, Component>;
}

const { title, updated, bodies } = defineProps<Props>();

const { locale } = useI18n();
</script>

<template>
  <!-- left-aligned: the text holds to measure and the rest of the row stays empty -->
  <article class="grid grid-cols-[minmax(0,1fr)]">
    <header class="max-w-measure flex flex-col gap-3">
      <h1 class="type-display-sm text-balance">
        {{ title }}
      </h1>

      <i18n-t
        keypath="legal.updated"
        tag="p"
        class="type-chip text-faint-foreground"
      >
        <template #date>
          <!-- UTC, or a reader west of it would see the day before -->
          <time :datetime="updated">
            {{ $d(new Date(updated), { dateStyle: 'long', timeZone: 'UTC' }) }}
          </time>
        </template>
      </i18n-t>

      <!-- the Spanish text prevails, so every other language says so -->
      <p
        v-if="locale !== 'es'"
        class="bg-card type-small text-muted-foreground mt-3 flex items-start gap-2 border px-4 py-3"
      >
        <InfoIcon
          class="text-faint-foreground mt-0.5 shrink-0"
          aria-hidden="true"
        />
        {{ $t('legal.translation') }}
      </p>
    </header>

    <div class="max-w-measure prose legal-prose min-w-0">
      <component :is="bodies[locale]" />
    </div>
  </article>
</template>
