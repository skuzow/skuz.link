<script lang="ts" setup>
import { AtSignIcon } from 'lucide-vue-next';

const currentYear: number = new Date().getFullYear();

interface Contributor {
  username: string;
  avatar: string;
}

const contributors: Contributor[] = [
  {
    username: 'Kiaruexe',
    avatar: 'https://avatars.githubusercontent.com/u/125899948'
  },
  {
    username: 'skuzow',
    avatar: 'https://avatars.githubusercontent.com/u/61398114'
  }
];
</script>

<template>
  <footer class="pt-5 pb-6">
    <nav
      class="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-between gap-y-4 px-4 md:flex-row md:gap-y-0 md:px-8"
    >
      <p class="font-bold">skuz.link / {{ currentYear }}</p>

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
          <li v-for="{ username, avatar } in contributors" :key="username">
            <NavFooterContributor :username="username" :avatar="avatar" />
          </li>
        </ul>
      </section>
    </nav>
  </footer>
</template>
