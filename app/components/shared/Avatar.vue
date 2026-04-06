<!-- eslint-disable vue/require-default-prop -->
<script lang="ts" setup>
import type { AvatarVariants } from '@/components/ui/avatar';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { authUser } = useAuth();

interface Props {
  size?: AvatarVariants['size'];
  shape?: AvatarVariants['shape'];
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  alt?: string;
  pointer?: boolean;
  user: User | typeof authUser.value;
}

const {
  size,
  shape,
  width = 36,
  height = 36,
  loading,
  decoding = 'async',
  alt = 'Avatar',
  pointer = true,
  user
} = defineProps<Props>();
</script>

<template>
  <UiAvatar
    v-if="user"
    :size="size"
    :shape="shape"
    :class="
      cn(
        pointer && 'cursor-pointer',
        pointer &&
          !user.image &&
          'transition-all duration-200 hover:brightness-95 dark:hover:brightness-110'
      )
    "
  >
    <UiAvatarImage
      v-if="user.image"
      :src="user.image"
      :width="width"
      :height="height"
      :loading="loading"
      :decoding="decoding"
      :title="alt"
      :alt="alt"
    />

    <UiAvatarFallback>
      {{ abbreviate(user.name) }}
    </UiAvatarFallback>
  </UiAvatar>
</template>
