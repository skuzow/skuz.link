<script lang="ts" setup>
const { isAuthenticated } = useAuth();

const { isOpen } = useAuthSettings();
</script>

<template>
  <UiDialog v-if="isAuthenticated" v-model:open="isOpen">
    <AuthSettingsContent />
  </UiDialog>
</template>
