<script lang="ts" setup>
import { toast } from 'vue-sonner';

import {
  authProviderIconMap,
  type AuthProvider
} from '#layers/auth/app/constants/auth.constant';

interface Props {
  provider: AuthProvider;
}

const { provider } = defineProps<Props>();

const { t: $t } = useI18n();

const { connectAccount } = useAuth();

const isLoadingConnectAccount: Ref<boolean> = ref(false);

const clickConnectAccount = async (provider: AuthProvider) => {
  if (isLoadingConnectAccount.value) return;

  isLoadingConnectAccount.value = true;

  const { error } = await connectAccount({ provider });

  isLoadingConnectAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.connected.connect.error'), {
      description: error.message
    });
  }
};
</script>

<template>
  <UiDropdownMenuItem @click="clickConnectAccount(provider)">
    <IconLoader v-if="isLoadingConnectAccount" />
    <component :is="authProviderIconMap[provider]" v-else />
    <span>{{ titleCase(provider) }}</span>
  </UiDropdownMenuItem>
</template>
