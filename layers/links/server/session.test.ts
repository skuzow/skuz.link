import type { EventHandlerRequest, H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestServer } from '~~/server/testing/server';

// sees every Session lookup, so a test can count them or make them all fail
const sessionLookup = vi.hoisted(() =>
  vi.fn((lookup: () => Promise<unknown>) => lookup())
);

vi.mock(
  '#layers/auth/server/infrastructure/better-auth',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('#layers/auth/server/infrastructure/better-auth')
      >();

    return {
      ...original,
      getAuth: (event?: H3Event<EventHandlerRequest>) => {
        const auth = original.getAuth(event);
        const getSession = ((...args: Parameters<typeof auth.api.getSession>) =>
          sessionLookup(() =>
            auth.api.getSession(...args)
          )) as typeof auth.api.getSession;

        return { ...auth, api: { ...auth.api, getSession } };
      }
    };
  }
);

const server = await setupTestServer();

beforeEach(() => server.reset());

afterEach(() => sessionLookup.mockReset());

describe('Session lookup', () => {
  it('redirects a signed-in Visitor while every Session lookup fails', async () => {
    const { headers } = await server.login();
    const link = await server.createLink(headers, 'session-fails');
    sessionLookup.mockRejectedValue(new Error('session lookup failed'));

    const response = await server.fetch('/session-fails', { headers });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(link.redirectUrl);
  });

  it('looks up the Session once per authenticated API call', async () => {
    const { headers } = await server.login();
    sessionLookup.mockClear();

    const response = await server.fetch('/api/links', { headers });

    expect(response.status).toBe(200);
    expect(sessionLookup).toHaveBeenCalledOnce();
  });
});
