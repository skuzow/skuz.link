import LinkModule from '@/repository/modules/link.module';

export interface ApiInstance {
  link: LinkModule;
}

export default defineNuxtPlugin(() => {
  // global $fetch drops cookies and Cloudflare bindings during SSR
  const fetcher = useRequestFetch();

  const modules: ApiInstance = {
    link: new LinkModule(fetcher)
  };

  return {
    provide: {
      api: modules
    }
  };
});
