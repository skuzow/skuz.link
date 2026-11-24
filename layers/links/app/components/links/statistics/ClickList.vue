<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';
import ChevronDownIcon from '~icons/pixelarticons/chevron-down';

defineProps<{
  clicks: Click[];
  // the Clicks in the range, of which these are the first
  total: number;
  // whether another page follows the Clicks shown
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}>();

defineEmits<{ loadMore: [] }>();

const HEADER_CLASS =
  'type-chip text-faint-foreground border-border-strong border-b px-3 py-2.5 text-left leading-4 first:pl-4 last:pr-4';
</script>

<template>
  <UiCard>
    <UiCardHeader class="flex-wrap gap-y-1.5 py-1.5">
      <span class="led text-signal" />
      <h2 class="type-eyebrow text-faint-foreground">
        {{ $t('links.statistics.clicks.title') }}
      </h2>
      <span
        v-if="!loading && clicks.length"
        class="type-chip text-muted-foreground ml-auto whitespace-nowrap"
      >
        {{
          $t('links.statistics.clicks.shown', {
            shown: $n(clicks.length),
            total: $n(total)
          })
        }}
      </span>
    </UiCardHeader>

    <p
      v-if="!loading && !clicks.length"
      class="type-chip text-faint-foreground px-4 py-5 leading-4"
    >
      {{ $t('links.statistics.clicks.empty') }}
    </p>

    <!-- below md each Click stacks, and the head stays for screen readers only -->
    <table
      v-else
      :aria-busy="loading"
      class="w-full table-fixed border-collapse text-sm/[21px] max-md:block"
    >
      <colgroup>
        <col class="md:w-44" />
        <col />
        <col class="md:w-[22%]" />
        <col class="md:w-[30%]" />
      </colgroup>
      <thead class="max-md:sr-only">
        <tr>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.time') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.where') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.from') }}
          </th>
          <th scope="col" :class="HEADER_CLASS">
            {{ $t('links.statistics.clicks.client') }}
          </th>
        </tr>
      </thead>
      <tbody class="max-md:block">
        <template v-if="loading">
          <tr
            v-for="index in 4"
            :key="index"
            class="border-b last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-4 max-md:py-3"
          >
            <td
              v-for="cell in 4"
              :key="cell"
              class="px-3 py-2.5 first:pl-4 last:pr-4 max-md:block max-md:p-0 max-md:not-first:min-w-0 max-md:not-first:flex-1 max-md:first:w-32 max-md:first:flex-none"
            >
              <UiSkeleton class="h-3 w-[70%]" />
            </td>
          </tr>
        </template>
        <template v-else>
          <LinksStatisticsClickRow
            v-for="click in clicks"
            :key="click.id"
            :click="click"
          />
        </template>
      </tbody>
    </table>

    <div
      v-if="!loading && hasMore"
      class="flex items-center gap-3 border-t px-4 py-3"
    >
      <UiButton
        variant="outline"
        :aria-busy="loadingMore"
        @click="$emit('loadMore')"
      >
        <ChevronDownIcon />
        {{ $t('links.statistics.clicks.loadMore') }}
      </UiButton>
    </div>
  </UiCard>
</template>
