<script lang="ts" setup>
const {
  isLoadingWithGoogle,
  isLoadingWithGithub,
  loginWithGoogle,
  loginWithGithub
} = useAuthProviders();
</script>

<template>
  <UiButton variant="outline" @click="loginWithGoogle">
    <IconLoader v-if="isLoadingWithGoogle" class="mr-2" />
    <IconGoogle v-else class="mr-2" />
    {{ $t('auth.google') }}
  </UiButton>

  <UiButton variant="outline" @click="loginWithGithub">
    <IconLoader v-if="isLoadingWithGithub" class="mr-2" />
    <IconGithub v-else class="mr-2" />
    {{ $t('auth.github') }}
  </UiButton>
</template>
