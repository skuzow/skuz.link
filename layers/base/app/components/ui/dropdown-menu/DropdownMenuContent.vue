<script setup lang="ts">
import type {
  DropdownMenuContentEmits,
  DropdownMenuContentProps
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  useForwardPropsEmits
} from 'reka-ui';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>(),
  {
    sideOffset: 4
  }
);
const emits = defineEmits<DropdownMenuContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      data-slot="dropdown-menu-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-popover text-popover-foreground border-border-strong shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto border p-1 duration-100 [--lit-icon-on:var(--signal)] [--lit-icon-rest:var(--faint-foreground)]',
          props.class
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
