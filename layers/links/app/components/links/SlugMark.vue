<script lang="ts" setup>
import { slugMark } from '#layers/links/app/lib/slugMark';

const props = defineProps<{
  slug: string;
}>();

const mark = computed(() => slugMark(props.slug));
</script>

<template>
  <svg
    class="block flex-none"
    viewBox="0 0 5 5"
    fill="currentColor"
    shape-rendering="crispEdges"
    aria-hidden="true"
    :style="{ color: `var(--${mark.hue})` }"
  >
    <rect
      v-for="[x, y] in mark.cells"
      :key="`${x},${y}`"
      :x="x"
      :y="y"
      width="1"
      height="1"
    />
  </svg>
</template>
