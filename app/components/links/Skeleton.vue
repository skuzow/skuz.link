<template>
  <ul
    class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(16rem,calc((100%-2*1rem)/3))),1fr))] gap-4"
  >
    <li v-for="index in 3" :key="index">
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
</template>
