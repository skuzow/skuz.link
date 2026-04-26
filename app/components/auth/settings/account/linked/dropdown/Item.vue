<script lang="ts" setup>
import { toast } from 'vue-sonner';

import {
  authProviderIconMap,
  type AuthProvider
} from '@/constants/auth.constant';

interface Props {
  provider: AuthProvider;
}

const { provider } = defineProps<Props>();

const { t: $t } = useI18n();

const { linkAccount } = useAuth();

const isLoadingLinkAccount: Ref<boolean> = ref(false);

const clickLinkAccount = async (provider: AuthProvider) => {
  if (isLoadingLinkAccount.value) return;

  isLoadingLinkAccount.value = true;

  const { error } = await linkAccount({ provider });

  isLoadingLinkAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.linked.link.error'), {
      description: error.message
    });
  }
};
</script>

<template>
  <UiDropdownMenuItem class="gap-2" @click="clickLinkAccount(provider)">
    <IconLoader v-if="isLoadingLinkAccount" />
    <component :is="authProviderIconMap[provider]" v-else />
    <span>{{ titleCase(provider) }}</span>
  </UiDropdownMenuItem>
</template>
