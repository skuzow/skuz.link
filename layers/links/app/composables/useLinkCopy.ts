import { toast } from 'vue-sonner';

export const useLinkCopy = () => {
  const { t: $t } = useI18n();
  const requestURL = useRequestURL();

  const copyShortUrl = async (slug: string) => {
    const shortUrl = `${requestURL.origin}/${slug}`;

    try {
      await navigator.clipboard.writeText(shortUrl);

      toast.success($t('toast.links.copy.title'), {
        description: shortUrl
      });
    } catch {
      toast.error($t('toast.links.error'));
    }
  };

  return { copyShortUrl };
};
