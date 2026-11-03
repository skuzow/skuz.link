<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn(
        'flex flex-wrap justify-between gap-2 [&>:last-child]:ml-auto',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
