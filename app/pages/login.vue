<script lang="ts" setup>
const { t: $t } = useI18n();

seoMeta({
  title: $t('nav.header.login'),
  description: $t('login.description')
});
</script>

<template>
  <section
    class="mx-auto flex h-10/12 max-w-xs flex-col justify-center gap-y-10"
  >
    <div class="flex flex-col items-center gap-y-6 text-center">
      <NavLogo :size="28" />

      <div class="space-y-1">
        <h1 class="text-lg font-semibold">
          {{ $t('nav.header.login') }}
        </h1>

        <p class="text-muted-foreground text-sm">
          {{ $t('login.description') }}
        </p>
      </div>
    </div>

    <UiSeparator />

    <div class="flex w-full flex-col gap-y-2.5">
      <AuthProviderButtons />
    </div>
  </section>
</template>
