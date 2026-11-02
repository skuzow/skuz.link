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
  <section class="flex h-full max-w-xs flex-col justify-center gap-y-8">
    <IconLogo :size="32" />

    <div class="-mt-2 flex flex-col gap-y-2">
      <h1 class="type-display-sm">
        {{ $t('login.title') }}
      </h1>

      <p class="type-body text-muted-foreground">
        {{ $t('login.description') }}
      </p>
    </div>

    <div class="flex flex-col gap-y-2.5">
      <AuthProviderButtons />
    </div>

    <!-- signing in accepts the Terms of use; nothing stores the acceptance -->
    <i18n-t
      keypath="login.acceptance"
      tag="p"
      class="type-caption text-muted-foreground text-balance"
    >
      <template #terms>
        <NuxtLinkLocale
          :to="auth.termsRoute"
          class="hover:text-foreground focus-visible:outline-ring underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {{ $t('login.termsLink') }}
        </NuxtLinkLocale>
      </template>
      <template #privacy>
        <NuxtLinkLocale
          :to="auth.privacyRoute"
          class="hover:text-foreground focus-visible:outline-ring underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {{ $t('login.privacyLink') }}
        </NuxtLinkLocale>
      </template>
    </i18n-t>
  </section>
</template>
