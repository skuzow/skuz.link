<script lang="ts" setup>
const { locale, locales } = useI18n();

const switchLocalePath = useSwitchLocalePath();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" size="icon">
        <span class="mt-0.5 text-base">{{ locale.toUpperCase() }}</span>
        <span class="sr-only">{{ $t('nav.header.lang.button') }}</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="font-medium">
      <UiDropdownMenuItem
        v-for="{ code, name } in locales"
        :key="code"
        as-child
      >
        <NuxtLink :to="switchLocalePath(code)" :title="code.toUpperCase()">
          <span>{{ name }}</span>
        </NuxtLink>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
