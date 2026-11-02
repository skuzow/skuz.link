<script lang="ts" setup>
import type { DrawerOpenChangeDetails } from 'reka-ui';
import { useMediaQuery } from '@vueuse/core';

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
          {{ options?.cancel || $t('cancel') }}
        </UiAlertDialogCancel>

        <UiAlertDialogAction
          :variant="options?.danger ? 'destructive' : 'default'"
          @click="dismiss(true)"
        >
          {{ options?.confirm || $t('confirm') }}
        </UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>

  <UiDrawer v-else :open="isOpen" @update:open="keepDrawerOpen">
    <UiDrawerContent>
      <UiDrawerHeader class="mt-3 gap-3">
        <UiDrawerTitle>{{ options?.title }}</UiDrawerTitle>

        <UiDrawerDescription>
          {{ options?.description }}
        </UiDrawerDescription>
      </UiDrawerHeader>
      <UiDrawerFooter class="mb-6">
        <UiDrawerClose as-child>
          <UiButton
            :variant="options?.danger ? 'destructive' : 'default'"
            @click="dismiss(true)"
          >
            {{ options?.confirm || $t('confirm') }}
          </UiButton>
        </UiDrawerClose>

        <UiDrawerClose as-child>
          <UiButton variant="outline" @click="dismiss(false)">
            {{ options?.cancel || $t('cancel') }}
          </UiButton>
        </UiDrawerClose>
      </UiDrawerFooter>
    </UiDrawerContent>
  </UiDrawer>
</template>
