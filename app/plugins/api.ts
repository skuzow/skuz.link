import LinkModule from '@/repository/modules/link.module';

export interface ApiInstance {
  link: LinkModule;
}

export default defineNuxtPlugin(() => {
  const modules: ApiInstance = {
    link: new LinkModule($fetch)
  };

  return {
    provide: {
      api: modules
    }
  };
});
