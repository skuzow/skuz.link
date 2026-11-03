<script lang="ts" setup>
import type { Session } from 'better-auth/types';
import { toast } from 'vue-sonner';
import Calendar2Icon from '~icons/pixelarticons/calendar-2';
import LaptopIcon from '~icons/pixelarticons/laptop';
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
  <AuthSettingsRow>
    <LaptopIcon />
    {{ userAgent }}

    <template #details>
      <span class="text-muted-foreground flex items-center gap-x-2">
        <Calendar2Icon />
        <SharedDate :date="session.expiresAt" />
      </span>

      <UiBadge v-if="authSession?.token === session.token">
        {{ $t('auth.settings.sessions.current') }}
      </UiBadge>
    </template>

    <template #action>
      <UiButton
        class="text-destructive"
        variant="ghost"
        :loading="isLoadingRevokeSession"
        @click="clickRevokeSession"
      >
        <UserXIcon />
        {{ $t('auth.settings.sessions.button') }}
      </UiButton>
    </template>
  </AuthSettingsRow>
</template>
