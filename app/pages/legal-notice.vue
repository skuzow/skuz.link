<script lang="ts" setup>
import LegalNoticeEn, {
  sections as legalNoticeEnSections
} from '@/legal/legal-notice.en.md';
import LegalNoticeEs, {
  sections as legalNoticeEsSections
} from '@/legal/legal-notice.es.md';

defineI18nRoute({ paths: { es: '/aviso-legal' } });

const { t: $t } = useI18n();

seoMeta({
  title: $t('legal.legalNotice.title'),
  description: $t('legal.legalNotice.description')
});
</script>

<template>
  <LegalDocument
    :title="$t('legal.legalNotice.title')"
    updated="2026-10-30"
    :content="{
      en: { body: LegalNoticeEn, sections: legalNoticeEnSections },
      es: { body: LegalNoticeEs, sections: legalNoticeEsSections }
    }"
  />
</template>
