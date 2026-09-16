<script lang="ts" setup>
import { LinkIcon } from 'lucide-vue-next';

withDefaults(
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
</script>

<template>
  <UiEmpty class="border border-dashed">
    <UiEmptyHeader>
      <UiEmptyMedia variant="icon">
        <LinkIcon />
      </UiEmptyMedia>
      <UiEmptyTitle>
        {{ search ? $t('links.search.empty.title') : $t('links.empty.title') }}
      </UiEmptyTitle>
      <UiEmptyDescription>
        {{
          search
            ? $t('links.search.empty.description')
            : $t('links.empty.description')
        }}
      </UiEmptyDescription>
    </UiEmptyHeader>
    <UiEmptyContent v-if="!search">
      <UiButton @click="emit('create')">
        {{ $t('links.empty.button') }}
      </UiButton>
    </UiEmptyContent>
  </UiEmpty>
</template>
