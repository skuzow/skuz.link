<script lang="ts" setup>
import type { DrawerContentEmits, DrawerContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import {
  DrawerContent,
  DrawerHandle,
  DrawerPortal,
  useForwardPropsEmits
} from 'reka-ui';
import DrawerOverlay from './DrawerOverlay.vue';

defineOptions({
  inheritAttrs: false
});

const props = defineProps<
  DrawerContentProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<DrawerContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'group/drawer-content bg-popover text-popover-foreground border-border-strong fixed z-50 flex h-auto flex-col gap-6 border px-6 pt-3 pb-6',
          'transform-[translate3d(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px),0)] will-change-transform',
          'transition-transform duration-[120ms] ease-linear data-swiping:duration-0 data-swiping:select-none',
          'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:border-t-0',
          'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:border-b-0',
          'data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:border-r-0 data-[swipe-direction=right]:sm:max-w-sm',
          'data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:border-l-0 data-[swipe-direction=left]:sm:max-w-sm',
          props.class
        )
      "
    >
      <DrawerHandle
        data-slot="drawer-handle"
        class="hidden shrink-0 gap-[3px] self-center group-data-[swipe-direction=down]/drawer-content:flex"
      >
        <i v-for="cell in 3" :key="cell" class="bg-input size-1.5" />
      </DrawerHandle>
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
