<script lang="ts" setup>
import type { Link } from '#layers/links/shared/domain/link.type';
import { linkHueStyle } from '#layers/links/app/lib/slugMark';

const open = defineModel<boolean>('open', { required: true });

const props = defineProps<{
  link?: Link | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const { t: $t } = useI18n();

const form = useTemplateRef('form');

const isEditing = computed(() => Boolean(props.link));

const title = computed(() =>
  isEditing.value ? $t('links.edit.title') : $t('links.create.title')
);
const description = computed(() =>
  isEditing.value
    ? $t('links.edit.description')
    : $t('links.create.description')
);
const hueStyle = computed(() =>
  props.link ? linkHueStyle(props.link.slug) : undefined
);

// closing mid-save would unmount the form before it handles the response
const setOpen = (value: boolean) => {
  if (!form.value?.isLoading) open.value = value;
};
</script>

<template>
  <UiDialog :open="open" @update:open="setOpen">
    <UiDialogContent :class="{ 'link-hue': isEditing }" :style="hueStyle">
      <UiDialogHeader>
        <UiDialogTitle>{{ title }}</UiDialogTitle>
        <UiDialogDescription>{{ description }}</UiDialogDescription>
      </UiDialogHeader>

      <LinksForm
        ref="form"
        :link="link"
        @cancel="setOpen(false)"
        @success="emit('success')"
      />
    </UiDialogContent>
  </UiDialog>
</template>
