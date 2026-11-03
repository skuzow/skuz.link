<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="drawer-header"
    :class="cn('flex flex-col gap-1 text-left', props.class)"
  >
    <slot />
  </div>
</template>
