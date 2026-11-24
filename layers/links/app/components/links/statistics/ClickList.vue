<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';

defineProps<{
  clicks: Click[];
}>();

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
    </UiCardHeader>

    <p
      v-if="!clicks.length"
      class="type-chip text-faint-foreground px-4 py-5 leading-4"
    >
      {{ $t('links.statistics.clicks.empty') }}
    </p>

    <!-- below md each Click stacks, and the head stays for screen readers only -->
    <table
      v-else
      class="w-full table-fixed border-collapse text-sm/[21px] max-md:block"
    >
      <colgroup>
        <col class="md:w-44" />
        <col />
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
            {{ $t('links.statistics.clicks.client') }}
          </th>
        </tr>
      </thead>
      <tbody class="max-md:block">
        <LinksStatisticsClickRow
          v-for="click in clicks"
          :key="click.id"
          :click="click"
        />
      </tbody>
    </table>
  </UiCard>
</template>
