import { eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { links } from '../../database/schema';
import { setupTestServer } from '../../testing/server';

const server = await setupTestServer();

// getAuth caches the auth instance built for the first request, so make that
// request from another origin than the account deletion below
beforeAll(() => server.fetch('/', { origin: 'http://127.0.0.1:3000' }));

beforeEach(() => server.reset());

const createLink = (headers: Headers, slug: string) =>
  server.fetch('/api/links', {
    method: 'POST',
    headers,
    json: { slug, redirectUrl: `https://example.com/${slug}` }
  });

const redirectStatus = async (slug: string) => {
  const response = await server.fetch(`/${slug}`);
  await server.flush();

  return response.status;
};

describe('POST /api/auth/delete-user', () => {
  it("deletes the user's links and purges their cached redirects", async () => {
    const { user, headers } = await server.login();

    await createLink(headers, 'first-link');
    await createLink(headers, 'second-link');

    expect(await redirectStatus('first-link')).toBe(302);
    expect(await redirectStatus('second-link')).toBe(302);

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
    expect(await redirectStatus('first-link')).toBe(404);
    expect(await redirectStatus('second-link')).toBe(404);
  });
});
