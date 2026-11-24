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
    class="aria-pressed:bg-accent aria-pressed:text-foreground"
    @click="bots = !bots"
  >
    <RobotIcon />
    {{ $t('links.statistics.bots') }}
  </UiButton>
</template>
