<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { linkHueStyle } from '#layers/links/app/lib/slugMark';
import ArrowRightIcon from '~icons/pixelarticons/arrow-right';
import CopyIcon from '~icons/pixelarticons/copy';

const props = defineProps<{
  link: Link;
  // the tab is hidden, so nothing refreshes
  paused: boolean;
  // the refreshes that have landed
  refreshes: number;
}>();

const { copyShortUrl } = useLinkCopy();

const hueStyle = computed(() => linkHueStyle(props.link.slug));
</script>

<template>
  <UiCard :style="hueStyle">
    <UiCardHeader class="flex-wrap gap-y-1.5 py-1.5">
      <span class="led text-(color:--link-hue)" />
      <span class="type-eyebrow text-faint-foreground">
        {{ $t('links.statistics.title') }}
      </span>
      <LinksStatisticsLive :paused="paused" :refreshes="refreshes" />
    </UiCardHeader>
    <div class="flex min-w-0 items-center gap-5 p-5">
      <div class="min-w-0 flex-1">
        <div class="flex min-w-0 items-center gap-3">
          <h1 class="type-code sm:type-plate min-w-0 truncate">
            <span class="text-faint-foreground">skuz.link/</span>
            <span class="text-signal">{{ link.slug }}</span>
          </h1>
          <UiButton
            variant="secondary"
            size="sm"
            @click="copyShortUrl(link.slug)"
          >
            <CopyIcon />
            {{ $t('links.copy') }}
          </UiButton>
        </div>
        <p class="mt-1.5 flex min-w-0 items-center gap-2">
          <ArrowRightIcon class="text-faint-foreground shrink-0" />
          <span class="type-code text-muted-foreground truncate">
            {{ link.redirectUrl }}
          </span>
        </p>
      </div>
      <LinksSlugMark :slug="link.slug" class="size-[33px] sm:size-[55px]" />
    </div>
    <!-- the readout, under a hairline -->
    <slot />
  </UiCard>
</template>
