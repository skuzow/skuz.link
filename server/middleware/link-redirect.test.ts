import { readdirSync, readFileSync } from 'node:fs';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { RESERVED_LINK_SLUGS } from '#shared/constants/link.constant';
import { links } from '../database/schema';
import { setupTestServer } from '../testing/server';

const server = await setupTestServer();

const REDIRECT_URL = 'https://example.com/target';

let userId: string;

beforeEach(async () => {
  await server.reset();

  const { user } = await server.login();
  userId = user.id;
});

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
    ['GET', '/login', 'login']
  ])('ignores %s %s', async (method, path, slug) => {
    await insertLink(slug);

    const response = await server.fetch(path, { method });

    expect(response.status).not.toBe(302);
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('reserved slugs', () => {
  it('cover every top-level page route, so links cannot shadow pages', () => {
    const pages = readdirSync(new URL('../../app/pages', import.meta.url))
      .map((entry) => entry.replace(/\.vue$/, ''))
      .filter((name) => name !== 'index' && !name.startsWith('['));

    expect(pages.length).toBeGreaterThan(0);

    for (const page of pages) {
      expect(RESERVED_LINK_SLUGS.has(page), page).toBe(true);
    }
  });

  it('cover every locale prefix, so links cannot shadow localized routes', () => {
    const nuxtConfig = readFileSync(
      new URL('../../nuxt.config.ts', import.meta.url),
      'utf8'
    );
    const localeCodes = [...nuxtConfig.matchAll(/code:\s*'([^']+)'/g)].map(
      ([, code]) => code
    );

    expect(localeCodes.length).toBeGreaterThan(0);

    for (const code of localeCodes) {
      expect(RESERVED_LINK_SLUGS.has(code!), code).toBe(true);
    }
  });
});
