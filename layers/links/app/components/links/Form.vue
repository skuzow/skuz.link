<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { LinkFormInput } from '#layers/links/app/constants/form.constant';
import CheckIcon from '~icons/pixelarticons/check';
import CloseIcon from '~icons/pixelarticons/close';
import PlusIcon from '~icons/pixelarticons/plus';

const props = defineProps<{
  link?: Link | null;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const { isLoading, isEditing, submit } = useLinkForm({
  link: props.link,
  onSuccess: () => emit('success')
});

defineExpose({ isLoading });
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit="submit">
    <UiFormField
      v-slot="{ componentField }"
      :name="LinkFormInput.SLUG"
      :validate-on-blur="false"
    >
      <UiFormItem>
        <UiFormLabel>{{ $t('form.slug') }}</UiFormLabel>
        <UiInputGroup>
          <UiInputGroupAddon>
            <UiInputGroupText>/</UiInputGroupText>
          </UiInputGroupAddon>
          <UiFormControl>
            <UiInputGroupInput
              type="text"
              autocapitalize="none"
              autocomplete="off"
              spellcheck="false"
              :placeholder="$t('form.slugPlaceholder')"
              v-bind="componentField"
            />
          </UiFormControl>
        </UiInputGroup>
        <UiFormMessage />
      </UiFormItem>
    </UiFormField>

    <UiFormField
      v-slot="{ componentField }"
      :name="LinkFormInput.REDIRECT_URL"
      :validate-on-blur="false"
    >
      <UiFormItem>
        <UiFormLabel>{{ $t('form.redirectUrl') }}</UiFormLabel>
        <UiFormControl>
          <UiInput
            type="url"
            inputmode="url"
            autocomplete="url"
            :placeholder="$t('form.redirectUrlPlaceholder')"
            v-bind="componentField"
          />
        </UiFormControl>
        <UiFormMessage />
      </UiFormItem>
    </UiFormField>

    <UiDialogFooter>
      <UiButton
        type="button"
        variant="secondary"
        :disabled="isLoading"
        @click="emit('cancel')"
      >
        <CloseIcon data-icon="inline-start" />
        {{ $t('cancel') }}
      </UiButton>
      <UiButton type="submit" :loading="isLoading">
        <template v-if="isEditing">
          <CheckIcon data-icon="inline-start" />
          {{ $t('save') }}
        </template>
        <template v-else>
          <PlusIcon data-icon="inline-start" />
          {{ $t('links.create.button') }}
        </template>
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
