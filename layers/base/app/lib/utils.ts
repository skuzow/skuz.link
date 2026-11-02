export { cn } from 'cn';

export const abbreviate = (value: string): string => {
  return value.slice(0, 2).toLocaleUpperCase();
};

export const titleCase = (value: string): string => {
  return value[0]?.toUpperCase() + value.substring(1).toLowerCase();
};
