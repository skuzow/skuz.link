import { cva, type VariantProps } from 'class-variance-authority';

export { default as Avatar } from './Avatar.vue';
export { default as AvatarFallback } from './AvatarFallback.vue';
export { default as AvatarImage } from './AvatarImage.vue';

export const avatarVariant = cva(
  'bg-secondary text-secondary-foreground font-pixel relative flex shrink-0 overflow-hidden uppercase',
  {
    variants: {
      size: {
        xs: 'size-8 text-xs/3',
        sm: 'size-10 text-[13px]/[13px]',
        base: 'size-16 text-2xl',
        lg: 'size-24 text-5xl',
        xl: 'size-32 text-6xl'
      }
    },
    defaultVariants: {
      size: 'xs'
    }
  }
);

export type AvatarVariants = VariantProps<typeof avatarVariant>;
