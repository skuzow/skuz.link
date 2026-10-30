import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { session } from '#layers/auth/server/infrastructure/schema';
import { setupTestServer } from '~~/server/testing/server';
import purgeSessions from './purge-sessions';

const server = await setupTestServer();

beforeEach(() => server.reset());

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

describe('auth:purge-sessions task', () => {
  it('deletes the Sessions that expired more than 30 days ago', async () => {
    const { user } = await server.login();
    const expiredSession = (id: string, expiresAt: Date) => ({
      id,
      token: `${id}-token`,
      expiresAt,
      updatedAt: expiresAt,
      userId: user.id
    });

    await server.db
      .insert(session)
      .values([
        expiredSession('expired-31-days-ago', daysAgo(31)),
        expiredSession('expired-29-days-ago', daysAgo(29))
      ]);

    await purgeSessions.run({
      name: 'auth:purge-sessions',
      payload: {},
      context: {}
    });

    const remaining = await server.db
      .select({ id: session.id, expiresAt: session.expiresAt })
      .from(session)
      .where(eq(session.userId, user.id));

    expect(remaining.map(({ id }) => id)).not.toContain('expired-31-days-ago');
    expect(remaining.map(({ id }) => id)).toContain('expired-29-days-ago');
    // the login's active Session stays too
    expect(
      remaining.filter(({ expiresAt }) => expiresAt > new Date())
    ).toHaveLength(1);
  });
});
