<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from 'cn';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
});
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'chamfer chamfer-lines text-foreground placeholder:text-faint-foreground selection:bg-primary selection:text-primary-foreground type-code h-control-md w-full min-w-0 border border-(--cut-edge) px-3 [--cut-edge:var(--input)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 max-md:text-base',
        'focus-visible:outline-ring focus-visible:bg-none focus-visible:outline-2 focus-visible:outline-offset-2',
        'aria-invalid:[--cut-edge:var(--destructive)]',
        props.class
      )
    "
  />
</template>
