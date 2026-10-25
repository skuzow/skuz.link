import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { afterEach } from 'vitest';

/**
 * Drives the app router for route middleware tests. Stubs the links list that
 * /links loads, and signs out and returns to / after each test.
 */
export const setupTestRouter = () => {
  registerEndpoint('/api/links', () => ({ body: { links: [] } }));

  const navigate = async (path: string) => {
    const router = useRouter();
    await router.push(path);

    return router.currentRoute.value.path;
  };

  const login = () => {
    useState('auth:session').value = { token: 'session-token' };
  };

  afterEach(async () => {
    useState('auth:session').value = null;
    await navigate('/');
  });

  return { navigate, login };
};
