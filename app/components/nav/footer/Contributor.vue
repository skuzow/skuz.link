<script lang="ts" setup>
import type { Contributor } from '@/types/contributor.type';

interface Props {
  contributor: Contributor;
}

const { contributor } = defineProps<Props>();

const { username, avatar } = contributor;

const avatarFallback: string = username.substring(0, 2).toUpperCase();
</script>

<template>
  <UiTooltipProvider>
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <NuxtLink
          :to="`https://github.com/${username}`"
          :title="username"
          target="_blank"
          rel="noopener noreferrer"
        >
          <UiAvatar class="ring-background ring-2">
            <UiAvatarImage :src="avatar" :alt="`@${username}`" />
            <UiAvatarFallback>{{ avatarFallback }}</UiAvatarFallback>
          </UiAvatar>
        </NuxtLink>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>{{ username }}</p>
      </UiTooltipContent>
    </UiTooltip>
  </UiTooltipProvider>
</template>
