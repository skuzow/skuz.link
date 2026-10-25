<script setup lang="ts">
import type { AlertDialogActionProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogAction } from 'reka-ui';
import { cn } from '#layers/base/app/lib/utils';
import {
  buttonVariants,
  type ButtonVariants
} from '#layers/base/app/components/ui/button';

const props = defineProps<
  AlertDialogActionProps & {
    variant?: ButtonVariants['variant'];
    class?: HTMLAttributes['class'];
  }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogAction
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
