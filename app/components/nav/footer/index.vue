<script lang="ts" setup>
import AtSignIcon from '~icons/pixelarticons/at-sign';

const currentYear: number = new Date().getFullYear();
</script>

<template>
  <footer class="bg-background/80 border-t py-5 backdrop-blur-md">
    <nav
      class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-y-4 px-4 md:flex-row md:gap-y-0 md:px-8"
    >
      <div class="flex items-center justify-center gap-x-2">
        <IconLogo />
        <span class="type-eyebrow text-faint-foreground"
          >/ {{ currentYear }}</span
        >
      </div>

      <ul class="flex flex-wrap items-center justify-center gap-4">
        <li class="flex">
          <UiButton as-child variant="link" size="sm">
            <NuxtLinkLocale to="/legal-notice">
              {{ $t('nav.footer.legalNotice') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="flex">
          <UiButton as-child variant="link" size="sm">
            <NuxtLinkLocale to="/privacy">
              {{ $t('nav.footer.privacy') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="flex">
          <UiButton as-child variant="link" size="sm">
            <NuxtLinkLocale to="/terms">
              {{ $t('nav.footer.terms') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="hidden md:flex">
          <span class="type-chip text-faint-foreground" aria-hidden="true"
            >/</span
          >
        </li>
        <li class="flex">
          <UiButton
            as-child
            variant="link"
            size="sm"
            class="lit-icon [--lit-icon-on:var(--signal)]"
          >
            <NuxtLink
              to="mailto:contact@skuz.link"
              :title="$t('nav.footer.contact')"
            >
              <AtSignIcon />
              {{ $t('nav.footer.contact') }}
            </NuxtLink>
          </UiButton>
        </li>
      </ul>
    </nav>
  </footer>
</template>
