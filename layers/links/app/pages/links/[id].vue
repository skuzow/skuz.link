<script lang="ts" setup>
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { t: $t } = useI18n();

const { link, clicks } = await useLinkStatistics(String(route.params.id));

seoMeta({
  title: $t('links.statistics.meta.title', { slug: link.value.slug })
});
</script>

<template>
  <LinksStatistics :link="link" :clicks="clicks" />
</template>
