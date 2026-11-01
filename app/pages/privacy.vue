<script lang="ts" setup>
import PrivacyEn from '@/legal/privacy.en.md';
import PrivacyEs from '@/legal/privacy.es.md';

defineI18nRoute({ paths: { es: '/privacidad' } });

const { t: $t } = useI18n();

seoMeta({
  title: $t('legal.privacy.title'),
  description: $t('legal.privacy.description')
});
</script>

<template>
  <LegalDocument
    :title="$t('legal.privacy.title')"
    updated="2026-10-30"
    :bodies="{ en: PrivacyEn, es: PrivacyEs }"
  />
</template>
