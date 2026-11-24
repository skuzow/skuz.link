<!-- eslint-disable vue/require-default-prop -->
<script lang="ts" setup>
interface Props {
  title: string;
  count?: number;
  live?: boolean;
}

const { title, count, live = false } = defineProps<Props>();

const headingId: string = useId();
</script>

<template>
  <!-- a section named by its heading, so screen readers can jump between panels -->
  <section
    :aria-labelledby="headingId"
    class="bg-card text-card-foreground flex min-w-0 flex-none flex-col border"
  >
    <UiCardHeader>
      <span v-if="live" class="led text-signal" />
      <h3 :id="headingId" class="type-eyebrow text-faint-foreground">
        {{ title }}
      </h3>
      <span
        v-if="count !== undefined"
        class="type-chip text-muted-foreground ml-auto"
      >
        {{ $n(count) }}
      </span>
    </UiCardHeader>

    <slot />
  </section>
</template>
