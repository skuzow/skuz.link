<script lang="ts" setup>
import type { Link } from '#shared/types/link.type';

defineProps<{
  links: Link[];
}>();

const emit = defineEmits<{
  edit: [link: Link];
  delete: [link: Link];
}>();
</script>

<template>
  <ul
    class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(16rem,calc((100%-2*1rem)/3))),1fr))] gap-4"
  >
    <li v-for="link in links" :key="link.id">
      <LinksCard
        :link="link"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </li>
  </ul>
</template>
