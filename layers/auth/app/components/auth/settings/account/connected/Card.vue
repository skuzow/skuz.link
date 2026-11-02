<script lang="ts" setup>
import type { Account } from 'better-auth/types';
import { toast } from 'vue-sonner';
import CalendarIcon from '~icons/pixelarticons/calendar';
import MailIcon from '~icons/pixelarticons/mail';
import UnlinkIcon from '~icons/pixelarticons/unlink';

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
        <MailIcon v-else />
        {{ accountProvider }}
      </p>

      <p class="flex items-center gap-x-2">
        <CalendarIcon />
        <SharedDate :date="account.createdAt" />
      </p>
    </div>

    <UiButton
      class="text-destructive hover:text-destructive"
      variant="ghost"
      :disabled="length === 1"
      :loading="isLoadingDisconnectAccount"
      @click="clickDisconnectAccount"
    >
      <UnlinkIcon />
      {{ $t('auth.settings.account.connected.disconnect') }}
    </UiButton>
  </UiCard>
</template>
