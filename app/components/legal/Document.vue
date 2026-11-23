<script lang="ts" setup>
import type { LegalDocumentLocale } from '~/types/legal';
import InfoIcon from '~icons/pixelarticons/circle-info';

interface Props {
  title: string;
  // the date the text takes effect, as YYYY-MM-DD
  updated: string;
  // each locale's compiled Markdown body and its numbered sections
  content: Record<string, LegalDocumentLocale>;
}

const { title, updated, content } = defineProps<Props>();

const { locale } = useI18n();

const indexLabelId = useId();
</script>

<template>
  <!-- left-aligned: the text holds to measure and the rest of the row stays empty.
       From lg the index takes the left column; the markup keeps the title first -->
  <article
    class="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-x-20"
  >
    <header
      class="max-w-measure flex flex-col gap-3 lg:col-start-2 lg:row-start-1"
    >
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

    <!-- from lg the list sticks 88px from the top, under the Header: 84px plus
         the padding, which keeps focus rings unclipped when a window shorter
         than the list makes it scroll inside itself -->
    <nav
      :aria-labelledby="indexLabelId"
      class="mt-8 lg:sticky lg:top-21 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:-mx-1 lg:mt-0 lg:max-h-[calc(100dvh-108px)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:p-1"
    >
      <span
        :id="indexLabelId"
        class="type-eyebrow text-faint-foreground mb-3 block"
      >
        {{ $t('legal.index') }}
      </span>

      <ol class="border-l">
        <li v-for="section in content[locale]?.sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            class="type-small text-muted-foreground hover:text-foreground hover:border-input focus-visible:outline-ring -ml-px flex items-baseline gap-3 border-l border-transparent py-2.5 pl-3 transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-offset-2 lg:py-1.5"
          >
            <span class="type-chip text-faint-foreground min-w-4 flex-none">
              {{ section.number }}
            </span>
            {{ section.title }}
          </a>
        </li>
      </ol>
    </nav>

    <div
      class="max-w-measure prose legal-prose min-w-0 lg:col-start-2 lg:row-start-2"
    >
      <component :is="content[locale]?.body" />
    </div>
  </article>
</template>
