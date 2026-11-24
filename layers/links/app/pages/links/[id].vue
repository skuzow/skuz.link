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
  loadMore
} = await useLinkStatistics(String(route.params.id));

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
    @update:range="setRange"
    @update:bots="setBots"
    @pick-country="pickCountry"
    @clear-country="clearCountry"
    @load-more="loadMore"
  />
</template>
