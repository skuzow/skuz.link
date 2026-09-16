import LinkModule from '@/repository/modules/link.module';

export interface ApiInstance {
  link: LinkModule;
}

export default defineNuxtPlugin(() => {
  const apiFetcher = $fetch.create({});

  const modules: ApiInstance = {
    link: new LinkModule(apiFetcher)
  };

  return {
    provide: {
      api: modules
    }
  };
});
