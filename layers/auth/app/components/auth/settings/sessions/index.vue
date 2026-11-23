<script lang="ts" setup>
const { listAuthSessions } = useAuth();

const {
  status,
  refresh,
  data: sessions
} = await useLazyAsyncData('sessions', () => listAuthSessions());

// only once the list has loaded, and kept while it reloads after Revoke or Disconnect:
// the count is the number of rows below it
const count: ComputedRef<number | undefined> = computed(() =>
  status.value === 'error' ? undefined : sessions.value?.data?.length
);
</script>

<template>
  <AuthSettingsPanel
    :count="count"
    :title="$t('auth.settings.sessions.title')"
    live
  >
    <div v-if="status === 'pending' && !sessions" class="px-4 py-3">
      <IconLoader />
    </div>

    <ul
      v-else-if="status !== 'error' && sessions?.data"
      class="divide-y lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
    >
      <li v-for="session in sessions.data" :key="session.id">
        <AuthSettingsSessionsCard
          :session="session"
          @refresh-sessions="refresh"
        />
      </li>
    </ul>
  </AuthSettingsPanel>
</template>
