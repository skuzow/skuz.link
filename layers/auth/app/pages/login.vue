<script lang="ts" setup>
definePageMeta({ middleware: 'guest' });

const { t: $t } = useI18n();
const { auth } = useAppConfig();

seoMeta({
  title: $t('login.title'),
  description: $t('login.description')
});
</script>

<template>
  <section
    class="mx-auto flex h-11/12 max-w-xs flex-col justify-center gap-y-10"
  >
    <div class="flex flex-col items-center gap-y-6 text-center">
      <NavLogo :size="28" />

      <div class="space-y-1">
        <h1 class="text-lg font-semibold">
          {{ $t('login.title') }}
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

    <!-- signing in accepts the Terms of use; nothing stores the acceptance -->
    <i18n-t
      keypath="login.acceptance"
      tag="p"
      class="text-muted-foreground -mt-6 text-center text-xs text-balance"
    >
      <template #terms>
        <NuxtLinkLocale
          :to="auth.termsRoute"
          class="hover:text-foreground underline underline-offset-4"
        >
          {{ $t('login.termsLink') }}
        </NuxtLinkLocale>
      </template>
      <template #privacy>
        <NuxtLinkLocale
          :to="auth.privacyRoute"
          class="hover:text-foreground underline underline-offset-4"
        >
          {{ $t('login.privacyLink') }}
        </NuxtLinkLocale>
      </template>
    </i18n-t>
  </section>
</template>
