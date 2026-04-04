<script lang="ts" setup>
import { Settings2Icon } from 'lucide-vue-next';
</script>

<template>
  <UiDialogContent class="max-h-[90dvh] gap-0 p-0 sm:max-w-xl md:max-w-2xl">
    <UiDialogHeader class="border-b p-6 pb-4">
      <UiDialogTitle class="flex items-center gap-x-2.5">
        <Settings2Icon :size="20" />
        {{ $t('nav.header.user.settings') }}
      </UiDialogTitle>
    </UiDialogHeader>

    <div
      class="flex max-h-[75dvh] flex-col gap-y-4 overflow-y-auto p-6 pt-4 text-sm"
    >
      <!-- <AuthSettingsProfile /> -->

      <AuthSettingsSessions />

      <!-- <AuthSettingsAccountLinked /> -->

      <AuthSettingsAccountDelete />
    </div>
  </UiDialogContent>
</template>
