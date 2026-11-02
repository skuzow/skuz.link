<script lang="ts" setup>
import PlugIcon from '~icons/pixelarticons/plug';

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
        <PlugIcon />
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
