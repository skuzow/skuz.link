<script lang="ts" setup>
import { LinkIcon } from 'lucide-vue-next';

import {
  AuthProviderValues,
  type AuthProvider
} from '#layers/auth/app/constants/auth.constant';

interface Props {
  accountProviders?: string[];
}

const { accountProviders = [] } = defineProps<Props>();

const availableProviders: ComputedRef<AuthProvider[]> = computed(() =>
  AuthProviderValues.filter((provider) => !accountProviders?.includes(provider))
);
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost">
        <LinkIcon :size="16" />
        {{ $t('auth.settings.account.connected.connect') }}
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-44 font-medium">
      <template
        v-for="availableProvider in availableProviders"
        :key="availableProvider"
      >
        <AuthSettingsAccountConnectedDropdownItem
          :provider="availableProvider"
        />
      </template>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
