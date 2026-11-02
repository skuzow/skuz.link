<script lang="ts" setup>
interface Props {
  date: Date | string;
}

const { date } = defineProps<Props>();

const { locale } = useI18n();
</script>

<template>
  <!-- not d(): the Worker formats in UTC, so a Link created near midnight would fail hydration -->
  <NuxtTime :datetime="date" :locale="locale" date-style="medium" />
</template>
