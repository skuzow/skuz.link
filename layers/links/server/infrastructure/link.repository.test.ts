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
const BOB = 'bob';

beforeEach(async () => {
  await server.reset();
  await server.db.insert(user).values([
    { id: ALICE, name: 'Alice', email: 'alice@example.com' },
    { id: BOB, name: 'Bob', email: 'bob@example.com' }
  ]);
});

const linkData = (slug: string) => ({
  slug,
  redirectUrl: `https://example.com/${slug}`
});

describe('LinkRepository', () => {
  it('creates a link with defaults', async () => {
    const link = await repository.create(ALICE, linkData('repo'));

    expect(link).toMatchObject({
      slug: 'repo',
      redirectUrl: 'https://example.com/repo',
      userId: ALICE,
      clicks: 0
    });
    expect(link.id).toEqual(expect.any(String));
  });

  it('maps a duplicate slug on create to LinkAlreadyInUseError', async () => {
    await repository.create(BOB, linkData('taken'));

    await expect(
      repository.create(ALICE, linkData('taken'))
    ).rejects.toBeInstanceOf(LinkAlreadyInUseError);
  });

  it('maps a duplicate slug on update to LinkAlreadyInUseError', async () => {
    await repository.create(BOB, linkData('taken'));
    const link = await repository.create(ALICE, linkData('mine'));

    await expect(
      repository.update(link.id, linkData('taken'))
    ).rejects.toBeInstanceOf(LinkAlreadyInUseError);
  });

  it('rethrows other constraint errors untouched', async () => {
    const error = await repository
      .create('missing-user', linkData('orphan'))
      .catch((error: unknown) => error);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(LinkAlreadyInUseError);
  });

  it('only finds a link for its owner', async () => {
    const link = await repository.create(ALICE, linkData('owned'));

    expect(await repository.findOwnedById(link.id, ALICE)).toMatchObject({
      id: link.id
    });
    expect(await repository.findOwnedById(link.id, BOB)).toBeNull();
  });

  it('updates fields and bumps updatedAt', async () => {
    await server.db.insert(links).values({
      id: 'stale',
      ...linkData('stale'),
      userId: ALICE,
      createdAt: new Date(1_000),
      updatedAt: new Date(1_000)
    });

    const link = await repository.update('stale', linkData('fresh'));

    expect(link.slug).toBe('fresh');
    expect(link.updatedAt.getTime()).toBeGreaterThan(1_000);
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
