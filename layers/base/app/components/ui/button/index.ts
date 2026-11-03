import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

const raisedVariants: ('default' | 'secondary' | 'outline' | 'destructive')[] =
  ['default', 'secondary', 'outline', 'destructive'];

const signalIcon =
  '[--lit-icon-rest:var(--faint-foreground)] [--lit-icon-on:var(--signal)]';

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border whitespace-nowrap [transition:background-color_120ms,color_120ms,translate_60ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-35 aria-busy:pointer-events-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary-edge bg-primary text-primary-foreground hover:bg-primary-hover',
        destructive:
          'border-destructive-edge bg-destructive text-destructive-foreground',
        outline: `border-input text-secondary-foreground hover:bg-accent ${signalIcon}`,
        secondary: `border-secondary-edge bg-secondary text-secondary-foreground hover:bg-accent ${signalIcon}`,
        ghost:
          'border-transparent text-secondary-foreground hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-foreground',
        // important: cn can't merge the control heights, and the size comes later
        link: 'h-auto! border-0 p-0! text-muted-foreground decoration-1 underline-offset-4 hover:text-foreground hover:underline'
      },
      size: {
        default: 'h-control-md px-3.5 type-control',
        sm: 'h-control-sm px-2.5 type-chip',
        lg: 'h-control-lg px-5 type-control',
        icon: 'size-control-md p-0 type-control',
        'icon-sm': 'size-control-sm p-0 type-control',
        'icon-lg': 'size-control-lg p-0 type-control'
      }
    },
    compoundVariants: [
      {
        variant: raisedVariants,
        class:
          'chamfer border-b-(length:--edge-depth) active:translate-y-[3px] active:border-b active:pb-0'
      },
      {
        variant: raisedVariants,
        size: ['default', 'sm', 'lg'],
        class: 'lit-icon pb-[3px]'
      },
      { variant: 'ghost', size: 'default', class: 'px-2.5' },
      {
        variant: 'ghost',
        size: ['icon', 'icon-sm', 'icon-lg'],
        class: 'text-muted-foreground hover:text-foreground'
      }
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
