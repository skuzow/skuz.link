<script lang="ts" setup>
import { cn } from '@/lib/utils';

interface Props {
  isLanding?: boolean;
}

const { isLanding = false } = defineProps<Props>();

const { isAuthenticated } = useAuth();
</script>

<template>
  <header
    :class="
      cn(
        'sticky top-0 z-10 py-2.5',
        !isLanding && 'bg-background/80 backdrop-blur-md'
      )
    "
  >
    <nav
      class="mx-auto flex w-full max-w-368 flex-1 justify-between px-4 md:px-8"
    >
      <NuxtLinkLocale
        to="/"
        :title="$t('nav.home')"
        class="my-auto text-xl font-bold"
      >
        skuz.link
      </NuxtLinkLocale>

      <ul class="flex gap-x-1 md:gap-x-4">
        <li>
          <NavHeaderDropdownLang />
        </li>

        <li>
          <NavHeaderDropdownTheme />
        </li>

        <li v-if="isAuthenticated">
          <NavHeaderDropdownUser />
        </li>

        <li v-else>
          <UiButton as-child variant="secondary">
            <NuxtLinkLocale to="/login" :title="$t('nav.header.login')">
              {{ $t('nav.header.login') }}
            </NuxtLinkLocale>
          </UiButton>
        </li>
      </ul>
    </nav>
  </header>
</template>
