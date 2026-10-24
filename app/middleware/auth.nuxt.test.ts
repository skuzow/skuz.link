import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it } from 'vitest';

registerEndpoint('/api/links', () => ({ body: { links: [] } }));

const navigate = async (path: string) => {
  const router = useRouter();
  await router.push(path);

  return router.currentRoute.value.path;
};

afterEach(async () => {
  useState('auth:session').value = null;
  await navigate('/');
});

describe('auth middleware', () => {
  it('sends guests to the login page', async () => {
    expect(await navigate('/links')).toBe('/login');
  });

  it('keeps the locale when sending guests to the login page', async () => {
    expect(await navigate('/es/links')).toBe('/es/login');
  });

  it('lets signed-in users through', async () => {
    useState('auth:session').value = { token: 'session-token' };

    expect(await navigate('/links')).toBe('/links');
  });
});
