<script lang="ts" setup>
import { toast } from 'vue-sonner';

const localePath = useLocalePath();
const { t: $t } = useI18n();

const { deleteAuthUser } = useAuth();

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

  const { error } = await deleteAuthUser({
    callbackURL: localePath('/')
  });

  isLoadingDeleteAccount.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.account.delete.error'), {
      description: error.message
    });
  } else {
    toast.success($t('toast.auth.settings.account.delete.title'));
  }
};
</script>

<template>
  <UiAccordionItem value="delete-account" class="border-b-transparent">
    <UiAccordionTrigger>
      <h3 class="font-bold">
        {{ $t('auth.settings.account.delete.title') }}
      </h3>
    </UiAccordionTrigger>
    <UiAccordionContent class="flex items-center justify-between pl-2.5">
      <p>{{ $t('auth.settings.account.delete.description') }}</p>

      <UiButton variant="destructive" @click="deleteAccount">
        <IconLoader v-if="isLoadingDeleteAccount" class="mr-2" />
        {{ $t('auth.settings.account.delete.title') }}
      </UiButton>
    </UiAccordionContent>
  </UiAccordionItem>
</template>
