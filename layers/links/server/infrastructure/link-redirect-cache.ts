import type { EventHandlerRequest, H3Event } from 'h3';
import {
  LINK_REDIRECT_CACHE_TTL_SECONDS,
  LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS
} from '#layers/links/shared/domain/link.constant';
import { scheduleBackground } from '#layers/base/server/platform/background';

const MISS_HEADER = 'X-Link-Redirect';
const MISS_HEADER_VALUE = 'miss';

export type CachedLinkRedirect =
  { type: 'hit'; redirectUrl: string } | { type: 'miss' };

export function linkRedirectRequest(origin: string, slug: string): Request {
  return new Request(`${origin}/${slug}`, { method: 'GET' });
}

export async function readCachedLinkRedirect(
  origin: string,
  slug: string
): Promise<CachedLinkRedirect | null> {
  const cache = getDefaultCache();
  if (!cache) return null;

  try {
    const cached = await cache.match(linkRedirectRequest(origin, slug));
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

export function scheduleStoreLinkRedirect(
  event: H3Event<EventHandlerRequest>,
  origin: string,
  slug: string,
  redirectUrl: string
) {
  scheduleStore(
    event,
    linkRedirectRequest(origin, slug),
    new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        'Cache-Control': `public, max-age=${LINK_REDIRECT_CACHE_TTL_SECONDS}`
      }
    })
  );
}

export function scheduleStoreLinkMiss(
  event: H3Event<EventHandlerRequest>,
  origin: string,
  slug: string
) {
  scheduleStore(
    event,
    linkRedirectRequest(origin, slug),
    new Response(null, {
      status: 404,
      headers: {
        [MISS_HEADER]: MISS_HEADER_VALUE,
        'Cache-Control': `public, max-age=${LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS}`
      }
    })
  );
}

export async function purgeLinkRedirects(
  origin: string,
  slugs: Iterable<string>
) {
  const cache = getDefaultCache();
  if (!cache) return;

  await Promise.all(
    [...new Set(slugs)].map(async (slug) => {
      try {
        await cache.delete(linkRedirectRequest(origin, slug));
      } catch (error) {
        console.error('Failed to purge link redirect cache', error);
      }
    })
  );
}

function scheduleStore(
  event: H3Event<EventHandlerRequest>,
  request: Request,
  response: Response
) {
  const cache = getDefaultCache();
  if (!cache) return;

  const task = cache.put(request, response).catch((error: unknown) => {
    console.error('Failed to store link redirect cache', error);
  });

  scheduleBackground(event, task);
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
