<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import type { ButtonVariants } from '.';
import { cn } from 'cn';
import { Primitive } from 'reka-ui';
import IconLoader from '#layers/base/app/components/icon/Loader.vue';
import { buttonVariants } from '.';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button'
});
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :aria-busy="loading || undefined"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <template v-if="loading">
      <!-- opacity, not visibility: the label holds the width and still names the button -->
      <span class="inline-flex items-center gap-2 opacity-0"><slot /></span>
      <span
        class="absolute inset-0 flex items-center justify-center pb-[inherit]"
      >
        <IconLoader />
      </span>
    </template>
    <slot v-else />
  </Primitive>
</template>
