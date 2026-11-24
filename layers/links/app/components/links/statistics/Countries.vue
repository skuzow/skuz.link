<script lang="ts" setup>
import type { LinkStatistics } from '#layers/links/shared/domain/click.type';
import { UNKNOWN_COUNTRY } from '#layers/links/shared/domain/click.country';

const props = defineProps<{
  statistics: LinkStatistics;
}>();

// the country under the pointer, on the map or in the list
const hovered = shallowRef<string | null>(null);

const placed = computed(() =>
  props.statistics.countryClicks.filter(
    ({ country }) => country !== UNKNOWN_COUNTRY
  )
);

// most Clicks first, and Unknown last whatever its count
const countryClicks = computed(() => [
  ...placed.value,
  ...props.statistics.countryClicks.filter(
    ({ country }) => country === UNKNOWN_COUNTRY
  )
]);

// the most Clicks of a placed country, which sets the top step and meter
const max = computed(() =>
  Math.max(0, ...placed.value.map(({ clicks }) => clicks))
);
</script>

<template>
  <UiCard>
    <UiCardHeader class="flex-wrap gap-y-1.5 py-1.5">
      <h2 class="type-eyebrow text-faint-foreground">
        {{ $t('links.statistics.countries.title') }}
      </h2>
      <span class="type-chip text-muted-foreground ml-auto whitespace-nowrap">
        {{
          $t(
            'links.statistics.countries.count',
            { count: $n(statistics.countries) },
            statistics.countries
          )
        }}
      </span>
    </UiCardHeader>
    <!-- from lg the list is a column beside the map, as tall as the map -->
    <div class="grid lg:grid-cols-[minmax(0,1fr)_288px]">
      <LinksStatisticsCountryMap
        v-model:hovered="hovered"
        :country-clicks="countryClicks"
        :max="max"
      />
      <LinksStatisticsCountryList
        v-model:hovered="hovered"
        :country-clicks="countryClicks"
        :max="max"
      />
    </div>
  </UiCard>
</template>
