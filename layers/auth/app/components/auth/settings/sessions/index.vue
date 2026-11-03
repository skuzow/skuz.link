<template>
  <UiAccordionItem value="sessions">
    <UiAccordionTrigger>
      {{ $t('auth.settings.sessions.title') }}
    </UiAccordionTrigger>
    <UiAccordionContent>
      <AuthSettingsSessionsContent />
    </UiAccordionContent>
  </UiAccordionItem>
</template>
