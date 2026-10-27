<template>
  <UiAccordionItem value="connected-accounts">
    <UiAccordionTrigger>
      <h3 class="font-bold">
        {{ $t('auth.settings.account.connected.title') }}
      </h3>
    </UiAccordionTrigger>
    <UiAccordionContent class="pl-2.5">
      <AuthSettingsAccountConnectedContent />
    </UiAccordionContent>
  </UiAccordionItem>
</template>
