import { toast } from 'vue-sonner';

import {
  AuthProvider,
  authProviderNameMap
} from '#layers/auth/app/constants/auth.constant';

export const useAuthProviders = () => {
  const localePath = useLocalePath();
  const { t: $t } = useI18n();
  const { auth } = useAppConfig();

  const { signIn } = useAuth();

  const isLoadingWithGoogle: Ref<boolean> = ref(false);
  const isLoadingWithGithub: Ref<boolean> = ref(false);

  const loginWithGoogle = async () => {
    if (isLoadingWithGoogle.value) return;

    isLoadingWithGoogle.value = true;

    const { error } = await signIn.social({
      provider: 'google',
      callbackURL: localePath(auth.signedInRoute)
    });

    isLoadingWithGoogle.value = false;

    if (error) showErrorToast(AuthProvider.GOOGLE, error.message);
  };

  const loginWithGithub = async () => {
    if (isLoadingWithGithub.value) return;

    isLoadingWithGithub.value = true;

    const { error } = await signIn.social({
      provider: 'github',
      callbackURL: localePath(auth.signedInRoute)
    });

    isLoadingWithGithub.value = false;

    if (error) showErrorToast(AuthProvider.GITHUB, error.message);
  };

  const showErrorToast = (provider: AuthProvider, description?: string) => {
    toast.error(`${$t('toast.auth.error')} ${authProviderNameMap[provider]}`, {
      description
    });
  };

  return {
    isLoadingWithGoogle,
    isLoadingWithGithub,
    loginWithGoogle,
    loginWithGithub
  };
};
