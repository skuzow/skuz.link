<script lang="ts" setup>
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { t: $t } = useI18n();

const {
  link,
  statistics,
  clicks,
  hasMore,
  range,
  bots,
  country,
  isLoading,
  isFiltering,
  isLoadingMore,
  setRange,
  setBots,
  pickCountry,
  clearCountry,
  loadMore,
  refresh,
  freshIds,
  refreshes
} = await useLinkStatistics(String(route.params.id));

// after the await, so the interval stops with the page
const { isPaused } = useLiveRefresh(refresh);

seoMeta({
  title: $t('links.statistics.meta.title', { slug: link.value.slug })
});
</script>

<template>
  <LinksStatistics
    :link="link"
    :statistics="statistics"
    :clicks="clicks"
    :has-more="hasMore"
    :loading="isLoading"
    :filtering="isFiltering"
    :loading-more="isLoadingMore"
    :range="range"
    :bots="bots"
    :country="country"
    :fresh="freshIds"
    :paused="isPaused"
    :refreshes="refreshes"
    @update:range="setRange"
    @update:bots="setBots"
    @pick-country="pickCountry"
    @clear-country="clearCountry"
    @load-more="loadMore"
  />
</template>
