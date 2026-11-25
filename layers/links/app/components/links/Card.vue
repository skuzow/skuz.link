<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { linkHueStyle } from '#layers/links/app/lib/slugMark';
import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';
import ChartBarIcon from '~icons/pixelarticons/chart-bar';
import CopyIcon from '~icons/pixelarticons/copy';
import MoreHorizontalIcon from '~icons/pixelarticons/more-horizontal';
import PencilIcon from '~icons/pixelarticons/pencil';
import TrashIcon from '~icons/pixelarticons/trash';

const props = defineProps<{
  link: Link;
}>();

const emit = defineEmits<{
  edit: [link: Link];
  delete: [link: Link];
}>();

const { copyShortUrl } = useLinkCopy();

const shortPath = computed(() => `/${props.link.slug}`);
// links, not events, so the Spanish card opens the Spanish Statistics
const statisticsPath = computed(() => `${LINKS_ROUTE}/${props.link.id}`);
const hueStyle = computed(() => linkHueStyle(props.link.slug));
</script>

<template>
  <UiCard class="h-full" :style="hueStyle">
    <UiCardHeader>
      <span class="led text-(color:--link-hue)" />
      <span class="type-eyebrow text-faint-foreground">
        {{ $t('links.card.label') }}
      </span>
      <UiCardAction class="-mr-3 items-stretch self-stretch">
        <UiDropdownMenu>
          <!-- outside the Tooltip's root, or the menu anchors to the Tooltip's popper -->
          <UiDropdownMenuTrigger as-child>
            <SharedIconButton
              :label="$t('links.actions')"
              class="lit-icon border-l-border h-auto w-9 border-0 border-l [--lit-icon-on:var(--link-hue)] focus-visible:-outline-offset-2 data-[state=open]:[--lit-icon-rest:var(--link-hue)] data-[state=open]:[&_svg]:drop-shadow-[0_0_4px_var(--link-hue)]"
            >
              <MoreHorizontalIcon />
            </SharedIconButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="link-hue" :style="hueStyle">
            <UiDropdownMenuGroup>
              <UiDropdownMenuItem @click="copyShortUrl(link.slug)">
                <CopyIcon />
                {{ $t('links.copy') }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem as-child>
                <NuxtLinkLocale :to="statisticsPath">
                  <ChartBarIcon />
                  {{ $t('links.statistics.title') }}
                </NuxtLinkLocale>
              </UiDropdownMenuItem>
              <UiDropdownMenuItem @click="emit('edit', link)">
                <PencilIcon />
                {{ $t('links.edit.button') }}
              </UiDropdownMenuItem>
            </UiDropdownMenuGroup>
            <UiDropdownMenuSeparator />
            <UiDropdownMenuItem
              variant="destructive"
              @click="emit('delete', link)"
            >
              <TrashIcon />
              {{ $t('links.delete.button') }}
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </UiCardAction>
    </UiCardHeader>
    <UiCardContent class="flex-row items-center gap-5">
      <div class="min-w-0 flex-1">
        <UiCardTitle class="truncate">{{ shortPath }}</UiCardTitle>
        <UiCardDescription class="mt-1 truncate">
          {{ link.redirectUrl }}
        </UiCardDescription>
      </div>
      <LinksSlugMark :slug="link.slug" class="size-[55px]" />
    </UiCardContent>
    <UiCardFooter>
      <span class="flex gap-1.5">
        <span class="text-faint-foreground">{{ $t('links.card.clicks') }}</span>
        <NuxtLinkLocale
          :to="statisticsPath"
          :aria-label="
            $t(
              'links.card.statistics',
              { slug: link.slug, clicks: $n(link.clicks) },
              link.clicks
            )
          "
          class="hover:text-signal focus-visible:outline-ring decoration-1 underline-offset-3 transition-colors duration-120 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {{ $n(link.clicks) }}
        </NuxtLinkLocale>
      </span>
      <span class="flex gap-1.5">
        <span class="text-faint-foreground">
          {{ $t('links.card.created') }}
        </span>
        <SharedDate :date="link.createdAt" />
      </span>
    </UiCardFooter>
  </UiCard>
</template>
