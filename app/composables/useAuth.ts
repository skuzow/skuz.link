import { createAuthClient } from 'better-auth/vue';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';

export function useAuth() {
  const url = useRequestURL();
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const authClient = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers
    },
    plugins: [adminClient(), inferAdditionalFields<typeof auth>()]
  });

  type AuthSession = typeof authClient.$Infer.Session.session;
  type AuthUser = typeof authClient.$Infer.Session.user;

  const authSession = useState<AuthSession | null>('auth:session', () => null);
  const authUser = useState<AuthUser | null>('auth:user', () => null);

  const isAuthenticated: ComputedRef<boolean> = computed(
    () => !!authSession.value
  );

  const sessionFetching = import.meta.server
    ? ref(false)
    : useState('auth:sessionFetching', () => false);

  const fetchSession = async () => {
    if (sessionFetching.value) return;

    sessionFetching.value = true;

    const { data } = await authClient.getSession();

    authSession.value = data?.session || null;

    const userDefaults = {
      image: null,
      role: null,
      banReason: null,
      banned: null,
      banExpires: null
    };

    authUser.value = data?.user
      ? Object.assign({}, userDefaults, data.user)
      : null;

    sessionFetching.value = false;

    return data;
  };

  if (import.meta.client) {
    authClient.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return;

      await fetchSession();
    });
  }

  const signOut = async () => {
    const res = await authClient.signOut();

    const localePath = useLocalePath();
    await navigateTo(localePath('/'));

    authSession.value = null;
    authUser.value = null;

    return res;
  };

  const revokeSession = async (token: string) => {
    const res = await authClient.revokeSession({ token });

    if (!res.error && token === authSession.value?.token) {
      const localePath = useLocalePath();
      await navigateTo(localePath('/'));

      authSession.value = null;
      authUser.value = null;
    }

    return res;
  };

  return {
    authSession,
    authUser,
    isAuthenticated,
    fetchSession,
    signIn: authClient.signIn,
    signOut,
    updateAuthUser: authClient.updateUser,
    changeEmail: authClient.changeEmail,
    verifyEmail: authClient.sendVerificationEmail,
    listAuthSessions: authClient.listSessions,
    revokeSession,
    listAccounts: authClient.listAccounts,
    unlinkAccount: authClient.unlinkAccount,
    linkAccount: authClient.linkSocial,
    deleteAuthUser: authClient.deleteUser
  };
}
