<template>
  <span
    aria-hidden="true"
    class="inline-grid size-3.5 shrink-0 grid-cols-[repeat(3,4px)] content-center gap-px"
  >
    <i
      v-for="delay in ['0ms', '200ms', '400ms']"
      :key="delay"
      class="animate-pixel-step size-1 bg-current motion-reduce:animate-none"
      :style="{ animationDelay: delay }"
    />
  </span>
</template>
