<script lang="ts" setup>
import type { ClickRange } from '#layers/links/shared/domain/click.type';
import { CLICK_RANGES } from '#layers/links/shared/domain/click.constant';

const range = defineModel<ClickRange>({ required: true });
</script>

<template>
  <!-- the group wraps the list, so its items keep their list; it fills the
       width below md, with 44px targets, and from md is only as wide as its
       labels -->
  <div
    role="group"
    :aria-label="$t('links.statistics.range.label')"
    class="w-full md:w-auto"
  >
    <ul
      class="grid w-full grid-cols-4 border md:inline-grid md:w-auto md:grid-cols-[repeat(4,auto)]"
    >
      <li
        v-for="option in CLICK_RANGES"
        :key="option"
        class="flex not-first:border-l"
      >
        <button
          type="button"
          :aria-label="$t(`links.statistics.range.${option}`)"
          :aria-pressed="option === range"
          :class="[
            'type-chip focus-visible:outline-ring flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 px-3 whitespace-nowrap transition-colors duration-120 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-2 md:min-h-10 md:px-4',
            option === range
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          ]"
          @click="range = option"
        >
          <!-- the lit LED glows in dark only, like every LED -->
          <span
            aria-hidden="true"
            :class="[
              'led',
              option === range
                ? 'text-signal'
                : 'text-border-strong shadow-none!'
            ]"
          />
          <!-- a quarter of a phone's row can't hold "12 months" -->
          <span class="max-sm:hidden">
            {{ $t(`links.statistics.range.${option}`) }}
          </span>
          <span class="sm:hidden">
            {{ $t(`links.statistics.range.short.${option}`) }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
