<script lang="ts" setup>
import { PlusIcon, SearchIcon } from 'lucide-vue-next';

const searchQuery = defineModel<string>('searchQuery', { required: true });

const emit = defineEmits<{
  create: [];
}>();
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <UiInputGroup class="flex-1">
      <UiInputGroupAddon>
        <SearchIcon />
      </UiInputGroupAddon>
      <UiInputGroupInput
        type="search"
        :placeholder="$t('links.search.placeholder')"
        :model-value="searchQuery"
        @update:model-value="searchQuery = String($event)"
      />
    </UiInputGroup>

    <UiButton class="shrink-0" @click="emit('create')">
      <PlusIcon data-icon="inline-start" />
      {{ $t('links.create.button') }}
    </UiButton>
  </div>
</template>
