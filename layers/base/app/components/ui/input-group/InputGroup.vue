<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="input-group"
    role="group"
    :class="
      cn(
        'chamfer h-control-md relative flex w-full min-w-0 items-stretch border border-(--cut-edge) [--cut-edge:var(--input)]',

        // Above the addon, or its fill hides the diagonals.
        'after:chamfer-lines after:pointer-events-none after:absolute after:-inset-px',

        // Focus state. UiFormControl replaces the input's data-slot, so select the input itself.
        'has-[input:focus-visible]:outline-ring has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:[clip-path:none] has-[input:focus-visible]:after:hidden',

        // Error state.
        'has-[input[aria-invalid=true]]:[--cut-edge:var(--destructive)]',

        props.class
      )
    "
  >
    <slot />
  </div>
</template>
