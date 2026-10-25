import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LINK_SLUG_MAX } from '#layers/links/shared/domain/link.constant';
import { links } from '#layers/links/server/infrastructure/schema';
import LinkRepository from '#layers/links/server/infrastructure/link.repository';
import { setupTestServer } from '~~/server/testing/server';

const server = await setupTestServer();

const REDIRECT_URL = 'https://example.com/target';
const TOO_LONG_SLUG = 'a'.repeat(LINK_SLUG_MAX + 1);

let userId: string;

beforeEach(async () => {
  await server.reset();

  const { user } = await server.login();
  userId = user.id;
});

afterEach(() => vi.restoreAllMocks());

const insertLink = async (slug: string, redirectUrl = REDIRECT_URL) => {
  await server.db
    .insert(links)
    .values({ id: crypto.randomUUID(), slug, redirectUrl, userId });
};

const findClicks = async (slug: string) => {
  const [link] = await server.db
    .select({ clicks: links.clicks })
    .from(links)
    .where(eq(links.slug, slug));

  return link?.clicks;
};

describe('link redirect middleware', () => {
  it('redirects a known slug without client caching and counts the click', async () => {
    await insertLink('repo');

    const response = await server.fetch('/repo');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(REDIRECT_URL);
    expect(response.headers.get('cache-control')).toBe('no-store');

    await server.flush();
    expect(await findClicks('repo')).toBe(1);
  });

  it('redirects HEAD requests without counting a click', async () => {
    await insertLink('head-check');

    const response = await server.fetch('/head-check', { method: 'HEAD' });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(REDIRECT_URL);

    await server.flush();
    expect(await findClicks('head-check')).toBe(0);
  });

  it('serves cached redirects to HEAD requests without counting a click', async () => {
    await insertLink('head-cached');
    await server.fetch('/head-cached');
    await server.flush();

    const response = await server.fetch('/head-cached', { method: 'HEAD' });

    expect(response.status).toBe(302);

    await server.flush();
    expect(await findClicks('head-cached')).toBe(1);
  });

  it('matches slugs case-insensitively and with a trailing slash', async () => {
    await insertLink('blog-post');

    const response = await server.fetch('/Blog-Post/');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(REDIRECT_URL);
  });

  it('serves a cached redirect and still counts the click', async () => {
    await insertLink('cached');
    await server.fetch('/cached');
    await server.flush();

    await server.db
      .update(links)
      .set({ redirectUrl: 'https://example.com/changed' })
      .where(eq(links.slug, 'cached'));

    const response = await server.fetch('/cached');

    expect(response.headers.get('location')).toBe(REDIRECT_URL);

    await server.flush();
    expect(await findClicks('cached')).toBe(2);
  });

  it('still redirects when counting the click fails', async () => {
    await insertLink('click-fails');

    const error = new Error('increment failed');
    vi.spyOn(
      LinkRepository.prototype,
      'incrementClicksBySlug'
    ).mockRejectedValueOnce(error);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await server.fetch('/click-fails');
    await server.flush();

    expect(response.status).toBe(302);
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to increment link clicks',
      error
    );
  });

  it('falls through for an unknown slug and caches the miss', async () => {
    const response = await server.fetch('/unknown');

    expect(response.status).toBe(404);

    await server.flush();
    await insertLink('unknown');

    expect((await server.fetch('/unknown')).status).toBe(404);
  });

  it.each([
    ['POST', '/pass-post', 'pass-post'],
    ['GET', '/pass-nested/extra', 'pass-nested'],
    ['GET', '/_pass-internal', 'pass-internal'],
    ['GET', '/pass.svg', 'pass'],
    ['GET', '/login', 'login'],
    ['GET', `/${TOO_LONG_SLUG}`, TOO_LONG_SLUG]
  ])('ignores %s %s', async (method, path, slug) => {
    await insertLink(slug);

    const response = await server.fetch(path, { method });

    expect(response.status).not.toBe(302);
    expect(response.headers.get('location')).toBeNull();
  });
});
