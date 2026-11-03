<script lang="ts" setup>
import ZapIcon from '~icons/pixelarticons/zap';

import { LINKS_ROUTE } from '#layers/links/app/constants/links.constant';
import {
  LANDING_EXAMPLE_LINKS,
  LANDING_PLATE_SLUG
} from '@/constants/landing.constant';

const { isAuthenticated } = useAuth();
const { copyShortUrl } = useLinkCopy();
</script>

<template>
  <SharedFadeIn as-child>
    <section
      class="grid h-full content-center items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
    >
      <div class="flex min-w-0 flex-col gap-6">
        <h1 class="type-display-sm lg:type-display">
          {{ $t('landing.headline.first') }}
          <br />
          {{ $t('landing.headline.second') }}
        </h1>

        <p class="type-lead text-muted-foreground max-w-md">
          {{ $t('landing.subline') }}
        </p>

        <LinksShortUrlPlate
          :slug="LANDING_PLATE_SLUG"
          @copy="copyShortUrl(LANDING_PLATE_SLUG)"
        />

        <UiButton as-child size="lg" class="self-start">
          <NuxtLinkLocale :to="isAuthenticated ? LINKS_ROUTE : '/login'">
            <ZapIcon />
            {{ $t('landing.cta') }}
          </NuxtLinkLocale>
        </UiButton>
      </div>

      <UiCard>
        <UiCardHeader>
          <span class="led text-signal" />
          <span class="type-eyebrow text-faint-foreground">
            {{ $t('landing.example') }}
          </span>
          <span class="type-eyebrow text-faint-foreground ml-auto">
            {{ LANDING_EXAMPLE_LINKS.length }}
          </span>
        </UiCardHeader>
        <ul>
          <li
            v-for="link in LANDING_EXAMPLE_LINKS"
            :key="link.slug"
            class="flex min-w-0 items-center gap-3 border-b p-3 last:border-b-0"
          >
            <LinksSlugMark :slug="link.slug" class="size-[25px]" />
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="type-body font-semibold">/{{ link.slug }}</span>
              <span class="type-code text-muted-foreground truncate">
                {{ link.redirectUrl }}
              </span>
            </div>
            <span class="type-chip text-muted-foreground whitespace-nowrap">
              {{ $n(link.clicks) }}
            </span>
          </li>
        </ul>
      </UiCard>
    </section>
  </SharedFadeIn>
</template>
