import LinkModule from '#layers/links/app/repository/modules/link.module';

export const useLinkApi = () => {
  // global $fetch drops cookies and Cloudflare bindings during SSR
  const fetcher = useRequestFetch();

  return new LinkModule(fetcher);
};
