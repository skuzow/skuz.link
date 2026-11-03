<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';
import { Input } from '#layers/base/app/components/ui/input';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <Input
    data-slot="input-group-control"
    :class="
      cn(
        // important: cn can't merge the control height or the chamfer's utilities
        'h-full! flex-1 border-0 bg-none! [clip-path:none]! focus-visible:outline-0',
        props.class
      )
    "
  />
</template>
