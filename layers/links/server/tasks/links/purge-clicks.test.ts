import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { clicks, links } from '#layers/links/server/infrastructure/schema';
import { setupTestServer } from '~~/server/testing/server';
import purgeClicks from './purge-clicks';

const server = await setupTestServer();

beforeEach(() => server.reset());

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

describe('links:purge-clicks task', () => {
  it('deletes the Clicks older than 364 days and keeps the Click count', async () => {
    const { user } = await server.login();

    await server.db.insert(links).values({
      id: 'link',
      slug: 'github',
      redirectUrl: 'https://github.com',
      userId: user.id,
      clicks: 2
    });
    await server.db.insert(clicks).values([
      { id: 1, linkId: 'link', createdAt: daysAgo(365) },
      { id: 2, linkId: 'link', createdAt: daysAgo(363) }
    ]);

    await purgeClicks.run({
      name: 'links:purge-clicks',
      payload: {},
      context: {}
    });

    const remaining = await server.db
      .select({ id: clicks.id })
      .from(clicks)
      .where(eq(clicks.linkId, 'link'));
    expect(remaining.map(({ id }) => id)).toEqual([2]);

    const [link] = await server.db
      .select({ clicks: links.clicks })
      .from(links)
      .where(eq(links.id, 'link'));
    expect(link?.clicks).toBe(2);
  });
});
