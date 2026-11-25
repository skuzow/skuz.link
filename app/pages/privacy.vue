<script lang="ts" setup>
import PrivacyEn, {
  sections as privacyEnSections
} from '@/legal/privacy.en.md';
import PrivacyEs, {
  sections as privacyEsSections
} from '@/legal/privacy.es.md';

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
    updated="2026-11-23"
    :content="{
      en: { body: PrivacyEn, sections: privacyEnSections },
      es: { body: PrivacyEs, sections: privacyEsSections }
    }"
  />
</template>
