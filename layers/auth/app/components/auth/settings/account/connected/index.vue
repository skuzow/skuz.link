<script lang="ts" setup>
import { AuthProviderValues } from '#layers/auth/app/constants/auth.constant';

const { listAccounts } = useAuth();

const {
  status,
  refresh,
  data: accounts
} = await useLazyAsyncData('connected-accounts', () => listAccounts());

// only once the list has loaded, and kept while it reloads after Revoke or Disconnect:
// the count is the number of rows below it
const count: ComputedRef<number | undefined> = computed(() =>
  status.value === 'error' ? undefined : accounts.value?.data?.length
);

const accountProviders: ComputedRef<string[] | undefined> = computed(() =>
  accounts.value?.data
    ?.filter((account) => account.providerId !== 'credential')
    .map((account) => account.providerId)
);
</script>

<template>
  <AuthSettingsPanel
    :count="count"
    :title="$t('auth.settings.account.connected.title')"
  >
    <div v-if="status === 'pending' && !accounts" class="px-4 py-3">
      <IconLoader />
    </div>

    <template v-else-if="status !== 'error' && accounts?.data">
      <ul class="divide-y">
        <li v-for="account in accounts.data" :key="account.id">
          <AuthSettingsAccountConnectedCard
            :account="account"
            :length="accounts.data.length"
            @refresh-accounts="refresh"
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
    </template>
  </AuthSettingsPanel>
</template>
