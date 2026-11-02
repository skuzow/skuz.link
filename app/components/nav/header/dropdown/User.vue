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
      <button
        type="button"
        :aria-label="$t('nav.header.user.menu')"
        class="hover:outline-input data-[state=open]:outline-input focus-visible:outline-ring flex cursor-pointer outline-offset-2 transition-[outline-color] duration-120 hover:outline focus-visible:outline-2 data-[state=open]:outline"
      >
        <UserAvatar loading="eager" :user="authUser" />
      </button>
    </UiDropdownMenuTrigger>
    <!-- a limit on the width is what cuts a long name with an ellipsis -->
    <UiDropdownMenuContent align="end" class="max-w-52">
      <UiDropdownMenuLabel>{{ authUser?.name }}</UiDropdownMenuLabel>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuGroup>
        <UiDropdownMenuItem as-child>
          <NuxtLinkLocale
            :to="LINKS_ROUTE"
            :title="$t('nav.header.user.links')"
          >
            <IconLogo />
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
