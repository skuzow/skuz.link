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
  <div class="flex flex-col gap-6">
    <LinksSkeleton v-if="pending && !hasLinks" />

    <template v-else-if="!hasLinks">
      <LinksEmpty @create="openCreate" />
    </template>

    <template v-else>
      <LinksToolbar v-model:search-query="searchQuery" @create="openCreate" />
      <LinksGrid
        v-if="hasFilteredLinks"
        :links="filteredLinks"
        @edit="openEdit"
        @delete="deleteLink"
      />
      <LinksEmpty v-else search />
    </template>

    <LinksFormDialog
      v-model:open="isFormOpen"
      :link="editingLink"
      @success="onFormSuccess"
    />
  </div>
</template>
