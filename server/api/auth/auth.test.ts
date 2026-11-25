import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { clicks, links } from '#layers/links/server/infrastructure/schema';
import { setupTestServer } from '../../testing/server';

const server = await setupTestServer();

beforeEach(() => server.reset());

describe('POST /api/auth/delete-user', () => {
  it("deletes the user's links and purges their cached redirects", async () => {
    const { user, headers } = await server.login();

    const first = await server.createLink(headers, 'first-link');
    const second = await server.createLink(headers, 'second-link');

    expect(await server.redirectTarget('first-link')).toBe(first.redirectUrl);
    expect(await server.redirectTarget('second-link')).toBe(second.redirectUrl);

    const response = await server.fetch('/api/auth/delete-user', {
      method: 'POST',
      headers,
      json: {}
    });
    await server.flush();

    expect(response.status).toBe(200);
    expect(
      await server.db.select().from(links).where(eq(links.userId, user.id))
    ).toEqual([]);
    expect(await server.redirectTarget('first-link')).toBeNull();
    expect(await server.redirectTarget('second-link')).toBeNull();
  });

  it("deletes the Clicks of the user's links", async () => {
    const { headers } = await server.login();
    const link = await server.createLink(headers, 'clicked-link');

    await server.fetch('/clicked-link');
    await server.flush();

    const findClicks = () =>
      server.db.select().from(clicks).where(eq(clicks.linkId, link.id));

    expect(await findClicks()).toHaveLength(1);

    await server.fetch('/api/auth/delete-user', {
      method: 'POST',
      headers,
      json: {}
    });
    await server.flush();

    expect(await findClicks()).toEqual([]);
  });
});
