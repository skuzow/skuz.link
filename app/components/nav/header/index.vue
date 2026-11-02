<script lang="ts" setup>
import KeyIcon from '~icons/pixelarticons/key';

import { cn } from '#layers/base/app/lib/utils';

interface Props {
  transparent?: boolean;
}

const { transparent = false } = defineProps<Props>();

const { isAuthenticated } = useAuth();
</script>

<template>
  <header
    :class="
      cn(
        'sticky top-0 z-10 h-16 border-b',
        !transparent && 'bg-background/80 backdrop-blur-md'
      )
    "
  >
    <nav
      class="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 md:px-8"
    >
      <NuxtLinkLocale
        to="/"
        :title="$t('nav.home')"
        class="lit-icon focus-visible:outline-ring flex items-center gap-2 text-xl/7 font-bold [--lit-icon-on:var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <IconLogo :size="32" />
        <span class="max-[400px]:sr-only">skuz.link</span>
      </NuxtLinkLocale>

      <ul class="flex items-center gap-1 md:gap-3">
        <li>
          <NavHeaderDropdownLang />
        </li>

        <li>
          <NavHeaderDropdownTheme />
        </li>

        <li class="flex" aria-hidden="true">
          <UiSeparator
            orientation="vertical"
            class="data-[orientation=vertical]:h-5"
          />
        </li>

        <li v-if="isAuthenticated">
          <NavHeaderDropdownUser />
        </li>

        <li v-else>
          <UiButton as-child variant="secondary" size="sm">
            <NuxtLinkLocale to="/login" :title="$t('login.title')">
              <KeyIcon />
              {{ $t('login.title') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
      </ul>
    </nav>
  </header>
</template>
