<script lang="ts" setup>
const {
  pending,
  searchQuery,
  isFormOpen,
  editingLink,
  filteredLinks,
  hasLinks,
  hasFilteredLinks,
  openCreate,
  openEdit,
  onFormSuccess,
  deleteLink
} = await useLinks();
</script>

<template>
  <div class="flex h-full flex-col gap-6">
    <LinksSkeleton v-if="pending && !hasLinks" />

    <LinksEmpty v-else-if="!hasLinks" @create="openCreate" />

    <template v-else>
      <LinksToolbar v-model:search-query="searchQuery" @create="openCreate" />
      <LinksGrid
        v-if="hasFilteredLinks"
        :links="filteredLinks"
        @edit="openEdit"
        @delete="deleteLink"
      />
      <!-- here before the results change, or screen readers miss the message -->
      <p class="sr-only" aria-live="polite">
        {{ hasFilteredLinks ? '' : $t('links.search.empty.title') }}
      </p>
    </template>

    <LinksFormDialog
      v-model:open="isFormOpen"
      :link="editingLink"
      @success="onFormSuccess"
    />
  </div>
</template>
