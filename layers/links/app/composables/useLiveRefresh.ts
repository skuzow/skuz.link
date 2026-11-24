import { useDocumentVisibility, useIntervalFn, useMounted } from '@vueuse/core';

import { STATISTICS_REFRESH_MS } from '#layers/links/app/constants/links.constant';

// calls refresh every 30 seconds while the tab shows, and at once when it
// shows again; nothing runs while it's hidden. Call it where the component's
// scope is active, so the interval stops with the component
export const useLiveRefresh = (refresh: () => Promise<void>) => {
  const visibility = useDocumentVisibility();
  // the server can't tell, so the page reads Live until it mounts and
  // hydration holds
  const isMounted = useMounted();
  const isPaused = computed(
    () => isMounted.value && visibility.value === 'hidden'
  );

  const { pause, resume } = useIntervalFn(refresh, STATISTICS_REFRESH_MS, {
    immediate: false
  });

  onMounted(() => {
    if (!isPaused.value) resume();
  });

  watch(isPaused, (paused) => {
    if (paused) return pause();

    void refresh();
    resume();
  });

  return { isPaused };
};
