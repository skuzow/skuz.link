<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card-footer"
    :class="
      cn(
        'type-chip flex min-h-9 flex-wrap items-center gap-5 border-t px-5',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
