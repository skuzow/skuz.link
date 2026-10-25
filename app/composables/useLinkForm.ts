import type { Link } from '#shared/types/link.type';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import { FormInput } from '@/constants/form.constant';
import { LinkInputSchema } from '#shared/schemas/link.schema';

export const useLinkForm = (options: {
  link: MaybeRefOrGetter<Link | null | undefined>;
  onSuccess: () => void | Promise<void>;
}) => {
  const { $api } = useNuxtApp();
  const { t: $t } = useI18n();
  const { alreadyUseMessage, formatMessage, errorMap } = useFormMessage();

  const isLoading: Ref<boolean> = ref(false);

  const isSlug = (input: FormInput) => input === FormInput.SLUG;

  const linkErrorMap = errorMap({
    invalid_string: (_, input) =>
      formatMessage(input, isSlug(input) ? 'slugFormat' : 'urlFormat'),
    custom: (_, input) =>
      formatMessage(input, isSlug(input) ? 'slugReserved' : 'urlFormat')
  });

  const form = useForm({
    validationSchema: toTypedSchema(LinkInputSchema, {
      errorMap: linkErrorMap
    })
  });

  const currentLink = computed(() => toValue(options.link));
  const isEditing = computed(() => Boolean(currentLink.value));

  const resetWithLink = (link?: Link | null) => {
    form.resetForm({
      values: {
        slug: link?.slug ?? '',
        redirectUrl: link?.redirectUrl ?? ''
      }
    });
  };

  const submit = form.handleSubmit(async (values) => {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      if (currentLink.value) {
        await $api.link.update(currentLink.value.id, values);

        toast.success($t('toast.links.edit.title'));
      } else {
        await $api.link.create(values);

        toast.success($t('toast.links.create.title'));
      }

      await options.onSuccess();
    } catch (error) {
      const isConflict =
        error instanceof Error &&
        'statusCode' in error &&
        error.statusCode === 409;

      if (isConflict) {
        form.setErrors({
          slug: alreadyUseMessage(FormInput.SLUG)
        });
      } else {
        toast.error($t('toast.links.error'));
      }
    } finally {
      isLoading.value = false;
    }
  });

  return {
    isLoading,
    isEditing,
    submit,
    resetWithLink
  };
};
