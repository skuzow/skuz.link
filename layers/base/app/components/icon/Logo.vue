<!-- eslint-disable vue/require-default-prop -->
<script lang="ts" setup>
interface Props {
  size?: 16 | 32 | 48 | 96;
  class?: string;
}

const { size = 16, class: className } = defineProps<Props>();
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="crispEdges"
    aria-hidden="true"
    :class="cn('fill-foreground shrink-0', className)"
  >
    <rect x="4" y="6" width="7" height="2" />
    <rect x="13" y="6" width="7" height="2" />
    <rect x="2" y="8" width="2" height="8" />
    <rect x="20" y="8" width="2" height="8" />
    <rect x="7" y="11" width="10" height="2" />
    <rect x="4" y="16" width="7" height="2" />
    <rect x="13" y="16" width="7" height="2" />
  </svg>
</template>
