<script lang="ts" setup>
import { LinkIcon, Settings2Icon, LogOutIcon } from 'lucide-vue-next';

const { authUser, signOut } = useAuth();

const { openAuthSettings } = useAuthSettings();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <SharedAvatar loading="eager" :user="authUser" />
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-56 font-medium">
      <UiDropdownMenuLabel>
        <h3>{{ authUser?.name }}</h3>
      </UiDropdownMenuLabel>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuGroup>
        <NuxtLinkLocale to="/links" :title="$t('nav.header.user.links')">
          <UiDropdownMenuItem class="gap-2">
            <LinkIcon :size="16" />
            <span>{{ $t('nav.header.user.links') }}</span>
          </UiDropdownMenuItem>
        </NuxtLinkLocale>

        <UiDropdownMenuItem class="gap-2" @click="openAuthSettings">
          <Settings2Icon :size="16" />
          <span>{{ $t('nav.header.user.settings') }}</span>
        </UiDropdownMenuItem>
      </UiDropdownMenuGroup>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuItem class="gap-2" @click="signOut">
        <LogOutIcon :size="16" />
        <span>{{ $t('nav.header.user.logout') }}</span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
