<script lang="ts" setup>
import { LINKS_GRID_ITEM_CLASS, LINKS_GRID_LIST_CLASS } from './grid-layout';
</script>

<template>
  <div class="@container">
    <ul :class="LINKS_GRID_LIST_CLASS">
      <li v-for="index in 7" :key="index" :class="LINKS_GRID_ITEM_CLASS">
        <UiCard>
          <UiCardHeader>
            <UiSkeleton class="h-5 w-32" />
            <UiSkeleton class="h-4 w-full" />
          </UiCardHeader>
          <UiCardFooter>
            <UiSkeleton class="h-5 w-16" />
          </UiCardFooter>
        </UiCard>
      </li>
    </ul>
  </div>
</template>
