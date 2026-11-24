<script lang="ts" setup>
const { listAuthSessions } = useAuth();

const {
  items: sessions,
  count,
  isLoading,
  isFailed,
  isRetrying,
  refresh
} = useAuthSettingsList('sessions', () => listAuthSessions());
</script>

<template>
  <AuthSettingsPanel
    :count="count"
    :title="$t('auth.settings.sessions.title')"
    live
  >
    <AuthSettingsList
      :failed="isFailed"
      :failure="$t('auth.settings.sessions.failure')"
      :loading="isLoading"
      :retrying="isRetrying"
      @retry="refresh()"
    >
      <ul class="divide-y lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <li v-for="session in sessions" :key="session.id">
          <AuthSettingsSessionsCard
            :session="session"
            @refresh-sessions="refresh()"
          />
        </li>
      </ul>
    </AuthSettingsList>
  </AuthSettingsPanel>
</template>
