<script setup lang="ts">
import type { AccordionTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import { AccordionHeader, AccordionTrigger } from 'reka-ui';
import ChevronRightIcon from '~icons/pixelarticons/chevron-right';

const props = defineProps<
  AccordionTriggerProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'type-small focus-visible:outline-ring flex flex-1 cursor-pointer items-center justify-between gap-4 py-3.5 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-90',
          props.class
        )
      "
    >
      <slot />
      <slot name="icon">
        <ChevronRightIcon
          class="pointer-events-none size-4 shrink-0 transition-transform duration-100"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
