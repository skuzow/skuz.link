<script lang="ts" setup>
import type { Account } from 'better-auth/types';
import { MailIcon, CalendarIcon, UnlinkIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { authProviderIconMap } from '@/constants/auth.constant';

interface Props {
  account: Account;
  length: number;
}

const { account, length } = defineProps<Props>();

const emit = defineEmits(['refresh-accounts']);

const { t: $t } = useI18n();

const { unlinkAccount } = useAuth();

const isLoadingUnlinkAccount: Ref<boolean> = ref(false);

const accountProvider: string =
  account.providerId === 'credential'
    ? $t('auth.settings.account.linked.credential')
    : titleCase(account.providerId);

const clickUnlinkAccount = async () => {
  if (isLoadingUnlinkAccount.value) return;

  isLoadingUnlinkAccount.value = true;

  const { error } = await unlinkAccount({
    providerId: account.providerId
  });

  isLoadingUnlinkAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.linked.unlink.error'), {
      description: error.message
    });
  } else {
    toast.success($t('toast.auth.settings.account.linked.unlink.title'), {
      description: accountProvider
    });

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
      class="text-destructive hover:text-destructive gap-x-2"
      variant="ghost"
      :disabled="length === 1"
      @click="clickUnlinkAccount"
    >
      <IconLoader v-if="isLoadingUnlinkAccount" class="fill-destructive" />
      <UnlinkIcon v-else :size="16" />
      {{ $t('auth.settings.account.linked.button') }}
    </UiButton>
  </UiCard>
</template>
