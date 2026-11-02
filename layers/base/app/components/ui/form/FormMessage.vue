<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from 'cn';
import { ErrorMessage } from 'vee-validate';
import { toValue } from 'vue';
import SquareAlertIcon from '~icons/pixelarticons/square-alert';
import { useFormField } from './useFormField';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const { name, formMessageId } = useFormField();
</script>

<template>
  <ErrorMessage
    :id="formMessageId"
    v-slot="{ message }"
    data-slot="form-message"
    as="p"
    :name="toValue(name)"
    :class="
      cn('text-destructive type-small flex items-center gap-1.5', props.class)
    "
  >
    <SquareAlertIcon class="shrink-0" />
    {{ message }}
  </ErrorMessage>
</template>
