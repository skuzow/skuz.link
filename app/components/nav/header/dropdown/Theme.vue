<script lang="ts" setup>
import LaptopIcon from '~icons/pixelarticons/laptop';
import MoonIcon from '~icons/pixelarticons/moon';
import SunIcon from '~icons/pixelarticons/sun';

import { Theme } from '@/constants/theme.constant';

const colorMode = useColorMode();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" size="icon">
        <SunIcon class="scale-100 dark:scale-0" />
        <MoonIcon class="absolute scale-0 dark:scale-100" />
        <span class="sr-only">{{ $t('nav.header.theme.button') }}</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="font-medium">
      <UiDropdownMenuItem @click="colorMode.preference = Theme.LIGHT">
        <SunIcon />
        <span>{{ $t('nav.header.theme.light') }}</span>
      </UiDropdownMenuItem>

      <UiDropdownMenuItem @click="colorMode.preference = Theme.DARK">
        <MoonIcon />
        <span>{{ $t('nav.header.theme.dark') }}</span>
      </UiDropdownMenuItem>

      <UiDropdownMenuItem @click="colorMode.preference = Theme.SYSTEM">
        <LaptopIcon />
        <span>{{ $t('nav.header.theme.system') }}</span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
