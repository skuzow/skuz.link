<script lang="ts" setup>
import CloseIcon from '~icons/pixelarticons/close';
import SlidersIcon from '~icons/pixelarticons/sliders';
</script>

<template>
  <UiDialogContent
    class="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
  >
    <UiDialogHeader class="flex-row items-center gap-2 border-b py-3 pr-3 pl-6">
      <SlidersIcon class="text-faint-foreground" />
      <UiDialogTitle>{{ $t('auth.settings.title') }}</UiDialogTitle>
      <UiDialogClose as-child>
        <SharedIconButton class="ml-auto" size="icon-sm" :label="$t('close')">
          <CloseIcon />
        </SharedIconButton>
      </UiDialogClose>
    </UiDialogHeader>

    <div class="min-h-0 overflow-y-auto px-6 pb-6">
      <AuthSettingsProfile />

      <UiAccordion type="multiple">
        <AuthSettingsSessions />

        <AuthSettingsAccountConnected />

        <AuthSettingsAccountDelete />
      </UiAccordion>
    </div>
  </UiDialogContent>
</template>
