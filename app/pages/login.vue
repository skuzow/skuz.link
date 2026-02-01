<script lang="ts" setup>
const { t: $t } = useI18n();

seoMeta({
  title: $t('nav.header.login'),
  description: $t('login.description')
});
</script>

<template>
  <section class="m-auto flex w-72 flex-col gap-y-6">
    <AuthProviderButtons />
  </section>
</template>
