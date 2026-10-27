import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

// better-auth calls fetch on an absolute URL, which registerEndpoint misses
const callbackURLs: string[] = [];

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = new Request(input, init);

    if (new URL(request.url).pathname === '/api/auth/sign-in/social') {
      const body: { callbackURL: string } = await request.json();
      callbackURLs.push(body.callbackURL);
    }

    return Response.json({});
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  callbackURLs.length = 0;
});

const mountUseAuthProviders = async (route = '/') => {
  let providers!: ReturnType<typeof useAuthProviders>;

  await mountSuspended(
    defineComponent({
      setup() {
        providers = useAuthProviders();

        return () => h('div');
      }
    }),
    { route }
  );

  return providers;
};

describe('useAuthProviders', () => {
  it('returns to the signed-in route after signing in with Google', async () => {
    const { loginWithGoogle } = await mountUseAuthProviders();

    await loginWithGoogle();

    expect(callbackURLs).toEqual(['/links']);
  });

  it('returns to the signed-in route in the current locale after signing in with Github', async () => {
    const { loginWithGithub } = await mountUseAuthProviders('/es');

    await loginWithGithub();

    expect(callbackURLs).toEqual(['/es/links']);
  });
});
