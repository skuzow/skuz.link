<script lang="ts" setup>
import type {
  ClickRange,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';

const props = defineProps<{
  statistics: LinkStatistics;
  range: ClickRange;
  loading: boolean;
}>();

const { t, n } = useI18n();

const figures = computed(() => [
  {
    key: t('links.statistics.figures.rangeClicks', {
      range: t(`links.statistics.range.${props.range}`)
    }),
    value: n(props.statistics.rangeClicks)
  },
  {
    key: t('links.statistics.figures.lifetimeClicks'),
    value: n(props.statistics.clickCount)
  },
  {
    key: t('links.statistics.figures.countries'),
    value: n(props.statistics.countries)
  },
  {
    key: t('links.statistics.figures.topReferrer'),
    value: props.statistics.topReferrer ?? '—',
    isNone: !props.statistics.topReferrer
  }
]);
</script>

<template>
  <!-- two by two below md, split by hairlines -->
  <dl :aria-busy="loading" class="grid grid-cols-2 border-t md:grid-cols-4">
    <div
      v-for="figure in figures"
      :key="figure.key"
      class="flex min-w-0 flex-col gap-2.5 p-4 even:border-l nth-[n+3]:border-t md:px-5 md:not-first:border-l md:nth-[n+3]:border-t-0"
    >
      <dt class="type-chip text-faint-foreground truncate">
        {{ figure.key }}
      </dt>
      <dd
        :class="[
          'truncate font-mono text-xl/6 font-medium tabular-nums',
          figure.isNone ? 'text-faint-foreground' : 'text-foreground'
        ]"
        :title="loading ? undefined : figure.value"
      >
        <UiSkeleton v-if="loading" class="h-6 w-16" />
        <template v-else>{{ figure.value }}</template>
      </dd>
    </div>
  </dl>
</template>
