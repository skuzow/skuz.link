import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const abbreviate = (value: string): string => {
  return value.slice(0, 2).toLocaleUpperCase();
};

export const titleCase = (value: string): string => {
  return value[0]?.toUpperCase() + value.substring(1).toLowerCase();
};
