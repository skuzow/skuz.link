<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import { DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui';
import DialogOverlay from './DialogOverlay.vue';

defineOptions({
  inheritAttrs: false
});

const props = defineProps<
  DialogContentProps & { class?: HTMLAttributes['class'] }
>();
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
    </DialogContent>
  </DialogPortal>
</template>
