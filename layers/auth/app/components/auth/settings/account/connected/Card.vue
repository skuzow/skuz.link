<script lang="ts" setup>
import type { Account } from 'better-auth/types';
import { MailIcon, CalendarIcon, UnlinkIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { authProviderIconMap } from '#layers/auth/app/constants/auth.constant';

interface Props {
  account: Account;
  length: number;
}

const { account, length } = defineProps<Props>();

const emit = defineEmits(['refresh-accounts']);

const { t: $t } = useI18n();

const { disconnectAccount } = useAuth();

const isLoadingDisconnectAccount: Ref<boolean> = ref(false);

const accountProvider: string =
  account.providerId === 'credential'
    ? $t('auth.settings.account.connected.credential')
    : titleCase(account.providerId);

const clickDisconnectAccount = async () => {
  if (isLoadingDisconnectAccount.value) return;

  isLoadingDisconnectAccount.value = true;

  const { error } = await disconnectAccount({
    accountId: account.id
  });

  isLoadingDisconnectAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.connected.disconnect.error'), {
      description: error.message
    });
  } else {
    toast.success(
      $t('toast.auth.settings.account.connected.disconnect.title'),
      {
        description: accountProvider
      }
    );

    emit('refresh-accounts');
  }
};
</script>

<template>
  <UiCard class="flex flex-row items-center justify-between p-3">
    <div>
      <p class="flex items-center gap-x-2">
        <component
          :is="authProviderIconMap[account.providerId]"
          v-if="authProviderIconMap[account.providerId]"
        />
        <MailIcon v-else :size="16" />
        {{ accountProvider }}
      </p>

      <p class="flex items-center gap-x-2">
        <CalendarIcon :size="16" />
        <SharedDate :date="account.createdAt" />
      </p>
    </div>

    <UiButton
      class="text-destructive hover:text-destructive"
      variant="ghost"
      :disabled="length === 1"
      @click="clickDisconnectAccount"
    >
      <IconLoader v-if="isLoadingDisconnectAccount" class="fill-destructive" />
      <UnlinkIcon v-else :size="16" />
      {{ $t('auth.settings.account.connected.disconnect') }}
    </UiButton>
  </UiCard>
</template>
