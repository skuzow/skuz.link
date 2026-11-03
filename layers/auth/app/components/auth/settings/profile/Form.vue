<script lang="ts" setup>
import CheckIcon from '~icons/pixelarticons/check';
import CloseIcon from '~icons/pixelarticons/close';

import { AuthFormInput } from '#layers/auth/app/constants/form.constant';

defineEmits(['close-update-profile']);

const { authUser } = useAuth();

const { isLoadingUpdateProfile, updateProfile, closeUpdateProfile } =
  useAuthUpdateProfile();
</script>

<template>
  <form class="flex items-start gap-3" @submit="updateProfile">
    <UserAvatar
      class="bg-accent text-accent-foreground"
      size="sm"
      :width="40"
      :height="40"
      loading="eager"
      :user="authUser"
    />

    <div class="flex min-w-0 flex-1 flex-col gap-6">
      <UiFormField v-slot="{ componentField }" :name="AuthFormInput.NAME">
        <UiFormItem>
          <UiFormLabel>{{ $t('form.name') }}</UiFormLabel>
          <UiFormControl>
            <UiInput
              type="text"
              :placeholder="authUser?.name"
              v-bind="componentField"
            />
          </UiFormControl>
          <UiFormMessage />
        </UiFormItem>
      </UiFormField>

      <UiDialogFooter>
        <UiButton type="button" variant="secondary" @click="closeUpdateProfile">
          <CloseIcon data-icon="inline-start" />
          {{ $t('cancel') }}
        </UiButton>

        <UiButton type="submit" :loading="isLoadingUpdateProfile">
          <CheckIcon data-icon="inline-start" />
          {{ $t('save') }}
        </UiButton>
      </UiDialogFooter>
    </div>
  </form>
</template>
