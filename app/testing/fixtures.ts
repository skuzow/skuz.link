import type { Link } from '#shared/types/link.type';

export const makeLink = (overrides: Partial<Link> = {}): Link => ({
  id: 'link-1',
  slug: 'repo',
  redirectUrl: 'https://example.com/repo',
  userId: 'user-1',
  clicks: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides
});
