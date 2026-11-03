<script lang="ts" setup>
import LaptopIcon from '~icons/pixelarticons/laptop';
import MoonIcon from '~icons/pixelarticons/moon';
import SunIcon from '~icons/pixelarticons/sun';

import { Theme } from '@/constants/theme.constant';

const themeIcons: Record<Theme, Component> = {
  [Theme.LIGHT]: SunIcon,
  [Theme.DARK]: MoonIcon,
  [Theme.SYSTEM]: LaptopIcon
};

const colorMode = useColorMode();
</script>

<template>
  <UiDropdownMenu>
    <!-- outside the Tooltip's root, or the menu anchors to the Tooltip's popper -->
    <UiDropdownMenuTrigger as-child>
      <SharedIconButton
        :label="$t('nav.header.theme.button')"
        class="lit-icon [--lit-icon-on:var(--signal)]"
      >
        <ClientOnly>
          <component :is="themeIcons[colorMode.preference as Theme]" />

          <!-- the server can't know a stored System preference, only the applied theme -->
          <template #fallback>
            <SunIcon class="dark:hidden" />
            <MoonIcon class="hidden dark:block" />
          </template>
        </ClientOnly>
      </SharedIconButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-40">
      <UiDropdownMenuRadioGroup v-model="colorMode.preference">
        <UiDropdownMenuRadioItem
          v-for="(icon, theme) in themeIcons"
          :key="theme"
          :value="theme"
        >
          <component :is="icon" />
          <span>{{ $t(`nav.header.theme.${theme}`) }}</span>
        </UiDropdownMenuRadioItem>
      </UiDropdownMenuRadioGroup>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
