<script lang="ts" setup>
import { FormInput } from '@/constants/form.constant';

defineEmits(['close-update-profile']);

const { authUser } = useAuth();

const { isLoadingUpdateProfile, updateProfile, closeUpdateProfile } =
  useAuthUpdateProfile();
</script>

<template>
  <UiCard>
    <UiCardContent class="flex flex-col gap-6 sm:flex-row">
      <SharedAvatar
        size="base"
        :width="64"
        :height="64"
        loading="eager"
        :pointer="false"
        :user="authUser"
      />

      <form class="flex w-full flex-col gap-y-6" @submit="updateProfile">
        <UiFormField v-slot="{ componentField }" :name="FormInput.NAME">
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

        <div class="flex justify-end gap-x-2">
          <UiButton variant="ghost" @click.prevent="closeUpdateProfile">
            {{ $t('cancel') }}
          </UiButton>

          <UiButton type="submit">
            <IconLoader
              v-if="isLoadingUpdateProfile"
              class="fill-primary-foreground mr-2"
            />
            {{ $t('save') }}
          </UiButton>
        </div>
      </form>
    </UiCardContent>
  </UiCard>
</template>
