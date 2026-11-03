<script setup lang="ts">
import type { AccordionContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { cn } from 'cn';
import { AccordionContent } from 'reka-ui';

const props = defineProps<
  AccordionContentProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="type-small text-muted-foreground"
  >
    <div :class="cn('pb-3.5', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
