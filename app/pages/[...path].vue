<script lang="ts" setup>
const route = useRoute();

throw createError({
  status: 404,
  statusText: `Page not found: ${route.fullPath}`,
  fatal: true
});
</script>

<template>
  <div />
</template>
