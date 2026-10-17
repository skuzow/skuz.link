<script lang="ts" setup>
import { LinkIcon } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    search?: boolean;
  }>(),
  {
    search: false
  }
);

const emit = defineEmits<{
  create: [];
}>();

const { t: $t } = useI18n();

const title = computed(() =>
  props.search ? $t('links.search.empty.title') : $t('links.empty.title')
);
const description = computed(() =>
  props.search
    ? $t('links.search.empty.description')
    : $t('links.empty.description')
);
</script>

<template>
  <UiEmpty class="border border-dashed">
    <UiEmptyHeader>
      <UiEmptyMedia variant="icon">
        <LinkIcon />
      </UiEmptyMedia>
      <UiEmptyTitle>{{ title }}</UiEmptyTitle>
      <UiEmptyDescription>{{ description }}</UiEmptyDescription>
    </UiEmptyHeader>
    <UiEmptyContent v-if="!search">
      <UiButton @click="emit('create')">
        {{ $t('links.empty.button') }}
      </UiButton>
    </UiEmptyContent>
  </UiEmpty>
</template>
