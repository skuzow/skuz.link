<script lang="ts" setup>
import type {
  Click,
  ClickRange,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';
import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';

const props = defineProps<{
  link: Link;
  statistics: LinkStatistics;
  clicks: Click[];
  hasMore: boolean;
  // the figures and the first page load again
  loading: boolean;
  // only the first page loads again, for a new country
  filtering: boolean;
  loadingMore: boolean;
  // the country whose Clicks the list shows, if any
  country?: string;
}>();

defineEmits<{
  pickCountry: [country: string];
  clearCountry: [];
  loadMore: [];
}>();

const range = defineModel<ClickRange>('range', { required: true });
const bots = defineModel<boolean>('bots', { required: true });

// the Clicks the list can show: the range's, or the picked country's
const total = computed(() =>
  props.country
    ? (props.statistics.countryClicks.find(
        (entry) => entry.country === props.country
      )?.clicks ?? 0)
    : props.statistics.rangeClicks
);
</script>

<template>
  <div class="flex flex-col gap-3">
    <UiButton variant="link" as-child class="mb-3 self-start">
      <NuxtLinkLocale :to="LINKS_ROUTE">
        <ArrowLeftIcon />
        {{ $t('links.statistics.back') }}
      </NuxtLinkLocale>
    </UiButton>

    <LinksStatisticsSummary :link="link">
      <LinksStatisticsReadout
        :statistics="statistics"
        :range="range"
        :loading="loading"
      />
    </LinksStatisticsSummary>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <LinksStatisticsRangeSwitcher v-model="range" />
      <LinksStatisticsBotsToggle v-model="bots" />
    </div>

    <!-- it keeps its last state while new figures load -->
    <LinksStatisticsCountries
      :statistics="statistics"
      :picked="country"
      @pick="$emit('pickCountry', $event)"
    />

    <LinksStatisticsClickList
      :clicks="clicks"
      :total="total"
      :country="country"
      :has-more="hasMore"
      :loading="loading || filtering"
      :loading-more="loadingMore"
      @clear-country="$emit('clearCountry')"
      @load-more="$emit('loadMore')"
    />
  </div>
</template>
