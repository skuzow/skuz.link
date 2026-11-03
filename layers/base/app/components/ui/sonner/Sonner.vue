<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner';
import { cn } from 'cn';
import { Toaster as Sonner } from 'vue-sonner';

const props = defineProps<ToasterProps>();

// unstyled: vue-sonner's own rules aren't in a layer, so they'd beat every utility
const toastOptions: ToasterProps['toastOptions'] = {
  unstyled: true,
  classes: {
    toast:
      'bg-popover text-popover-foreground border-border-strong shadow-popover flex w-(--width) items-start gap-3 border px-3.5 py-3',
    icon: 'flex',
    title: 'type-small font-medium',
    description: 'text-muted-foreground font-mono text-xs/[18px]'
  }
};
</script>

<template>
  <Sonner
    v-bind="props"
    :class="cn('toaster group', props.class)"
    :style="{ '--width': '340px' }"
    :toast-options="toastOptions"
  >
    <template #success-icon>
      <span class="led text-success mt-2" />
    </template>
    <template #error-icon>
      <span class="led text-destructive mt-2" />
    </template>
  </Sonner>
</template>
