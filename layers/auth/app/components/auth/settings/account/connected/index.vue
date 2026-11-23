<script lang="ts" setup>
import { AuthProviderValues } from '#layers/auth/app/constants/auth.constant';

const { listAccounts } = useAuth();

const {
  items: accounts,
  count,
  isLoading,
  isFailed,
  isRetrying,
  refresh
} = useAuthSettingsList('connected-accounts', () => listAccounts());

const accountProviders: ComputedRef<string[] | undefined> = computed(() =>
  accounts.value
    ?.filter((account) => account.providerId !== 'credential')
    .map((account) => account.providerId)
);
</script>

<template>
  <AuthSettingsPanel
    :count="count"
    :title="$t('auth.settings.account.connected.title')"
  >
    <AuthSettingsList
      :failed="isFailed"
      :failure="$t('auth.settings.account.connected.failure')"
      :loading="isLoading"
      :retrying="isRetrying"
      @retry="refresh()"
    >
      <ul class="divide-y">
        <li v-for="account in accounts" :key="account.id">
          <AuthSettingsAccountConnectedCard
            :account="account"
            :length="accounts?.length ?? 0"
            @refresh-accounts="refresh()"
          />
        </li>
      </ul>

      <!-- from lg the panel runs to the bottom of its column, and the foot sits there -->
      <div
        v-if="accountProviders?.length !== AuthProviderValues.length"
        class="mt-auto border-t px-4 py-3"
      >
        <AuthSettingsAccountConnectedDropdown
          :account-providers="accountProviders"
        />
      </div>
    </AuthSettingsList>
  </AuthSettingsPanel>
</template>
