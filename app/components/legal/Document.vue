<script lang="ts" setup>
import type { Component } from 'vue';

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
  <article class="max-w-measure mx-auto">
    <header class="mb-8 flex flex-col gap-3">
      <h1 class="type-display-sm">
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
      <p v-if="locale !== 'es'" class="type-small text-muted-foreground">
        {{ $t('legal.translation') }}
      </p>
    </header>

    <div class="prose legal-prose">
      <component :is="bodies[locale]" />
    </div>
  </article>
</template>
