import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  session,
  user as userTable
} from '#layers/auth/server/infrastructure/schema';
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

describe('POST /api/auth/admin/impersonate-user', () => {
  // impersonation is the only way to create a Session through the production
  // auth configuration without a round trip to a Provider
  it('stores the CF-Connecting-IP address, not a forged x-forwarded-for, on the new Session', async () => {
    const { user: admin, headers } = await server.login();
    const { user: target } = await server.login();
    // the harness's login creates Users without the admin plugin
    await server.db
      .update(userTable)
      .set({ role: 'admin' })
      .where(eq(userTable.id, admin.id));

    headers.set('cf-connecting-ip', '198.51.100.7');
    headers.set('x-forwarded-for', '203.0.113.66');

    const response = await server.fetch('/api/auth/admin/impersonate-user', {
      method: 'POST',
      headers,
      json: { userId: target.id }
    });

    expect(response.status).toBe(200);
    expect(
      await server.db
        .select({ ipAddress: session.ipAddress })
        .from(session)
        .where(eq(session.impersonatedBy, admin.id))
    ).toEqual([{ ipAddress: '198.51.100.7' }]);
  });
});
