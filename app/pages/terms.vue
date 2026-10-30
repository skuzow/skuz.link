<script lang="ts" setup>
import TermsEn from '@/legal/terms.en.md';
import TermsEs from '@/legal/terms.es.md';

defineI18nRoute({ paths: { es: '/terminos' } });

const { t: $t } = useI18n();

seoMeta({
  title: $t('legal.terms.title'),
  description: $t('legal.terms.description')
});
</script>

<template>
  <LegalDocument
    :title="$t('legal.terms.title')"
    updated="2026-10-30"
    :bodies="{ en: TermsEn, es: TermsEs }"
  />
</template>
