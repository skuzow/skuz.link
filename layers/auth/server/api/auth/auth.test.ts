import { beforeEach, describe, expect, it } from 'vitest';
import { setupTestServer } from '~~/server/testing/server';

const server = await setupTestServer();

beforeEach(() => server.reset());

describe('GET /api/auth/get-session', () => {
  it('finds the Session of a request without the Cloudflare context', async () => {
    const { user, headers } = await server.login();

    // on the Worker, Nuxt renders its error page through such a request
    const response = await server.fetch('/api/auth/get-session', {
      headers,
      cloudflare: false
    });

    expect(await response.json()).toMatchObject({ user: { id: user.id } });
  });
});
