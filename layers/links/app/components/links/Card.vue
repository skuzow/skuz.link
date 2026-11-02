<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { toast } from 'vue-sonner';
import CopyIcon from '~icons/pixelarticons/copy';
import MoreHorizontalIcon from '~icons/pixelarticons/more-horizontal';
import PencilIcon from '~icons/pixelarticons/pencil';
import PointerIcon from '~icons/pixelarticons/pointer';
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
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle class="truncate">{{ shortPath }}</UiCardTitle>
      <UiCardDescription class="truncate">
        {{ link.redirectUrl }}
      </UiCardDescription>
      <UiCardAction>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost"
              size="icon"
              :aria-label="$t('links.actions')"
            >
              <MoreHorizontalIcon />
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end">
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
    <UiCardFooter>
      <UiBadge variant="secondary">
        <PointerIcon />
        {{ $t('links.clicks', { n: link.clicks }) }}
      </UiBadge>
    </UiCardFooter>
  </UiCard>
</template>
