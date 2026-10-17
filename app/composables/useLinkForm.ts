import type { Link } from '#shared/types/link.type';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import { FormInput } from '@/constants/form.constant';
import { LinkCreationSchema } from '#shared/schemas/link.schema';

export const useLinkForm = (options: {
  link: MaybeRefOrGetter<Link | null | undefined>;
  onSuccess: () => void | Promise<void>;
}) => {
  const { $api } = useNuxtApp();
  const { t: $t } = useI18n();
  const { requiredMessage, minMessage, maxMessage, alreadyUseMessage } =
    useFormMessage();

  const isLoading = shallowRef(false);

  const linkErrorMap: z.ZodErrorMap = (issue, ctx) => {
    const input = issue.path[0] as FormInput;

    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === z.ZodParsedType.undefined) {
          return { message: requiredMessage(input) };
        }
        break;
      case z.ZodIssueCode.too_small:
        if (Number(issue.minimum) <= 1) {
          return { message: requiredMessage(input) };
        }
        return { message: minMessage(input, Number(issue.minimum)) };
      case z.ZodIssueCode.too_big:
        return { message: maxMessage(input, Number(issue.maximum)) };
      case z.ZodIssueCode.invalid_string:
      case z.ZodIssueCode.custom:
        return { message: formatMessage(input, issue.code) };
    }

    return { message: ctx.defaultError };
  };

  const formatMessage = (input: FormInput, code: z.ZodIssueCode) => {
    if (input === FormInput.REDIRECT_URL) {
      return `${$t('form.redirectUrl')} ${$t('form.urlFormat')}.`;
    }

    const reason =
      code === z.ZodIssueCode.custom ? 'form.slugReserved' : 'form.slugFormat';

    return `${$t('form.slug')} ${$t(reason)}.`;
  };

  const form = useForm({
    validationSchema: toTypedSchema(LinkCreationSchema, {
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

  watch(
    currentLink,
    (link) => {
      resetWithLink(link);
    },
    { immediate: true }
  );

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
      resetWithLink(null);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 409) {
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
