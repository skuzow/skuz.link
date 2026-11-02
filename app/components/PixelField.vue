<script lang="ts" setup>
import {
  useDocumentVisibility,
  useIntersectionObserver,
  usePreferredReducedMotion,
  useRafFn,
  useResizeObserver
} from '@vueuse/core';

import { cn } from '#layers/base/app/lib/utils';

interface Props {
  variant: 'landing' | 'login';
}

interface Cell {
  x: number;
  y: number;
  seed: number;
  pace: number;
  step: number;
}

const { variant } = defineProps<Props>();

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const TICK_MS = 1000 / 12;

const canvas = useTemplateRef('canvas');
const colorMode = useColorMode();
const visibility = useDocumentVisibility();
const reducedMotion = usePreferredReducedMotion();
const isOnScreen = ref(false);

let cells: Cell[] = [];
let tick = 0;
let sinceTick = 0;

const hash = (x: number, y: number, step: number) =>
  Math.abs(Math.sin(x * 12.9898 + y * 78.233 + step * 37.719) * 43758.5453) % 1;

const buildCells = (width: number, height: number) => {
  const built: Cell[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const density =
        0.25 + 0.6 * (0.5 + 0.5 * Math.sin(x * 0.09 + Math.sin(y * 0.07) * 2));
      const threshold = BAYER[(y % 4) * 4 + (x % 4)]! / 16;
      if (density <= threshold) continue;

      const seed = hash(x, y, 0);
      built.push({ x, y, seed, pace: 14 + Math.floor(26 * seed), step: -1 });
    }
  }

  return built;
};

const paint = () => {
  const context = canvas.value?.getContext('2d');
  if (!context) return;

  for (const cell of cells) {
    const step = Math.floor((tick + cell.seed * 90) / cell.pace);
    if (step === cell.step) continue;
    cell.step = step;

    const brightness = hash(cell.x, cell.y, step);
    context.clearRect(cell.x, cell.y, 1, 1);
    context.globalAlpha = 0.1 + 0.75 * brightness * brightness;
    context.fillRect(cell.x, cell.y, 1, 1);
  }
};

const rebuild = () => {
  const element = canvas.value;
  const context = element?.getContext('2d');
  if (!element || !context) return;

  const { width, height } = element.getBoundingClientRect();
  // dropped by its breakpoint, and it rebuilds when it comes back
  if (!width || !height) return;

  const style = getComputedStyle(element);
  const cellSize = parseFloat(style.getPropertyValue('--pixel-cell'));
  element.width = Math.ceil(width / cellSize);
  element.height = Math.ceil(height / cellSize);
  // resizing a canvas resets its context, so the colour goes on after
  context.fillStyle = style.getPropertyValue('--signal').trim();
  cells = buildCells(element.width, element.height);
  paint();
};

const { pause, resume } = useRafFn(
  ({ delta }) => {
    // an accumulator, as fpsLimit loses frames to jitter and settles at 10fps
    sinceTick += delta;
    if (sinceTick < TICK_MS) return;

    sinceTick -= TICK_MS;
    tick++;
    paint();
  },
  { immediate: false }
);

// fires once on observing, which is the first build
useResizeObserver(canvas, rebuild);
useIntersectionObserver(canvas, ([entry]) => {
  isOnScreen.value = entry?.isIntersecting ?? false;
});

watch(() => colorMode.value, rebuild, { flush: 'post' });

watch(
  () =>
    isOnScreen.value &&
    visibility.value === 'visible' &&
    reducedMotion.value !== 'reduce',
  (shouldRun) => (shouldRun ? resume() : pause())
);
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    :class="
      cn(
        'pointer-events-none absolute inset-0 -z-1 size-full opacity-60 [image-rendering:pixelated]',
        variant === 'landing' &&
          'mask-[linear-gradient(to_right,transparent_30%,black_62%)] max-lg:mask-[linear-gradient(to_bottom,transparent_50%,black_76%)]',
        variant === 'login' &&
          'mask-[linear-gradient(to_right,transparent_45%,black_72%)] max-md:hidden'
      )
    "
  />
</template>
