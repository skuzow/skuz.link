<script lang="ts" setup>
import type { Session } from 'better-auth/types';
import { toast } from 'vue-sonner';
import Calendar2Icon from '~icons/pixelarticons/calendar-2';
import LaptopIcon from '~icons/pixelarticons/laptop';
import UserIcon from '~icons/pixelarticons/user';
import UserXIcon from '~icons/pixelarticons/user-x';

interface Props {
  session: Session;
}

const { session } = defineProps<Props>();

const emit = defineEmits(['refresh-sessions']);

const { t: $t } = useI18n();

const { authSession, revokeSession } = useAuth();

const isLoadingRevokeSession: Ref<boolean> = ref(false);

const userAgent: string | undefined = session.userAgent
  ?.split('(')[1]
  ?.split(')')[0]
  ?.replaceAll(';', ' -');

const clickRevokeSession = async () => {
  if (isLoadingRevokeSession.value) return;

  isLoadingRevokeSession.value = true;

  const { error } = await revokeSession(session.token);

  isLoadingRevokeSession.value = false;

  if (error) {
    toast.error($t('toast.auth.settings.sessions.error'), {
      description: error.message
    });
  } else {
    toast.success($t('toast.auth.settings.sessions.title'), {
      description: userAgent
    });

    emit('refresh-sessions');
  }
};
</script>

<template>
  <UiCard
    class="flex flex-col justify-between gap-y-3 p-3 sm:flex-row sm:items-center sm:gap-y-0"
  >
    <div>
      <p class="flex items-center gap-x-2">
        <LaptopIcon />
        {{ userAgent }}
      </p>

      <div class="flex flex-row gap-x-3">
        <p class="flex items-center gap-x-2">
          <Calendar2Icon />
          <SharedDate :date="session.expiresAt" />
        </p>

        <p
          v-if="authSession?.token === session.token"
          class="flex items-center gap-x-2"
        >
          <UserIcon />
          {{ $t('auth.settings.sessions.current') }}
        </p>
      </div>
    </div>

    <div class="text-end">
      <UiButton
        class="text-destructive hover:text-destructive"
        variant="ghost"
        @click="clickRevokeSession"
      >
        <IconLoader v-if="isLoadingRevokeSession" class="fill-destructive" />
        <UserXIcon v-else />
        {{ $t('auth.settings.sessions.button') }}
      </UiButton>
    </div>
  </UiCard>
</template>
