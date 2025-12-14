<script lang="ts" setup>
import { AtSignIcon } from 'lucide-vue-next';

import { contributors } from '@/constants/contributors.constant';

const currentYear: number = new Date().getFullYear();
</script>

<template>
  <footer class="pt-5 pb-6">
    <nav
      class="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-between gap-y-4 px-4 md:flex-row md:gap-y-0 md:px-8"
    >
      <div class="flex items-center justify-center gap-x-2">
        <NavLogo :size="20" />
        <span class="font-bold">/ {{ currentYear }}</span>
      </div>

      <section class="flex items-center gap-x-1 md:gap-x-4">
        <NuxtLink
          to="mailto:contact@skuz.link"
          :title="$t('nav.footer.contact')"
        >
          <UiButton variant="link" class="flex gap-x-1">
            <AtSignIcon :size="16" />
            {{ $t('nav.footer.contact') }}
          </UiButton>
        </NuxtLink>

        <ul class="flex -space-x-2">
          <li v-for="contributor in contributors" :key="contributor.username">
            <NavFooterContributor :contributor="contributor" />
          </li>
        </ul>
      </section>
    </nav>
  </footer>
</template>
