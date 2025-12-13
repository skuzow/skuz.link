<script lang="ts" setup>
import { SunIcon, MoonIcon, LaptopMinimalIcon } from 'lucide-vue-next';

import { Theme } from '@/constants/theme.constant';

const colorMode = useColorMode();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" size="icon">
        <SunIcon :size="18" class="scale-100 dark:scale-0" />
        <MoonIcon :size="18" class="absolute scale-0 dark:scale-100" />
        <span class="sr-only">{{ $t('nav.header.theme.button') }}</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="font-medium">
      <UiDropdownMenuItem
        class="gap-2"
        @click="colorMode.preference = Theme.LIGHT"
      >
        <SunIcon :size="16" />
        <span>{{ $t('nav.header.theme.light') }}</span>
      </UiDropdownMenuItem>

      <UiDropdownMenuItem
        class="gap-2"
        @click="colorMode.preference = Theme.DARK"
      >
        <MoonIcon :size="16" />
        <span>{{ $t('nav.header.theme.dark') }}</span>
      </UiDropdownMenuItem>

      <UiDropdownMenuItem
        class="gap-2"
        @click="colorMode.preference = Theme.SYSTEM"
      >
        <LaptopMinimalIcon :size="16" />
        <span>{{ $t('nav.header.theme.system') }}</span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
