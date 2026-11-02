<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card-action"
    :class="cn('ml-auto flex items-center gap-2', props.class)"
  >
    <slot />
  </div>
</template>
