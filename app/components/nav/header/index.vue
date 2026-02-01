<script lang="ts" setup>
const { isAuthenticated } = useAuth();
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 py-2.5 backdrop-blur-md">
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

        <li v-if="isAuthenticated" class="hidden md:flex">
          <!-- <LazyNavHeaderDropdownUser hydrate-on-visible /> -->
        </li>

        <li v-else>
          <NuxtLinkLocale to="/login" :title="$t('nav.header.login')">
            <UiButton variant="secondary">
              {{ $t('nav.header.login') }}
            </UiButton>
          </NuxtLinkLocale>
        </li>
      </ul>
    </nav>
  </header>
</template>
