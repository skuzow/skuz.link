<script lang="ts" setup>
import RepeatIcon from '~icons/pixelarticons/repeat';
import SquareAlertIcon from '~icons/pixelarticons/square-alert';

interface Props {
  loading: boolean;
  failed: boolean;
  retrying: boolean;
  // what the failure line says
  failure: string;
}

const { loading, failed, retrying, failure } = defineProps<Props>();

const emit = defineEmits(['retry']);
</script>

<template>
  <!-- one Skeleton row in the shape of a real row: the panel can only grow from here -->
  <div v-if="loading" aria-busy="true">
    <div
      aria-hidden="true"
      class="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-1.5 self-stretch sm:flex-1">
        <div class="flex h-[21px] items-center gap-2">
          <UiSkeleton class="size-4 shrink-0" />
          <UiSkeleton class="h-3.5 w-[min(240px,70%)]" />
        </div>
        <div class="flex h-[21px] items-center gap-2">
          <UiSkeleton class="size-4 shrink-0" />
          <UiSkeleton class="h-3.5 w-[min(112px,40%)]" />
        </div>
      </div>

      <UiSkeleton class="h-control-md w-24 shrink-0" />
    </div>
  </div>

  <div
    v-else-if="failed"
    class="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-destructive type-small flex items-center gap-1.5">
      <SquareAlertIcon class="shrink-0" />
      {{ failure }}
    </p>

    <!-- the ghost Button's text lines up with the line's: its padding and border -->
    <UiButton
      class="-ml-[11px] sm:ml-0"
      variant="ghost"
      :loading="retrying"
      @click="emit('retry')"
    >
      <RepeatIcon />
      {{ $t('auth.settings.retry') }}
    </UiButton>
  </div>

  <slot v-else />
</template>
