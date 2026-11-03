<script lang="ts" setup>
interface Props {
  label: string;
}

const { label } = defineProps<Props>();

// the Button is the root in all but name: the Tooltip's root renders no element
defineOptions({ inheritAttrs: false });
</script>

<template>
  <!-- needs a UiTooltipProvider: the root layout's, or its own outside the layout, as Settings has -->
  <!-- a mouse user's focus coming back from a menu shouldn't open the tooltip -->
  <UiTooltip ignore-non-keyboard-focus>
    <UiTooltipTrigger as-child>
      <UiButton variant="ghost" size="icon" :aria-label="label" v-bind="$attrs">
        <slot />
      </UiButton>
    </UiTooltipTrigger>
    <UiTooltipContent side="bottom">{{ label }}</UiTooltipContent>
  </UiTooltip>
</template>
