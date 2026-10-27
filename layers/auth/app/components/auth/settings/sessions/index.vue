<template>
  <UiAccordionItem value="sessions">
    <UiAccordionTrigger>
      <h3 class="font-bold">
        {{ $t('auth.settings.sessions.title') }}
      </h3>
    </UiAccordionTrigger>
    <UiAccordionContent class="pl-2.5">
      <AuthSettingsSessionsContent />
    </UiAccordionContent>
  </UiAccordionItem>
</template>
