<script lang="ts" setup>
import type { Link } from '#shared/types/link.type';
import { FormInput } from '@/constants/form.constant';

const open = defineModel<boolean>('open', { required: true });

const props = defineProps<{
  link?: Link | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const { isLoading, isEditing, submit, resetWithLink } = useLinkForm({
  link: () => props.link,
  onSuccess: async () => {
    open.value = false;
    emit('success');
  }
});

watch(open, (isOpen) => {
  if (isOpen) resetWithLink(props.link);
});
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle>
          {{ isEditing ? $t('links.edit.title') : $t('links.create.title') }}
        </UiDialogTitle>
        <UiDialogDescription>
          {{
            isEditing
              ? $t('links.edit.description')
              : $t('links.create.description')
          }}
        </UiDialogDescription>
      </UiDialogHeader>

      <form class="flex flex-col gap-6" @submit="submit">
        <UiFormField
          v-slot="{ componentField }"
          :name="FormInput.LINK"
          :validate-on-blur="false"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t('form.link') }}</UiFormLabel>
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
                  :placeholder="$t('form.linkPlaceholder')"
                  v-bind="componentField"
                />
              </UiFormControl>
            </UiInputGroup>
            <UiFormMessage />
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          :name="FormInput.REDIRECT_URL"
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

        <UiDialogFooter class="sm:justify-between">
          <UiButton type="button" variant="secondary" @click="open = false">
            {{ $t('cancel') }}
          </UiButton>
          <UiButton type="submit" :disabled="isLoading">
            <IconLoader v-if="isLoading" class="fill-primary-foreground mr-2" />
            {{ $t('save') }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
