<script lang="ts" setup>
defineProps<{
  // the tab is hidden, so nothing refreshes
  paused: boolean;
  // the refreshes that have landed; each one blinks the LED once
  refreshes: number;
}>();
</script>

<template>
  <span class="ml-auto inline-flex items-center gap-2">
    <!-- a new LED for each refresh, so the blink plays again; none on load -->
    <!-- dark while paused: no glow, even in dark -->
    <span
      :key="refreshes"
      aria-hidden="true"
      :class="[
        'led',
        paused ? 'text-border-strong shadow-none!' : 'text-signal',
        refreshes > 0 && 'animate-led-tick'
      ]"
    />
    <span class="type-chip text-muted-foreground whitespace-nowrap">
      {{
        paused
          ? $t('links.statistics.live.paused')
          : $t('links.statistics.live.on')
      }}
    </span>
  </span>
</template>
