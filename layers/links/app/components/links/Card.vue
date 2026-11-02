<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { toast } from 'vue-sonner';
import { slugMark } from '#layers/links/app/lib/slugMark';
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

const { t: $t } = useI18n();
const requestURL = useRequestURL();

const shortPath = computed(() => `/${props.link.slug}`);
const shortUrl = computed(() => `${requestURL.origin}/${props.link.slug}`);
const hueStyle = computed(() => ({
  '--link-hue': `var(--${slugMark(props.link.slug).hue})`
}));

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);

    toast.success($t('toast.links.copy.title'), {
      description: shortUrl.value
    });
  } catch {
    toast.error($t('toast.links.error'));
  }
};
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
              <UiDropdownMenuItem @click="copyLink">
                <CopyIcon />
                {{ $t('links.copy') }}
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
        <span>{{ $n(link.clicks) }}</span>
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
