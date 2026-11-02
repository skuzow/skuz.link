<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner';
import { cn } from 'cn';
import { Toaster as Sonner } from 'vue-sonner';
import CheckIcon from '~icons/pixelarticons/check';
import CircleInfoIcon from '~icons/pixelarticons/circle-info';
import CloseIcon from '~icons/pixelarticons/close';
import LoaderIcon from '~icons/pixelarticons/loader';
import SquareAlertIcon from '~icons/pixelarticons/square-alert';
import WarningDiamondIcon from '~icons/pixelarticons/warning-diamond';

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)'
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CheckIcon />
    </template>
    <template #info-icon>
      <CircleInfoIcon />
    </template>
    <template #warning-icon>
      <WarningDiamondIcon />
    </template>
    <template #error-icon>
      <SquareAlertIcon />
    </template>
    <template #loading-icon>
      <div>
        <LoaderIcon class="animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <CloseIcon />
    </template>
  </Sonner>
</template>
