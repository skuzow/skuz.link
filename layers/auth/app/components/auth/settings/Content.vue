<script lang="ts" setup>
import CloseIcon from '~icons/pixelarticons/close';
import SlidersIcon from '~icons/pixelarticons/sliders';
</script>

<template>
  <UiDialogContent
    class="flex max-h-[90dvh] max-w-[min(42rem,calc(100%-2rem))] flex-col gap-0 p-0 sm:max-w-[min(42rem,calc(100%-2rem))] lg:h-[min(680px,90dvh)] lg:max-w-[min(1080px,calc(100%-4rem))]"
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

    <!--
      From lg the middle row fills the height but never shrinks below what Connected accounts needs.
      Sessions adds no height of its own (size containment), so only its rows scroll. When the left
      column doesn't fit, as in a short window, the whole grid scrolls instead.
    -->
    <div
      class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(min-content,1fr)_auto]"
    >
      <AuthSettingsProfile class="lg:col-start-1 lg:row-start-1" />

      <AuthSettingsSessions
        class="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:[contain:size]"
      />

      <AuthSettingsAccountConnected
        class="lg:col-start-1 lg:row-span-2 lg:row-start-2"
      />

      <AuthSettingsAccountDelete class="lg:col-start-2 lg:row-start-3" />
    </div>
  </UiDialogContent>
</template>
