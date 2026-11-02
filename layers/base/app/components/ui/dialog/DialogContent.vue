<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits
} from 'reka-ui';
import CloseIcon from '~icons/pixelarticons/close';
import DialogOverlay from './DialogOverlay.vue';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes['class'];
      showCloseButton?: boolean;
    }
  >(),
  {
    showCloseButton: true
  }
);
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-popover text-popover-foreground border-border-strong shadow-popover fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-6 border p-6 sm:max-w-[440px]',
          props.class
        )
      "
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <CloseIcon />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
