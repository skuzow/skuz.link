<script lang="ts" setup>
const { locale, locales } = useI18n();

const switchLocalePath = useSwitchLocalePath();
</script>

<template>
  <UiDropdownMenu>
    <!-- outside the Tooltip's root, or the menu anchors to the Tooltip's popper -->
    <UiDropdownMenuTrigger as-child>
      <SharedIconButton
        :label="$t('nav.header.lang.button')"
        class="lit-icon [--lit-icon-on:var(--signal)]"
      >
        <span data-lit>{{ locale }}</span>
      </SharedIconButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-40">
      <UiDropdownMenuItem
        v-for="{ code, name } in locales"
        :key="code"
        as-child
      >
        <NuxtLink
          :to="switchLocalePath(code)"
          :title="code.toUpperCase()"
          :aria-current="code === locale ? 'true' : undefined"
        >
          <span data-lit class="type-control w-5">{{ code }}</span>
          <span>{{ name }}</span>
          <span v-if="code === locale" class="led text-signal ml-auto" />
        </NuxtLink>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
