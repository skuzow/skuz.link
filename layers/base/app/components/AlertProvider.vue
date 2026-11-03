<script lang="ts" setup>
import type { DrawerOpenChangeDetails } from 'reka-ui';
import { useMediaQuery } from '@vueuse/core';
import CheckIcon from '~icons/pixelarticons/check';
import CloseIcon from '~icons/pixelarticons/close';

const { isOpen, options, dismiss } = useAlert();

const isDesktop: Ref<boolean> = useMediaQuery('(min-width: 768px)');

// an alert only answers through its buttons, so nothing else may close it
const keepDrawerOpen = (open: boolean, details: DrawerOpenChangeDetails) => {
  if (!open && details.reason !== 'close-press') details.cancel();
};
</script>

<template>
  <UiAlertDialog v-if="isDesktop" v-model:open="isOpen">
    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>{{ options?.title }}</UiAlertDialogTitle>

        <UiAlertDialogDescription>
          {{ options?.description }}
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogCancel @click="dismiss(false)">
          <CloseIcon data-icon="inline-start" />
          {{ options?.cancel || $t('cancel') }}
        </UiAlertDialogCancel>

        <UiAlertDialogAction
          :variant="options?.danger ? 'destructive' : 'default'"
          @click="dismiss(true)"
        >
          <CheckIcon data-icon="inline-start" />
          {{ options?.confirm || $t('confirm') }}
        </UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>

  <UiDrawer v-else :open="isOpen" @update:open="keepDrawerOpen">
    <UiDrawerContent>
      <UiDrawerHeader>
        <UiDrawerTitle>{{ options?.title }}</UiDrawerTitle>

        <UiDrawerDescription>
          {{ options?.description }}
        </UiDrawerDescription>
      </UiDrawerHeader>
      <UiDrawerFooter>
        <UiDrawerClose as-child>
          <UiButton
            :variant="options?.danger ? 'destructive' : 'default'"
            @click="dismiss(true)"
          >
            <CheckIcon data-icon="inline-start" />
            {{ options?.confirm || $t('confirm') }}
          </UiButton>
        </UiDrawerClose>

        <UiDrawerClose as-child>
          <UiButton variant="secondary" @click="dismiss(false)">
            <CloseIcon data-icon="inline-start" />
            {{ options?.cancel || $t('cancel') }}
          </UiButton>
        </UiDrawerClose>
      </UiDrawerFooter>
    </UiDrawerContent>
  </UiDrawer>
</template>
