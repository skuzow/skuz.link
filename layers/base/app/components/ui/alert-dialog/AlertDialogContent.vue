<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import {
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits
} from 'reka-ui';

defineOptions({
  inheritAttrs: false
});

const props = defineProps<
  AlertDialogContentProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<AlertDialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="bg-scrim fixed inset-0 z-50"
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-popover text-popover-foreground border-border-strong shadow-popover fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-6 border p-6 sm:max-w-[440px]',
          props.class
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
