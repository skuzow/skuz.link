<script lang="ts" setup>
import type { Click } from '#layers/links/shared/domain/click.type';
import { CLICK_OTHER } from '#layers/links/shared/domain/click.constant';

const props = defineProps<{
  click: Click;
}>();

const { t } = useI18n();

// browsers and systems are names; Other and the kinds of device are words
const TRANSLATED_VALUES: Record<string, string> = {
  [CLICK_OTHER]: 'links.statistics.clicks.other',
  Desktop: 'links.statistics.clicks.device.desktop',
  Mobile: 'links.statistics.clicks.device.mobile',
  Tablet: 'links.statistics.clicks.device.tablet'
};

const translate = (value: string | null): string => {
  const key = TRANSLATED_VALUES[value ?? CLICK_OTHER];
  return key ? t(key) : (value ?? '');
};

const label = computed(() =>
  props.click.bot
    ? (props.click.botName ?? t('links.statistics.clicks.unknown'))
    : [props.click.browser, props.click.os, props.click.device]
        .map(translate)
        .join(' · ')
);
</script>

<template>
  <span class="text-muted-foreground flex min-w-0 items-center gap-2">
    <span class="truncate">{{ label }}</span>
    <UiBadge v-if="click.bot" as="span" variant="outline">
      {{ $t('links.statistics.clicks.bot') }}
    </UiBadge>
  </span>
</template>
