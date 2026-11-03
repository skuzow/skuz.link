<script lang="ts" setup>
import PencilIcon from '~icons/pixelarticons/pencil';

const { authUser } = useAuth();

const isUpdateProfileOpen: Ref<boolean> = ref(false);
</script>

<template>
  <section class="flex flex-col gap-3 py-3.5">
    <h3 class="type-small font-medium">
      {{ $t('auth.settings.profile.title') }}
    </h3>

    <div
      v-if="!isUpdateProfileOpen"
      class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="type-small flex max-w-full min-w-0 items-center gap-x-3">
        <!-- accent: secondary is the same color as popover in dark -->
        <UserAvatar
          class="bg-accent text-accent-foreground"
          size="sm"
          :width="40"
          :height="40"
          loading="eager"
          :user="authUser"
        />
        <p class="truncate">{{ authUser?.name }}</p>
      </div>

      <UiButton variant="outline" @click="isUpdateProfileOpen = true">
        <PencilIcon data-icon="inline-start" />
        {{ $t('auth.settings.profile.button') }}
      </UiButton>
    </div>

    <AuthSettingsProfileForm
      v-else
      @close-update-profile="isUpdateProfileOpen = false"
    />
  </section>
</template>
