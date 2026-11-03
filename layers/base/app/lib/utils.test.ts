import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps a type style beside a text colour', () => {
    const classes = cn('type-control text-primary-foreground').split(' ');

    expect(classes).toContain('type-control');
    expect(classes).toContain('text-primary-foreground');
  });
});
