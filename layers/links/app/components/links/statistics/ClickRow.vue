<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';
import {
  UNKNOWN_COUNTRY,
  toCountryKey
} from '#layers/links/shared/domain/click.country';
import { countryName } from '#layers/links/app/lib/country';

const props = defineProps<{
  click: Click;
  // brought in by the last refresh, so it flashes once
  fresh: boolean;
}>();

const { locale } = useI18n();

const country = computed(() => toCountryKey(props.click.country));
const isUnknown = computed(() => country.value === UNKNOWN_COUNTRY);
const name = computed(() => countryName(country.value, locale.value));
</script>

<template>
  <!-- the cells flash in a table; below md the row is a flex box, so it
       flashes whole and the gaps between its cells flash too -->
  <tr
    :class="[
      'border-b last:border-b-0 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-4 max-md:py-3',
      fresh && 'max-md:animate-click-flash md:*:animate-click-flash'
    ]"
  >
    <td
      class="text-muted-foreground truncate px-3 py-2.5 pl-4 font-mono text-[13px]/[21px] tabular-nums max-md:block max-md:w-32 max-md:flex-none max-md:p-0"
    >
      <LinksStatisticsClickTime :date="click.createdAt" />
    </td>
    <!-- below md, Where fills the first line so From starts the second -->
    <td
      class="truncate px-3 py-2.5 max-md:block max-md:min-w-0 max-md:grow max-md:basis-[calc(100%-8rem-0.75rem)] max-md:p-0"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span
          class="type-chip text-faint-foreground"
          :title="isUnknown ? undefined : name"
        >
          {{ isUnknown ? '--' : country }}
        </span>
        <span v-if="isUnknown" class="text-faint-foreground truncate">
          {{ $t('links.statistics.clicks.unknown') }}
        </span>
        <!-- one line, so no space slips in before the comma -->
        <!-- prettier-ignore -->
        <span v-else class="truncate">{{ click.city ?? name }}<span v-if="click.region" class="text-muted-foreground">, {{ click.region }}</span></span>
      </span>
    </td>
    <td
      class="truncate px-3 py-2.5 max-md:block max-md:max-w-[45%] max-md:flex-none max-md:p-0"
    >
      <span v-if="click.referrer" class="font-mono text-[13px]/[21px]">
        {{ click.referrer }}
      </span>
      <span v-else class="text-faint-foreground">
        {{ $t('links.statistics.clicks.direct') }}
      </span>
    </td>
    <td
      class="truncate px-3 py-2.5 pr-4 max-md:block max-md:min-w-0 max-md:flex-1 max-md:p-0"
    >
      <LinksStatisticsClickClient :click="click" />
    </td>
  </tr>
</template>
