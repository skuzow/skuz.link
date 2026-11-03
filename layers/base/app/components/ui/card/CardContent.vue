<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card-content"
    :class="cn('flex min-w-0 flex-1 flex-col gap-2 p-5', props.class)"
  >
    <slot />
  </div>
</template>
