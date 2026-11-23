<script lang="ts" setup>
import type { LegalDocumentLocale } from '~/types/legal';
import ChevronRightIcon from '~icons/pixelarticons/chevron-right';
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

const route = useRoute();
const localePath = useLocalePath();

const indexLabelId = useId();

const sections = computed(() => content[locale.value]?.sections ?? []);
const { litId, jumpTo } = useLitSection(() =>
  sections.value.map((section) => section.id)
);

// in the footer's order
const documents = computed(() =>
  [
    { to: '/legal-notice', title: 'legal.legalNotice.title' },
    { to: '/privacy', title: 'legal.privacy.title' },
    { to: '/terms', title: 'legal.terms.title' }
  ].map(({ to, title }) => ({
    to,
    title,
    current: route.path === localePath(to)
  }))
);
</script>

<template>
  <nav :aria-label="$t('legal.documents')" class="mb-12">
    <!-- below 360px "PRIVACIDAD" is wider than a third of the screen, so the
         links stack; from sm the row is only as wide as its labels -->
    <ul
      class="grid grid-cols-3 border max-[360px]:grid-cols-1 sm:inline-grid sm:grid-cols-[repeat(3,auto)]"
    >
      <li
        v-for="document in documents"
        :key="document.to"
        class="flex not-first:border-l max-[360px]:not-first:border-t max-[360px]:not-first:border-l-0"
      >
        <NuxtLinkLocale
          :to="document.to"
          :aria-current="document.current ? 'page' : undefined"
          :class="[
            'type-chip focus-visible:outline-ring flex min-h-11 flex-1 items-center justify-center gap-2 px-3 py-2 text-center leading-3.5 transition-colors duration-120 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-2 max-[360px]:justify-start max-[360px]:text-left sm:px-4',
            document.current
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          ]"
        >
          <!-- the lit LED glows in dark only, like every LED -->
          <span
            aria-hidden="true"
            :class="[
              'led',
              document.current
                ? 'text-signal'
                : 'text-border-strong shadow-none!'
            ]"
          />
          {{ $t(document.title) }}
        </NuxtLinkLocale>
      </li>
    </ul>
  </nav>

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
      <!-- names the nav at every width, but shows only from lg -->
      <span
        :id="indexLabelId"
        class="type-eyebrow text-faint-foreground mb-3 hidden lg:block"
      >
        {{ $t('legal.index') }}
      </span>

      <!-- below lg the index folds into this row. The disclosure holds only its
           summary, and the sibling rule shows the list after it while open, so
           it works before hydration with no ::details-content support; it
           starts closed and remembers nothing. From lg it hides and the list
           shows whatever state it was left in -->
      <details class="peer lg:hidden">
        <summary
          class="text-muted-foreground hover:text-foreground focus-visible:outline-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-y transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
        >
          <span class="type-eyebrow text-faint-foreground">
            {{ $t('legal.index') }}
          </span>
          <ChevronRightIcon
            class="size-4 shrink-0 transition-transform duration-100 in-open:rotate-90"
            aria-hidden="true"
          />
        </summary>
      </details>

      <ol
        class="hidden border-l max-lg:peer-open:mt-3 max-lg:peer-open:block lg:block"
      >
        <!-- the section being read is current: it wins over hover -->
        <li v-for="section in sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            :aria-current="litId === section.id ? 'true' : undefined"
            :class="[
              'type-small focus-visible:outline-ring -ml-px flex items-baseline gap-3 border-l py-2.5 pl-3 transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-offset-2 lg:py-1.5',
              litId === section.id
                ? 'text-foreground border-signal'
                : 'text-muted-foreground hover:text-foreground hover:border-input border-transparent'
            ]"
            @click.exact="jumpTo(section.id)"
          >
            <span
              :class="[
                'type-chip min-w-4 flex-none transition-colors duration-120',
                litId === section.id ? 'text-signal' : 'text-faint-foreground'
              ]"
            >
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
