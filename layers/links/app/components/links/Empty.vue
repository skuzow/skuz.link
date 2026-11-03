<script lang="ts" setup>
import PlusIcon from '~icons/pixelarticons/plus';

const emit = defineEmits<{
  create: [];
}>();
</script>

<template>
  <!-- the extra top padding below md balances the layout's bottom margin on main -->
  <div
    class="flex min-h-90 flex-1 flex-col items-center justify-center gap-6 px-4 pt-12 pb-8 text-center md:pt-8"
  >
    <!-- not an input: anyone who tries to type lands in Create link, and the Button is the keyboard's path -->
    <div
      class="bg-card border-border-strong hover:border-input flex max-w-full cursor-pointer items-center gap-px border px-5 py-4"
      aria-hidden="true"
      @click="emit('create')"
    >
      <span class="type-code sm:type-plate text-faint-foreground">
        skuz.link/
      </span>
      <span
        class="bg-signal animate-cursor-blink h-4.5 w-2 flex-none motion-reduce:animate-none sm:h-7 sm:w-3.5"
      />
    </div>

    <div class="flex flex-col items-center gap-2">
      <h1 class="type-subtitle">{{ $t('links.empty.title') }}</h1>
      <p class="type-small text-muted-foreground">
        {{ $t('links.empty.description') }}
      </p>
    </div>

    <UiButton size="lg" @click="emit('create')">
      <PlusIcon data-icon="inline-start" />
      {{ $t('links.empty.button') }}
    </UiButton>
  </div>
</template>
