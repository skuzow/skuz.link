import type { Link } from '#shared/types/link.type';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import { FormInput } from '@/constants/form.constant';
import {
  LINK_SLUG_MIN,
  LINK_SLUG_MAX,
  LINK_REDIRECT_URL_MAX,
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '#shared/constants/link.constant';
import { normalizeLinkSlug } from '#shared/schemas/link.schema';

export const useLinkForm = (options: {
  link: MaybeRefOrGetter<Link | null | undefined>;
  onSuccess: () => void | Promise<void>;
}) => {
  const { t: $t } = useI18n();
  const { requiredMessage, minMessage, maxMessage, alreadyUseMessage } =
    useFormMessage();

  const isLoading = shallowRef(false);

  const LinkFormSchema = z.object({
    link: z
      .string({
        required_error: requiredMessage(FormInput.LINK)
      })
      .transform(normalizeLinkSlug)
      .pipe(
        z
          .string()
          .min(LINK_SLUG_MIN, {
            message: minMessage(FormInput.LINK, LINK_SLUG_MIN)
          })
          .max(LINK_SLUG_MAX, {
            message: maxMessage(FormInput.LINK, LINK_SLUG_MAX)
          })
          .regex(LINK_SLUG_REGEX, {
            message: `${$t('form.link')} ${$t('form.linkFormat')}.`
          })
          .refine(
            (slug) => !RESERVED_LINK_SLUGS.has(slug) && !slug.startsWith('_'),
            {
              message: `${$t('form.link')} ${$t('form.linkReserved')}.`
            }
          )
      ),
    redirectUrl: z
      .string({
        required_error: requiredMessage(FormInput.REDIRECT_URL)
      })
      .trim()
      .min(1, {
        message: requiredMessage(FormInput.REDIRECT_URL)
      })
      .max(LINK_REDIRECT_URL_MAX, {
        message: maxMessage(FormInput.REDIRECT_URL, LINK_REDIRECT_URL_MAX)
      })
      .url({
        message: `${$t('form.redirectUrl')} ${$t('form.urlFormat')}.`
      })
      .refine(
        (url) => url.startsWith('http://') || url.startsWith('https://'),
        {
          message: `${$t('form.redirectUrl')} ${$t('form.urlFormat')}.`
        }
      )
  });

  const form = useForm({
    validationSchema: toTypedSchema(LinkFormSchema)
  });

  const currentLink = computed(() => toValue(options.link));
  const isEditing = computed(() => Boolean(currentLink.value));

  const resetWithLink = (link?: Link | null) => {
    form.resetForm({
      values: {
        link: link?.link ?? '',
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
        await $fetch(`/api/links/${currentLink.value.id}`, {
          method: 'PUT',
          body: values
        });

        toast.success($t('toast.links.edit.title'));
      } else {
        await $fetch('/api/links', {
          method: 'POST',
          body: values
        });

        toast.success($t('toast.links.create.title'));
      }

      await options.onSuccess();
      resetWithLink(null);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 409) {
        form.setErrors({
          link: alreadyUseMessage(FormInput.LINK)
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
