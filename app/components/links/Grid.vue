<script lang="ts" setup>
import type { Link } from '#shared/types/link.type';
import { LINKS_GRID_ITEM_CLASS, LINKS_GRID_LIST_CLASS } from './grid-layout';

defineProps<{
  links: Link[];
}>();

const emit = defineEmits<{
  edit: [link: Link];
  delete: [link: Link];
}>();
</script>

<template>
  <div class="@container">
    <ul :class="LINKS_GRID_LIST_CLASS">
      <li v-for="link in links" :key="link.id" :class="LINKS_GRID_ITEM_CLASS">
        <LinksCard
          :link="link"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </li>
    </ul>
  </div>
</template>
