<template>
  <UiCard
    class="flex-col items-start gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="type-small min-w-0">
      <p class="flex items-center gap-x-2 wrap-anywhere [&>svg]:shrink-0">
        <slot />
      </p>

      <div class="mt-1.5 flex flex-wrap items-center gap-3">
        <slot name="details" />
      </div>
    </div>

    <!-- the ghost Button's text lines up with the row's: its padding and border -->
    <div class="-ml-[11px] shrink-0 sm:ml-0">
      <slot name="action" />
    </div>
  </UiCard>
</template>
