<script lang="ts" setup>
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { t: $t } = useI18n();

const { link, statistics, clicks, range, isLoading, setRange } =
  await useLinkStatistics(String(route.params.id));

seoMeta({
  title: $t('links.statistics.meta.title', { slug: link.value.slug })
});
</script>

<template>
  <LinksStatistics
    :link="link"
    :statistics="statistics"
    :clicks="clicks"
    :loading="isLoading"
    :range="range"
    @update:range="setRange"
  />
</template>
