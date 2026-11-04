import type { Link } from '#layers/links/shared/domain/link.type';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import { LinkFormInput } from '#layers/links/app/constants/form.constant';
import { LinkInputSchema } from '#layers/links/shared/domain/link.schema';

// call this where the fields render, and render them for one Link only: while
// no field is rendered, vee-validate's silent validation stores its errors, and
// they show on the fields once they mount
export const useLinkForm = (options: {
  link?: Link | null;
  onSuccess: () => void | Promise<void>;
}) => {
  const linkApi = useLinkApi();
  const { t: $t } = useI18n();
  const { alreadyUseMessage, formatMessage, errorMap } = useFormMessage();

  const isLoading: Ref<boolean> = ref(false);

  const isSlug = (input: string) => input === LinkFormInput.SLUG;

  const linkErrorMap = errorMap({
    invalid_format: (_, input) =>
      formatMessage(input, isSlug(input) ? 'slugFormat' : 'urlFormat'),
    custom: (_, input) =>
      formatMessage(input, isSlug(input) ? 'slugReserved' : 'urlFormat')
  });

  const form = useForm({
    validationSchema: toTypedSchema(LinkInputSchema, linkErrorMap),
    initialValues: {
      slug: options.link?.slug ?? '',
      redirectUrl: options.link?.redirectUrl ?? ''
    }
  });

  const submit = form.handleSubmit(async (values) => {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      if (options.link) {
        await linkApi.update(options.link.id, values);

        toast.success($t('toast.links.edit.title'));
      } else {
        await linkApi.create(values);

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
          slug: alreadyUseMessage(LinkFormInput.SLUG)
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
    isEditing: Boolean(options.link),
    submit
  };
};
