<script lang="ts" setup>
import {
  AuthProvider,
  authProviderNameMap
} from '#layers/auth/app/constants/auth.constant';

const {
  isLoadingWithGoogle,
  isLoadingWithGithub,
  loginWithGoogle,
  loginWithGithub
} = useAuthProviders();
</script>

<template>
  <UiButton variant="outline" @click="loginWithGoogle">
    <IconLoader v-if="isLoadingWithGoogle" />
    <IconGoogle v-else />
    {{
      $t('auth.continueWith', {
        provider: authProviderNameMap[AuthProvider.GOOGLE]
      })
    }}
  </UiButton>

  <UiButton variant="outline" @click="loginWithGithub">
    <IconLoader v-if="isLoadingWithGithub" />
    <IconGithub v-else />
    {{
      $t('auth.continueWith', {
        provider: authProviderNameMap[AuthProvider.GITHUB]
      })
    }}
  </UiButton>
</template>
