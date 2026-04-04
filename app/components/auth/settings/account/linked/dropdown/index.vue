<script lang="ts" setup>
import { LinkIcon } from 'lucide-vue-next';

import {
  AuthProviderValues,
  type AuthProvider
} from '@/constants/auth.constant';

interface Props {
  accountProviders?: string[];
}

const { accountProviders = [] } = defineProps<Props>();

const unlinkedProviders: ComputedRef<AuthProvider[]> = computed(() =>
  AuthProviderValues.filter((provider) => !accountProviders?.includes(provider))
);
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" class="gap-x-2">
        <LinkIcon :size="16" />
        {{ $t('auth.settings.account.linked.link') }}
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-44 font-medium">
      <template
        v-for="unlinkedProvider in unlinkedProviders"
        :key="unlinkedProvider"
      >
        <AuthSettingsAccountLinkedDropdownItem :provider="unlinkedProvider" />
      </template>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
