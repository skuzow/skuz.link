<script lang="ts" setup>
import {
  LINKS_GRID_ITEM_CLASS,
  LINKS_GRID_LIST_CLASS
} from '#layers/links/app/constants/links.constant';
</script>

<template>
  <div class="@container">
    <ul :class="LINKS_GRID_LIST_CLASS">
      <li v-for="index in 7" :key="index" :class="LINKS_GRID_ITEM_CLASS">
        <UiCard class="h-full">
          <UiCardHeader>
            <UiSkeleton class="h-2.5 w-16" />
          </UiCardHeader>
          <UiCardContent class="flex-row items-center gap-5">
            <!-- as tall as the Slug and Redirect URL, so the page doesn't shift -->
            <div
              class="flex h-[58px] min-w-0 flex-1 flex-col justify-center gap-2"
            >
              <UiSkeleton class="h-7 w-1/2" />
              <UiSkeleton class="h-3 w-4/5" />
            </div>
            <UiSkeleton class="size-[55px] flex-none" />
          </UiCardContent>
          <UiCardFooter>
            <UiSkeleton class="h-2.5 w-22" />
          </UiCardFooter>
        </UiCard>
      </li>
    </ul>
  </div>
</template>
