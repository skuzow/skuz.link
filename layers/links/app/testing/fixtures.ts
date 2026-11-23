import type { Click } from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';

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

export const makeClick = (overrides: Partial<Click> = {}): Click => ({
  id: 1,
  createdAt: new Date('2026-11-19T12:29:00.000Z'),
  country: 'ES',
  region: 'Community of Madrid',
  city: 'Madrid',
  referrer: null,
  browser: null,
  os: null,
  device: null,
  bot: false,
  botName: null,
  ...overrides
});
