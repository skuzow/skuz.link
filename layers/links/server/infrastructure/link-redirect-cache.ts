import type { EventHandlerRequest, H3Event } from 'h3';
import { scheduleBackground } from '#layers/base/server/platform/background';

const LINK_REDIRECT_CACHE_TTL_SECONDS: number = 60;
const LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS: number = 15;

const MISS_HEADER = 'X-Link-Redirect';
const MISS_HEADER_VALUE = 'miss';

export type CachedLinkRedirect =
  { type: 'hit'; redirectUrl: string } | { type: 'miss' };

// cache keys include the origin, so every host keeps its own Redirects
class LinkRedirectCache {
  constructor(
    private readonly event: H3Event<EventHandlerRequest>,
    private readonly origin: string
  ) {}

  async read(slug: string): Promise<CachedLinkRedirect | null> {
    const cache = getDefaultCache();
    if (!cache) return null;

    try {
      const cached = await cache.match(this.request(slug));
      if (!cached) return null;

      if (cached.headers.get(MISS_HEADER) === MISS_HEADER_VALUE) {
        return { type: 'miss' };
      }

      const redirectUrl = cached.headers.get('Location');
      if (!redirectUrl) return null;

      return { type: 'hit', redirectUrl };
    } catch (error) {
      console.error('Failed to read link redirect cache', error);
      return null;
    }
  }

  scheduleStoreRedirect(slug: string, redirectUrl: string) {
    this.scheduleStore(
      slug,
      new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
          'Cache-Control': `public, max-age=${LINK_REDIRECT_CACHE_TTL_SECONDS}`
        }
      })
    );
  }

  scheduleStoreMiss(slug: string) {
    this.scheduleStore(
      slug,
      new Response(null, {
        status: 404,
        headers: {
          [MISS_HEADER]: MISS_HEADER_VALUE,
          'Cache-Control': `public, max-age=${LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS}`
        }
      })
    );
  }

  async purge(slugs: Iterable<string>) {
    const cache = getDefaultCache();
    if (!cache) return;

    await Promise.all(
      [...new Set(slugs)].map(async (slug) => {
        try {
          await cache.delete(this.request(slug));
        } catch (error) {
          console.error('Failed to purge link redirect cache', error);
        }
      })
    );
  }

  private request(slug: string): Request {
    return new Request(`${this.origin}/${slug}`, { method: 'GET' });
  }

  private scheduleStore(slug: string, response: Response) {
    const cache = getDefaultCache();
    if (!cache) return;

    const task = cache
      .put(this.request(slug), response)
      .catch((error: unknown) => {
        console.error('Failed to store link redirect cache', error);
      });

    scheduleBackground(this.event, task);
  }
}

type WorkersCacheStorage = CacheStorage & {
  default: Cache;
};

function hasDefaultCache(
  cacheStorage: CacheStorage
): cacheStorage is WorkersCacheStorage {
  return 'default' in cacheStorage;
}

function getDefaultCache(): Cache | null {
  if (typeof caches === 'undefined' || !hasDefaultCache(caches)) return null;

  return caches.default;
}

export default LinkRedirectCache;
