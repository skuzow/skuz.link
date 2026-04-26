<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { AvatarRoot } from 'reka-ui';
import { cn } from '@/lib/utils';
import { avatarVariant, type AvatarVariants } from '.';

const props = defineProps<{
  size?: AvatarVariants['size'];
  shape?: AvatarVariants['shape'];
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :class="cn(avatarVariant({ size, shape }), props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
