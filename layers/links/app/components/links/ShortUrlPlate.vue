<script lang="ts" setup>
import CopyIcon from '~icons/pixelarticons/copy';

defineProps<{
  slug: string;
}>();

const emit = defineEmits<{
  copy: [];
}>();
</script>

<template>
  <div
    class="bg-card border-border-strong flex items-center justify-between gap-4 border py-4 pr-4 pl-5"
  >
    <span class="type-code sm:type-plate min-w-0 truncate">
      <span class="text-faint-foreground">skuz.link/</span>
      <span class="text-signal">{{ slug }}</span>
    </span>
    <UiButton variant="secondary" size="sm" @click="emit('copy')">
      <CopyIcon />
      {{ $t('links.copy') }}
    </UiButton>
  </div>
</template>
