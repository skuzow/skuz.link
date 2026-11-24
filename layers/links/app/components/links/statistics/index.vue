<script lang="ts" setup>
import type {
  Click,
  ClickRange,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';
import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';

defineProps<{
  link: Link;
  statistics: LinkStatistics;
  clicks: Click[];
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}>();

defineEmits<{ loadMore: [] }>();

const range = defineModel<ClickRange>('range', { required: true });
</script>

<template>
  <div class="flex flex-col gap-3">
    <UiButton variant="link" as-child class="mb-3 self-start">
      <NuxtLinkLocale :to="LINKS_ROUTE">
        <ArrowLeftIcon />
        {{ $t('links.statistics.back') }}
      </NuxtLinkLocale>
    </UiButton>

    <LinksStatisticsSummary :link="link">
      <LinksStatisticsReadout
        :statistics="statistics"
        :range="range"
        :loading="loading"
      />
    </LinksStatisticsSummary>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <LinksStatisticsRangeSwitcher v-model="range" />
    </div>

    <LinksStatisticsClickList
      :clicks="clicks"
      :total="statistics.rangeClicks"
      :has-more="hasMore"
      :loading="loading"
      :loading-more="loadingMore"
      @load-more="$emit('loadMore')"
    />
  </div>
</template>
