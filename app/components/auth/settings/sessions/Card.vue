<script lang="ts" setup>
import type { Session } from 'better-auth/types';
import {
  LaptopMinimalIcon,
  CalendarX2Icon,
  UserRoundIcon,
  UserRoundXIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

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
    :session="session"
    class="flex flex-col justify-between gap-y-3 p-3 sm:flex-row sm:items-center sm:gap-y-0"
  >
    <div>
      <p class="flex items-center gap-x-2">
        <LaptopMinimalIcon :size="16" />
        {{ userAgent }}
      </p>

      <div class="flex flex-row gap-x-3">
        <p class="flex items-center gap-x-2">
          <CalendarX2Icon :size="16" />
          <SharedDate :date="session.expiresAt" />
        </p>

        <p
          v-if="authSession?.token === session.token"
          class="flex items-center gap-x-2"
        >
          <UserRoundIcon :size="16" />
          {{ $t('auth.settings.sessions.current') }}
        </p>
      </div>
    </div>

    <div class="text-end">
      <UiButton
        class="text-destructive hover:text-destructive gap-x-2"
        variant="ghost"
        @click="clickRevokeSession"
      >
        <IconLoader v-if="isLoadingRevokeSession" class="fill-destructive" />
        <UserRoundXIcon v-else :size="16" />
        {{ $t('auth.settings.sessions.button') }}
      </UiButton>
    </div>
  </UiCard>
</template>
