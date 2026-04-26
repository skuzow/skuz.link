<template>
  <UiAccordionItem value="linked-accounts">
    <UiAccordionTrigger>
      <h3 class="font-bold">
        {{ $t('auth.settings.account.linked.title') }}
      </h3>
    </UiAccordionTrigger>
    <UiAccordionContent class="pl-2.5">
      <AuthSettingsAccountLinkedContent />
    </UiAccordionContent>
  </UiAccordionItem>
</template>
