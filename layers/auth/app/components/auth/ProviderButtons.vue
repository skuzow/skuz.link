<script lang="ts" setup>
const {
  isLoadingWithGoogle,
  isLoadingWithGithub,
  loginWithGoogle,
  loginWithGithub
} = useAuthProviders();
</script>

<template>
  <UiButton variant="outline" class="gap-4" @click="loginWithGoogle">
    <IconLoader v-if="isLoadingWithGoogle" />
    <IconGoogle v-else />
    {{ $t('auth.google') }}
  </UiButton>

  <UiButton variant="outline" class="gap-4" @click="loginWithGithub">
    <IconLoader v-if="isLoadingWithGithub" />
    <IconGithub v-else />
    {{ $t('auth.github') }}
  </UiButton>
</template>
