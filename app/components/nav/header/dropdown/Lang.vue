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
      <NuxtLink
        v-for="{ code, name } in locales"
        :key="code"
        :to="switchLocalePath(code)"
        :title="code.toUpperCase()"
      >
        <UiDropdownMenuItem>
          <span>{{ name }}</span>
        </UiDropdownMenuItem>
      </NuxtLink>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
