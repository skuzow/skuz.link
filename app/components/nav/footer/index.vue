<script lang="ts" setup>
import AtSignIcon from '~icons/pixelarticons/at-sign';

const currentYear: number = new Date().getFullYear();
</script>

<template>
  <footer class="pt-5 pb-6">
    <nav
      class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-y-4 px-4 md:flex-row md:gap-y-0 md:px-8"
    >
      <div class="flex items-center justify-center gap-x-2">
        <IconLogo />
        <span class="font-bold">/ {{ currentYear }}</span>
      </div>

      <ul class="flex flex-wrap items-center justify-center gap-x-4">
        <li class="flex">
          <UiButton as-child variant="link">
            <NuxtLinkLocale to="/legal-notice">
              {{ $t('nav.footer.legalNotice') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="flex">
          <UiButton as-child variant="link">
            <NuxtLinkLocale to="/privacy">
              {{ $t('nav.footer.privacy') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="flex">
          <UiButton as-child variant="link">
            <NuxtLinkLocale to="/terms">
              {{ $t('nav.footer.terms') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
        <li class="hidden md:block">
          <span aria-hidden="true">/</span>
        </li>
        <li class="flex">
          <UiButton as-child variant="link" class="gap-1">
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
