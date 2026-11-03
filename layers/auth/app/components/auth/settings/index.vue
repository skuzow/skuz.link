<script lang="ts" setup>
const { isAuthenticated } = useAuth();

const { isOpen } = useAuthSettings();
</script>

<template>
  <!-- its own provider: app.vue and error.vue mount Settings outside the layout -->
  <UiTooltipProvider v-if="isAuthenticated">
    <UiDialog v-model:open="isOpen">
      <AuthSettingsContent />
    </UiDialog>
  </UiTooltipProvider>
</template>
