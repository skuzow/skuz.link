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
  <article class="mx-auto max-w-prose">
    <header class="mb-10 space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        {{ title }}
      </h1>

      <i18n-t keypath="legal.updated" tag="p" class="text-muted-foreground">
        <template #date>
          <!-- UTC, or a reader west of it would see the day before -->
          <time :datetime="updated">
            {{ $d(new Date(updated), { dateStyle: 'long', timeZone: 'UTC' }) }}
          </time>
        </template>
      </i18n-t>

      <!-- the Spanish text prevails, so every other language says so -->
      <p v-if="locale !== 'es'" class="text-muted-foreground text-sm">
        {{ $t('legal.translation') }}
      </p>
    </header>

    <div class="prose prose-neutral dark:prose-invert">
      <component :is="bodies[locale]" />
    </div>
  </article>
</template>
