import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

// better-auth calls fetch on an absolute URL, which registerEndpoint misses
let deleteUserFails = false;

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = new Request(input, init);

    if (new URL(request.url).pathname === '/api/auth/delete-user') {
      return deleteUserFails
        ? Response.json({ message: 'Session expired' }, { status: 400 })
        : Response.json({ success: true, message: 'User deleted' });
    }

    return Response.json({});
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  deleteUserFails = false;
  useState('auth:session').value = null;
  await useRouter().push('/');
});

const mountUseAuth = async (route: string) => {
  let auth!: ReturnType<typeof useAuth>;

  await mountSuspended(
    defineComponent({
      setup() {
        auth = useAuth();

        return () => h('div');
      }
    }),
    { route }
  );

  return auth;
};

const currentPath = () => useRouter().currentRoute.value.path;

describe('useAuth', () => {
  it('signs out and returns to the home page after deleting the user', async () => {
    const { authSession, deleteAuthUser } = await mountUseAuth('/login');
    useState('auth:session').value = { token: 'session-token' };

    await deleteAuthUser();

    expect(currentPath()).toBe('/');
    expect(authSession.value).toBeNull();
  });

  it('returns to the home page in the current locale after deleting the user', async () => {
    const { deleteAuthUser } = await mountUseAuth('/es/login');

    await deleteAuthUser();

    expect(currentPath()).toBe('/es');
  });

  it('stays on the page and keeps the session when deleting the user fails', async () => {
    deleteUserFails = true;
    const { authSession, deleteAuthUser } = await mountUseAuth('/login');
    useState('auth:session').value = { token: 'session-token' };

    const { error } = await deleteAuthUser();

    expect(error).not.toBeNull();
    expect(currentPath()).toBe('/login');
    expect(authSession.value).toEqual({ token: 'session-token' });
  });
});
