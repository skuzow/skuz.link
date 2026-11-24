<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';
import { UNKNOWN_COUNTRY } from '#layers/links/shared/domain/click.country';
import { countryName } from '#layers/links/app/lib/country';
import ChevronDownIcon from '~icons/pixelarticons/chevron-down';
import CloseIcon from '~icons/pixelarticons/close';

const props = defineProps<{
  clicks: Click[];
  // the Clicks in the range, or the picked country's, of which these are
  // the first
  total: number;
  // the country these Clicks are filtered to, if any
  country?: string;
  // whether another page follows the Clicks shown
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}>();

defineEmits<{ clearCountry: []; loadMore: [] }>();

const { t, locale } = useI18n();

const name = (country: string) =>
  country === UNKNOWN_COUNTRY
    ? t('links.statistics.clicks.unknown')
    : countryName(country, locale.value);

const countryLabel = computed(() =>
  props.country ? name(props.country) : null
);

// empty on load, so a screen reader hears only the changes
const announcement = shallowRef('');

watch(countryLabel, (label) => {
  announcement.value = label
    ? t('links.statistics.clicks.filter.showing', { country: label })
    : t('links.statistics.clicks.filter.showingAll');
});

const HEADER_CLASS =
  'type-chip text-faint-foreground border-border-strong border-b px-3 py-2.5 text-left leading-4 first:pl-4 last:pr-4';
</script>

<template>
  <UiCard>
    <UiCardHeader class="flex-wrap gap-y-1.5 py-1.5">
      <span class="led text-signal" />
      <h2 class="type-eyebrow text-faint-foreground">
        {{ $t('links.statistics.clicks.title') }}
      </h2>
      <button
        v-if="countryLabel"
        type="button"
        :aria-label="
          $t('links.statistics.clicks.filter.clear', { country: countryLabel })
        "
        class="border-signal bg-signal-wash text-signal hover:bg-signal hover:text-background focus-visible:outline-ring type-chip inline-flex h-[22px] max-w-full min-w-0 cursor-pointer items-center gap-1.5 border pr-1 pl-[7px] leading-[11px] whitespace-nowrap transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="$emit('clearCountry')"
      >
        <span class="truncate">{{ countryLabel }}</span>
        <CloseIcon aria-hidden="true" class="size-3 shrink-0" />
      </button>
      <span
        v-if="!loading && clicks.length"
        class="type-chip text-muted-foreground ml-auto whitespace-nowrap"
      >
        {{
          $t('links.statistics.clicks.shown', {
            shown: $n(clicks.length),
            total: $n(total)
          })
        }}
      </span>
    </UiCardHeader>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>

    <p
      v-if="!loading && !clicks.length"
      class="type-chip text-faint-foreground px-4 py-5 leading-4"
    >
      {{ $t('links.statistics.clicks.empty') }}
    </p>

    <!-- below md each Click stacks, and the head stays for screen readers only -->
    <table
      v-else
      :aria-busy="loading"
      class="w-full table-fixed border-collapse text-sm/[21px] max-md:block"
    >
      <colgroup>
        <col class="md:w-44" />
        <col />
        <col class="md:w-[22%]" />
        <col class="md:w-[30%]" />
      </colgroup>
      <thead class="max-md:sr-only">
        <tr>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.time') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.where') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.from') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.client') }}
          </th>
        </tr>
      </thead>
      <tbody class="max-md:block">
        <template v-if="loading">
          <tr
            v-for="index in 4"
            :key="index"
            class="border-b last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-4 max-md:py-3"
          >
            <td
              v-for="cell in 4"
              :key="cell"
              class="px-3 py-2.5 first:pl-4 last:pr-4 max-md:block max-md:p-0 max-md:not-first:min-w-0 max-md:not-first:flex-1 max-md:first:w-32 max-md:first:flex-none"
            >
              <UiSkeleton class="h-3 w-[70%]" />
            </td>
          </tr>
        </template>
        <template v-else>
          <LinksStatisticsClickRow
            v-for="click in clicks"
            :key="click.id"
            :click="click"
          />
        </template>
      </tbody>
    </table>

    <div
      v-if="!loading && hasMore"
      class="flex items-center gap-3 border-t px-4 py-3"
    >
      <UiButton
        variant="outline"
        :aria-busy="loadingMore"
        @click="$emit('loadMore')"
      >
        <ChevronDownIcon />
        {{ $t('links.statistics.clicks.loadMore') }}
      </UiButton>
    </div>
  </UiCard>
</template>
