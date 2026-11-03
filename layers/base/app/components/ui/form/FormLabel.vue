<script lang="ts" setup>
import type { LabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { Label } from '#layers/base/app/components/ui/label';
import { useFormField } from './useFormField';

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const { formItemId } = useFormField();
</script>

<template>
  <Label data-slot="form-label" :class="props.class" :for="formItemId">
    <slot />
  </Label>
</template>
