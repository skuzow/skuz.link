<script lang="ts" setup>
import CopyIcon from '~icons/pixelarticons/copy';

defineProps<{
  slug: string;
  failed?: boolean;
}>();

const emit = defineEmits<{
  copy: [];
}>();
</script>

<template>
  <div
    class="bg-card border-border-strong flex items-center border"
    :class="
      failed
        ? 'max-w-[min(100%,448px)] px-5 py-3'
        : 'justify-between gap-4 py-4 pr-4 pl-5'
    "
  >
    <span class="type-code sm:type-plate min-w-0 truncate">
      <span class="text-faint-foreground">skuz.link/</span>
      <span :class="failed ? 'text-destructive' : 'text-signal'">
        {{ slug }}
      </span>
    </span>
    <UiButton
      v-if="!failed"
      variant="secondary"
      size="sm"
      @click="emit('copy')"
    >
      <CopyIcon />
      {{ $t('links.copy') }}
    </UiButton>
  </div>
</template>
