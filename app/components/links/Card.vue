<script lang="ts" setup>
import type { Link } from '#shared/types/link.type';
import {
  CopyIcon,
  MoreHorizontalIcon,
  MousePointerClickIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const props = defineProps<{
  link: Link;
}>();

const emit = defineEmits<{
  edit: [link: Link];
  delete: [link: Link];
}>();

const { t: $t } = useI18n();
const requestURL = useRequestURL();

const shortPath = computed(() => `/${props.link.link}`);
const shortUrl = computed(() => `${requestURL.origin}/${props.link.link}`);

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
              <Trash2Icon />
              {{ $t('links.delete.button') }}
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </UiCardAction>
    </UiCardHeader>
    <UiCardFooter>
      <UiBadge variant="secondary">
        <MousePointerClickIcon />
        {{ $t('links.clicks', { n: link.clicks }) }}
      </UiBadge>
    </UiCardFooter>
  </UiCard>
</template>
