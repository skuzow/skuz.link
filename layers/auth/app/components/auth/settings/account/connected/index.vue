<template>
  <UiAccordionItem value="connected-accounts">
    <UiAccordionTrigger>
      {{ $t('auth.settings.account.connected.title') }}
    </UiAccordionTrigger>
    <UiAccordionContent>
      <AuthSettingsAccountConnectedContent />
    </UiAccordionContent>
  </UiAccordionItem>
</template>
