<!-- eslint-disable vue/require-default-prop -->
<script lang="ts" setup>
import type { AvatarVariants } from '#layers/base/app/components/ui/avatar';
import type { User } from '#layers/auth/shared/domain/user.type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { authUser } = useAuth();

interface Props {
  size?: AvatarVariants['size'];
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  alt?: string;
  user: User | typeof authUser.value;
}

const {
  size,
  width = 32,
  height = 32,
  loading,
  decoding = 'async',
  alt = 'Avatar',
  user
} = defineProps<Props>();
</script>

<template>
  <UiAvatar v-if="user" :size="size">
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
