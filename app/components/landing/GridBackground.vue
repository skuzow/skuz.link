<template>
  <div class="grid-background" aria-hidden="true" />
</template>

<style scoped>
.grid-background {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.035;
  background-image:
    linear-gradient(currentColor 1px, transparent 1px),
    linear-gradient(90deg, currentColor 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
