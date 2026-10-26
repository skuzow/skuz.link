// declares event.context.getAuthSession
import type {} from '#layers/auth/server/types/context';

export default defineNuxtPlugin({
  name: 'better-auth-fetch-plugin',
  enforce: 'pre',
  async setup(nuxtApp) {
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (
      nuxtApp.payload.serverRendered &&
      !nuxtApp.payload.prerenderedAt &&
      !nuxtApp.payload.isCached
    ) {
      const event = useRequestEvent()!;
      const session = await event.context.getAuthSession();

      useState('auth:session', () => session?.session || null);
      useState('auth:user', () => session?.user || null);
    }
  }
});
