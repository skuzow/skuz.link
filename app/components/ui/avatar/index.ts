import { cva, type VariantProps } from 'class-variance-authority';

export { default as Avatar } from './Avatar.vue';
export { default as AvatarFallback } from './AvatarFallback.vue';
export { default as AvatarImage } from './AvatarImage.vue';

export const avatarVariant = cva('relative flex shrink-0 overflow-hidden', {
  variants: {
    size: {
      xs: 'size-9 text-base',
      sm: 'size-10 text-lg',
      base: 'size-16 text-2xl',
      lg: 'size-24 text-5xl',
      xl: 'size-32 text-6xl'
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-md'
    }
  },
  defaultVariants: {
    size: 'xs',
    shape: 'square'
  }
});

export type AvatarVariants = VariantProps<typeof avatarVariant>;
