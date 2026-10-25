import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { links } from '#layers/links/server/infrastructure/schema';
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
});
