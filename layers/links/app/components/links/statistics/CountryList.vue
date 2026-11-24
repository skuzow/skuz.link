<script lang="ts" setup>
import type { CountryClicks } from '#layers/links/shared/domain/click.type';
import { UNKNOWN_COUNTRY } from '#layers/links/shared/domain/click.country';
import { countryName } from '#layers/links/app/lib/country';

// below lg, the list shows this many until Show all
const FOLDED_AFTER = 6;

const props = defineProps<{
  // most Clicks first, and Unknown last
  countryClicks: CountryClicks[];
  // the top country's Clicks, which fills a meter
  max: number;
}>();

const hovered = defineModel<string | null>('hovered', { required: true });

const { locale } = useI18n();

const showAll = shallowRef(false);

const rows = computed(() =>
  props.countryClicks.map(({ country, clicks }, index) => {
    const isUnknown = country === UNKNOWN_COUNTRY;

    return {
      country,
      clicks,
      isUnknown,
      name: isUnknown ? null : countryName(country, locale.value),
      share: isUnknown || !props.max ? null : (clicks / props.max) * 100,
      isFolded: !showAll.value && index >= FOLDED_AFTER
    };
  })
);
</script>

<template>
  <!-- from lg the list fills the column without adding to its height, so
       the map sets the height and the list scrolls inside it -->
  <div
    class="relative flex min-w-0 flex-col border-t lg:border-t-0 lg:border-l"
  >
    <p
      v-if="!rows.length"
      class="type-chip text-faint-foreground px-4 py-5 leading-4"
    >
      {{ $t('links.statistics.clicks.empty') }}
    </p>
    <ol
      v-else
      :aria-label="$t('links.statistics.countries.list')"
      class="[scrollbar-width:thin] [scrollbar-color:var(--input)_transparent] py-1 lg:absolute lg:inset-0 lg:overflow-y-auto"
    >
      <li
        v-for="row in rows"
        :key="row.country"
        :class="{ 'max-lg:hidden': row.isFolded }"
      >
        <button
          type="button"
          :class="[
            'focus-visible:outline-ring hover:bg-accent hover:text-foreground relative grid min-h-10 w-full cursor-pointer grid-cols-[auto_22px_minmax(0,1fr)_auto] items-center gap-2 px-4 text-left text-sm/[21px] transition-colors duration-120 focus-visible:outline-2 focus-visible:-outline-offset-2',
            row.country === hovered
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground'
          ]"
          @pointerenter="hovered = row.country"
          @pointerleave="hovered = null"
        >
          <span
            aria-hidden="true"
            class="led text-border-strong shadow-none!"
          />
          <span class="type-chip text-faint-foreground">
            {{ row.isUnknown ? '--' : row.country }}
          </span>
          <span
            :class="['truncate', { 'text-faint-foreground': row.isUnknown }]"
          >
            {{ row.name ?? $t('links.statistics.clicks.unknown') }}
          </span>
          <span class="text-foreground font-mono text-[13px]/5 tabular-nums">
            {{ $n(row.clicks) }}
          </span>
          <!-- the share of the top country, under the name -->
          <span
            v-if="row.share !== null"
            aria-hidden="true"
            class="pointer-events-none absolute right-4 bottom-[5px] left-[calc(--spacing(4)+36px)] h-0.5"
          >
            <span
              class="bg-signal block h-full opacity-45"
              :style="{ width: `${row.share}%` }"
            />
          </span>
        </button>
      </li>
    </ol>
    <UiButton
      v-if="rows.length > FOLDED_AFTER"
      variant="link"
      class="mx-4 mb-4 self-start lg:hidden"
      @click="showAll = !showAll"
    >
      {{
        $t(
          showAll
            ? 'links.statistics.countries.showFewer'
            : 'links.statistics.countries.showAll'
        )
      }}
    </UiButton>
  </div>
</template>
