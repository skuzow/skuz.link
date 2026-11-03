import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as InputGroup } from './InputGroup.vue';
export { default as InputGroupAddon } from './InputGroupAddon.vue';
export { default as InputGroupButton } from './InputGroupButton.vue';
export { default as InputGroupInput } from './InputGroupInput.vue';
export { default as InputGroupText } from './InputGroupText.vue';

export const inputGroupButtonVariants = cva(
  'text-sm shadow-none flex gap-2 items-center',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: 'h-8 px-2.5 gap-1.5 has-[>svg]:px-2.5',
        'icon-xs': 'size-6 p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0'
      }
    },
    defaultVariants: {
      size: 'xs'
    }
  }
);

export type InputGroupButtonVariants = VariantProps<
  typeof inputGroupButtonVariants
>;
