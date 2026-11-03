<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import { TooltipContent, TooltipPortal, useForwardPropsEmits } from 'reka-ui';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<TooltipContentProps & { class?: HTMLAttributes['class'] }>(),
  {
    sideOffset: 4
  }
);

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="
        cn(
          'bg-popover text-popover-foreground border-border-strong shadow-popover type-chip animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 z-50 w-fit border px-[9px] py-1.5 duration-100',
          props.class
        )
      "
    >
      <slot />
    </TooltipContent>
  </TooltipPortal>
</template>
