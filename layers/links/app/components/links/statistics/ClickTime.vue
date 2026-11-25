<script lang="ts" setup>
const { date } = defineProps<{
  date: Date | string;
}>();

const { locale } = useI18n();

const isMounted = shallowRef(false);
onMounted(() => (isMounted.value = true));

// the year only when it isn't this year; by UTC, so the Worker and the
// browser agree around New Year and hydration holds
const year =
  new Date(date).getUTCFullYear() === new Date().getUTCFullYear()
    ? undefined
    : 'numeric';

// set once mounted: NuxtTime formats its text in the Owner's timezone before
// hydration, but not its title, which the Worker would format in UTC
const fullTime = computed(() =>
  isMounted.value
    ? new Intl.DateTimeFormat(locale.value, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }).format(new Date(date))
    : undefined
);
</script>

<template>
  <!-- not d(): the Worker formats in UTC, so a time would fail hydration -->
  <NuxtTime
    :datetime="date"
    :locale="locale"
    month="short"
    day="numeric"
    :year="year"
    hour="numeric"
    minute="2-digit"
    :title="fullTime"
  />
</template>
