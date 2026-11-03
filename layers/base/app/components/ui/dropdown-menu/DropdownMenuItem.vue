<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import { DropdownMenuItem, useForwardProps } from 'reka-ui';

const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      class?: HTMLAttributes['class'];
      inset?: boolean;
      variant?: 'default' | 'destructive';
    }
  >(),
  {
    variant: 'default'
  }
);

const delegatedProps = reactiveOmit(props, 'inset', 'variant', 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="
      cn(
        `data-highlighted:bg-accent data-[variant=destructive]:text-destructive lit-icon type-small relative flex cursor-pointer items-center gap-2 px-2 py-[7px] outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:[--lit-icon-on:var(--destructive)] data-[variant=destructive]:[--lit-icon-rest:var(--destructive)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
