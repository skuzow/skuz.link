<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card-header"
    :class="cn('flex min-h-9 items-center gap-2 border-b px-3', props.class)"
  >
    <slot />
  </div>
</template>
