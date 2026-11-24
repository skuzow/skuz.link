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
  isLoading,
  isLoadingMore,
  setRange,
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
    :loading-more="isLoadingMore"
    :range="range"
    @update:range="setRange"
    @load-more="loadMore"
  />
</template>
