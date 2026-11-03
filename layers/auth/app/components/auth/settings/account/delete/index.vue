<script lang="ts" setup>
import { toast } from 'vue-sonner';
import UserXIcon from '~icons/pixelarticons/user-x';

const { t: $t } = useI18n();

const { deleteAuthUser } = useAuth();

const { closeAuthSettings } = useAuthSettings();

const { alert } = useAlert();

const isLoadingDeleteAccount: Ref<boolean> = ref(false);

const deleteAccount = async () => {
  if (isLoadingDeleteAccount.value) return;

  const response: boolean = await alert({
    title: $t('alert.auth.settings.account.delete.title'),
    description: $t('alert.auth.settings.account.delete.description'),
    danger: true
  });

  if (!response) return;

  isLoadingDeleteAccount.value = true;

  const { error } = await deleteAuthUser();

  isLoadingDeleteAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.delete.error'), {
      description: error.message
    });
  } else {
    closeAuthSettings();
    toast.success($t('toast.auth.settings.account.delete.title'));
  }
};
</script>

<template>
  <UiAccordionItem value="delete-account">
    <UiAccordionTrigger>
      {{ $t('auth.settings.account.delete.title') }}
    </UiAccordionTrigger>
    <UiAccordionContent
      class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{{ $t('auth.settings.account.delete.description') }}</p>

      <UiButton
        variant="destructive"
        :loading="isLoadingDeleteAccount"
        @click="deleteAccount"
      >
        <UserXIcon />
        {{ $t('auth.settings.account.delete.title') }}
      </UiButton>
    </UiAccordionContent>
  </UiAccordionItem>
</template>
