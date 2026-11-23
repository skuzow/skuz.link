<script lang="ts" setup>
import TermsEn, { sections as termsEnSections } from '@/legal/terms.en.md';
import TermsEs, { sections as termsEsSections } from '@/legal/terms.es.md';

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
    :content="{
      en: { body: TermsEn, sections: termsEnSections },
      es: { body: TermsEs, sections: termsEsSections }
    }"
  />
</template>
