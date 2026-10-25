import type { EventHandlerRequest, H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LinkRedirectCache, {
  LINK_REDIRECT_CACHE_TTL_SECONDS,
  LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS
} from './link-redirect-cache';

const ORIGIN = 'https://skuz.link';
const SLUG = 'docs';
const REDIRECT_URL = 'https://example.com/docs';

const store = new Map<string, Response>();

const fakeCache = {
  match: vi.fn(async (request: Request) => {
    const cached = store.get(request.url);
    return cached?.clone();
  }),
  put: vi.fn(async (request: Request, response: Response) => {
    store.set(request.url, response);
  }),
  delete: vi.fn(async (request: Request) => store.delete(request.url))
};

const event = {
  context: {}
} as unknown as H3Event<EventHandlerRequest>;

const redirectCache = new LinkRedirectCache(event, ORIGIN);

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
  vi.stubGlobal('caches', { default: fakeCache });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('read', () => {
  it('returns null when nothing is cached', async () => {
    expect(await redirectCache.read(SLUG)).toBeNull();
  });

  it('returns a hit with the stored Location after a redirect is stored', async () => {
    redirectCache.scheduleStoreRedirect(SLUG, REDIRECT_URL);
    await flush();

    expect(await redirectCache.read(SLUG)).toEqual({
      type: 'hit',
      redirectUrl: REDIRECT_URL
    });
  });

  it('returns a miss after a miss is stored', async () => {
    redirectCache.scheduleStoreMiss(SLUG);
    await flush();

    expect(await redirectCache.read(SLUG)).toEqual({
      type: 'miss'
    });
  });

  it('returns null when the cache is unavailable', async () => {
    vi.stubGlobal('caches', undefined);

    expect(await redirectCache.read(SLUG)).toBeNull();
  });

  it('returns null and logs when the cache read throws', async () => {
    const error = new Error('boom');
    fakeCache.match.mockRejectedValueOnce(error);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(await redirectCache.read(SLUG)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to read link redirect cache',
      error
    );
  });
});

describe('scheduleStoreRedirect', () => {
  it('stores a 302 with the redirect TTL', async () => {
    redirectCache.scheduleStoreRedirect(SLUG, REDIRECT_URL);
    await flush();

    const stored = store.get(`${ORIGIN}/${SLUG}`);
    expect(stored?.status).toBe(302);
    expect(stored?.headers.get('Location')).toBe(REDIRECT_URL);
    expect(stored?.headers.get('Cache-Control')).toBe(
      `public, max-age=${LINK_REDIRECT_CACHE_TTL_SECONDS}`
    );
  });

  it('logs and swallows store failures', async () => {
    const error = new Error('put failed');
    fakeCache.put.mockRejectedValueOnce(error);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      redirectCache.scheduleStoreRedirect(SLUG, REDIRECT_URL)
    ).not.toThrow();
    await flush();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to store link redirect cache',
      error
    );
  });
});

describe('scheduleStoreMiss', () => {
  it('stores a 404 marker with the not-found TTL', async () => {
    redirectCache.scheduleStoreMiss(SLUG);
    await flush();

    const stored = store.get(`${ORIGIN}/${SLUG}`);
    expect(stored?.status).toBe(404);
    expect(stored?.headers.get('X-Link-Redirect')).toBe('miss');
    expect(stored?.headers.get('Cache-Control')).toBe(
      `public, max-age=${LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS}`
    );
  });
});

describe('purge', () => {
  it('deletes a stored redirect', async () => {
    redirectCache.scheduleStoreRedirect(SLUG, REDIRECT_URL);
    await flush();

    await redirectCache.purge([SLUG]);

    expect(store.has(`${ORIGIN}/${SLUG}`)).toBe(false);
    expect(await redirectCache.read(SLUG)).toBeNull();
  });

  it('deletes a stored miss so a new link is found', async () => {
    redirectCache.scheduleStoreMiss(SLUG);
    await flush();

    await redirectCache.purge([SLUG]);

    expect(await redirectCache.read(SLUG)).toBeNull();
  });

  it('deletes each distinct slug once', async () => {
    await redirectCache.purge([SLUG, SLUG, 'other']);

    expect(fakeCache.delete).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the cache is unavailable', async () => {
    vi.stubGlobal('caches', undefined);

    await expect(redirectCache.purge([SLUG])).resolves.toBeUndefined();
  });
});
