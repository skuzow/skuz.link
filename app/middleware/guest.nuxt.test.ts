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

describe('guest middleware', () => {
  it('lets guests open the login page', async () => {
    expect(await navigate('/login')).toBe('/login');
  });

  it('sends signed-in users to their links', async () => {
    useState('auth:session').value = { token: 'session-token' };

    expect(await navigate('/login')).toBe('/links');
  });

  it('keeps the locale when sending signed-in users to their links', async () => {
    useState('auth:session').value = { token: 'session-token' };

    expect(await navigate('/es/login')).toBe('/es/links');
  });
});
