<script lang="ts" setup>
import type { CountryClicks } from '#layers/links/shared/domain/click.type';
import { countryName } from '#layers/links/app/lib/country';
import {
  COUNTRY_DOTS,
  MAP_VIEW_BOX,
  mapLegend,
  mapStep,
  mapStepOpacity
} from '#layers/links/app/lib/worldMap';

const props = defineProps<{
  // Unknown has no dots, so it never shows here
  countryClicks: CountryClicks[];
  max: number;
}>();

const hovered = defineModel<string | null>('hovered', { required: true });

const { t, n, locale } = useI18n();

const counts = computed(
  () =>
    new Map(props.countryClicks.map(({ country, clicks }) => [country, clicks]))
);

const countries = computed(() =>
  Object.entries(COUNTRY_DOTS).map(([code, dots]) => {
    const step = mapStep(counts.value.get(code) ?? 0, props.max);

    return {
      code,
      dots,
      opacity: mapStepOpacity(step)
    };
  })
);

const legend = computed(() =>
  mapLegend(props.max).map(({ step, from }) => ({
    opacity: mapStepOpacity(step),
    label: `${n(from)}+`
  }))
);

const mapElement = useTemplateRef('mapElement');
// the country under the pointer on the map, which alone shows the Tooltip;
// hovering a row in the list only lights its dots
const pointed = shallowRef<{ code: string; x: number; y: number } | null>(null);

const tip = computed(() => {
  const code = pointed.value?.code;
  const clicks = code ? counts.value.get(code) : undefined;
  if (!code || !clicks) return null;

  return t(
    'links.statistics.countries.tip',
    { country: countryName(code, locale.value), clicks: n(clicks) },
    clicks
  );
});

// beside the pointer, on its left in the map's right half
const tipStyle = computed(() => {
  const { x = 0, y = 0 } = pointed.value ?? {};
  const width = mapElement.value?.clientWidth ?? 0;

  return x > width / 2
    ? { right: `${width - x + 14}px`, top: `${y + 14}px` }
    : { left: `${x + 14}px`, top: `${y + 14}px` };
});

// a country's dots, and the gaps between them, answer for the country;
// land with no Clicks does nothing
const point = (event: PointerEvent) => {
  const target = event.target instanceof Element ? event.target : null;
  const code = target?.closest('[data-country]')?.getAttribute('data-country');
  const box = mapElement.value?.getBoundingClientRect();

  pointed.value =
    code && counts.value.get(code)
      ? {
          code,
          x: event.clientX - (box?.left ?? 0),
          y: event.clientY - (box?.top ?? 0)
        }
      : null;
  hovered.value = pointed.value?.code ?? null;
};

const leave = () => {
  pointed.value = null;
  hovered.value = null;
};
</script>

<template>
  <div ref="mapElement" class="relative px-4 pt-5 pb-4">
    <!-- the transparent stroke fills the gaps between a country's dots, so
         the pointer never falls through them -->
    <svg
      role="img"
      :aria-label="$t('links.statistics.countries.map')"
      :viewBox="MAP_VIEW_BOX"
      class="block h-auto w-full touch-manipulation"
      shape-rendering="crispEdges"
      @pointerover="point"
      @pointermove="point"
      @pointerleave="leave"
    >
      <path
        v-for="country in countries"
        :key="country.code"
        :data-country="country.code"
        :d="country.dots"
        :fill-opacity="country.code === hovered ? 1 : country.opacity"
        stroke="transparent"
        stroke-width="0.25"
        :class="[
          'transition-[fill,fill-opacity] duration-120',
          country.code === hovered
            ? 'fill-foreground'
            : country.opacity
              ? 'fill-signal'
              : 'fill-border-strong'
        ]"
      />
    </svg>

    <ul
      :aria-label="$t('links.statistics.countries.legend')"
      class="type-chip text-faint-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <li class="inline-flex items-center gap-1.5">
        <span aria-hidden="true" class="bg-border-strong size-[7px]" />
        {{ $t('links.statistics.countries.none') }}
      </li>
      <li
        v-for="step in legend"
        :key="step.label"
        class="inline-flex items-center gap-1.5 tabular-nums"
      >
        <span
          aria-hidden="true"
          class="bg-signal size-[7px]"
          :style="{ opacity: step.opacity }"
        />
        {{ step.label }}
      </li>
    </ul>

    <div
      v-if="tip"
      role="tooltip"
      class="bg-popover text-popover-foreground border-border-strong shadow-popover type-chip pointer-events-none absolute z-3 border px-[9px] py-1.5 whitespace-nowrap"
      :style="tipStyle"
    >
      {{ tip }}
    </div>
  </div>
</template>
