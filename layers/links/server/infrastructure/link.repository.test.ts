import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { user } from '#layers/auth/server/infrastructure/schema';
import { setupTestServer } from '~~/server/testing/server';
import { LinkAlreadyInUseError } from '#layers/links/shared/domain/link.error';
import LinkRepository from './link.repository';
import { links } from './schema';

const server = await setupTestServer();
const repository = new LinkRepository(server.db);

const ALICE = 'alice';

beforeEach(async () => {
  await server.reset();
  await server.db
    .insert(user)
    .values({ id: ALICE, name: 'Alice', email: 'alice@example.com' });
});

const linkData = (slug: string) => ({
  slug,
  redirectUrl: `https://example.com/${slug}`
});

describe('LinkRepository', () => {
  it('rethrows other constraint errors untouched', async () => {
    const error = await repository
      .create('missing-user', linkData('orphan'))
      .catch((error: unknown) => error);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(LinkAlreadyInUseError);
  });

  it('resolves redirect urls by slug', async () => {
    await repository.create(ALICE, linkData('known'));

    expect(await repository.findRedirectUrlBySlug('known')).toBe(
      'https://example.com/known'
    );
    expect(await repository.findRedirectUrlBySlug('unknown')).toBeNull();
  });

  it('increments clicks for the matching slug only', async () => {
    await repository.create(ALICE, linkData('clicked'));
    await repository.create(ALICE, linkData('untouched'));

    await repository.incrementClicksBySlug('clicked');
    await repository.incrementClicksBySlug('clicked');

    const rows = await server.db
      .select({ slug: links.slug, clicks: links.clicks })
      .from(links)
      .where(eq(links.userId, ALICE));

    expect(
      Object.fromEntries(rows.map((row) => [row.slug, row.clicks]))
    ).toEqual({ clicked: 2, untouched: 0 });
  });
});
