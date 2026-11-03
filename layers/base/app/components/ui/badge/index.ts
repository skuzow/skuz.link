import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
  'type-chip inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-[7px] whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-signal bg-signal-wash text-signal',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-destructive text-destructive',
        outline: 'border-border-strong text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
