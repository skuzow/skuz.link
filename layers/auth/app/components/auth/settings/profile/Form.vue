<script lang="ts" setup>
import CheckIcon from '~icons/pixelarticons/check';
import CloseIcon from '~icons/pixelarticons/close';

import { AuthFormInput } from '#layers/auth/app/constants/form.constant';

defineEmits(['close-update-profile']);

const { authUser } = useAuth();

const { isLoadingUpdateProfile, updateProfile, closeUpdateProfile } =
  useAuthUpdateProfile();

const nameInput = useTemplateRef('nameInput');

// the form replaces Update profile, so focus follows it into Name
onMounted(() => nameInput.value?.$el.focus());
</script>

<template>
  <form class="flex flex-col gap-5" @submit="updateProfile">
    <UiFormField v-slot="{ componentField }" :name="AuthFormInput.NAME">
      <UiFormItem>
        <UiFormLabel>{{ $t('form.name') }}</UiFormLabel>
        <UiFormControl>
          <UiInput
            ref="nameInput"
            type="text"
            :placeholder="authUser?.name"
            v-bind="componentField"
          />
        </UiFormControl>
        <UiFormMessage />
      </UiFormItem>
    </UiFormField>

    <!-- like every Dialog footer: Save changes wraps under Cancel and stays on the right -->
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
  </form>
</template>
