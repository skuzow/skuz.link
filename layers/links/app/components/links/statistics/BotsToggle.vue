<script lang="ts" setup>
import RobotIcon from '~icons/pixelarticons/robot';

const bots = defineModel<boolean>({ required: true });
</script>

<template>
  <!-- pressed, it takes the accent fill and keeps its icon lit, so the state
       shows in more than color -->
  <UiButton
    variant="outline"
    :aria-pressed="bots"
    class="aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:[--lit-icon-rest:var(--lit-icon-on)] aria-pressed:[&_svg]:drop-shadow-[0_0_4px_var(--lit-icon-on)]"
    @click="bots = !bots"
  >
    <RobotIcon />
    {{ $t('links.statistics.bots') }}
  </UiButton>
</template>
