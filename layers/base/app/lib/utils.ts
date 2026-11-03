export { cn } from 'cn';

export const abbreviate = (value: string): string => {
  return value.slice(0, 2).toLocaleUpperCase();
};
