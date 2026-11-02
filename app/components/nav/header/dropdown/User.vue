<script lang="ts" setup>
import LogoutIcon from '~icons/pixelarticons/logout';
import SlidersIcon from '~icons/pixelarticons/sliders';

import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';

const { authUser, signOut } = useAuth();

const { openAuthSettings } = useAuthSettings();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UserAvatar loading="eager" :user="authUser" />
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-56 font-medium">
      <UiDropdownMenuLabel>
        <h3>{{ authUser?.name }}</h3>
      </UiDropdownMenuLabel>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuGroup>
        <UiDropdownMenuItem as-child>
          <NuxtLinkLocale
            :to="LINKS_ROUTE"
            :title="$t('nav.header.user.links')"
          >
            <IconLogo class="fill-current" />
            <span>{{ $t('nav.header.user.links') }}</span>
          </NuxtLinkLocale>
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click="openAuthSettings">
          <SlidersIcon />
          <span>{{ $t('auth.settings.title') }}</span>
        </UiDropdownMenuItem>
      </UiDropdownMenuGroup>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuItem @click="signOut">
        <LogoutIcon />
        <span>{{ $t('nav.header.user.logout') }}</span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
