import LinkModule from '#layers/links/app/repository/modules/link.module';

export interface ApiInstance {
  link: LinkModule;
}

export default defineNuxtPlugin({
  name: 'api',
  // layer plugins run before root's, so run first to provide $api even when
  // a layer plugin fails (Auth's session fetch has no server in nuxt tests)
  enforce: 'pre',
  setup() {
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
  }
});
