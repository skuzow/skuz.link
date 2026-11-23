<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';
import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';

defineProps<{
  link: Link;
  clicks: Click[];
}>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <UiButton variant="link" as-child class="mb-3 self-start">
      <NuxtLinkLocale :to="LINKS_ROUTE">
        <ArrowLeftIcon />
        {{ $t('links.statistics.back') }}
      </NuxtLinkLocale>
    </UiButton>

    <LinksStatisticsSummary :link="link" />

    <LinksStatisticsClickList :clicks="clicks" />
  </div>
</template>
