<script lang="ts" setup>
import PencilIcon from '~icons/pixelarticons/pencil';

const { authUser } = useAuth();

const isUpdateProfileOpen: Ref<boolean> = ref(false);
</script>

<template>
  <AuthSettingsPanel :title="$t('auth.settings.profile.title')">
    <div class="flex flex-col gap-4 p-5">
      <!-- below 400px, Update profile drops under the Avatar and name -->
      <div
        v-if="!isUpdateProfileOpen"
        class="flex min-w-0 items-center gap-4 max-[400px]:grid max-[400px]:grid-cols-[auto_minmax(0,1fr)]"
      >
        <!-- accent: secondary is the same color as popover in dark -->
        <UserAvatar
          class="bg-accent text-accent-foreground size-16 text-xl/5 sm:size-22 sm:text-2xl/6"
          :width="88"
          :height="88"
          loading="eager"
          :user="authUser"
        />

        <div
          class="flex min-w-0 flex-1 flex-col items-start gap-3 max-[400px]:contents"
        >
          <p class="type-subtitle max-w-full truncate">{{ authUser?.name }}</p>

          <UiButton
            class="max-[400px]:col-span-full max-[400px]:justify-self-start"
            variant="outline"
            @click="isUpdateProfileOpen = true"
          >
            <PencilIcon data-icon="inline-start" />
            {{ $t('auth.settings.profile.button') }}
          </UiButton>
        </div>
      </div>

      <AuthSettingsProfileForm
        v-else
        @close-update-profile="isUpdateProfileOpen = false"
      />
    </div>
  </AuthSettingsPanel>
</template>
