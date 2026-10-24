import type { EventHandlerRequest, H3Event } from 'h3';
import {
  LINK_REDIRECT_CACHE_TTL_SECONDS,
  LINK_REDIRECT_NOT_FOUND_CACHE_TTL_SECONDS
} from '#shared/constants/link.constant';

const CLIENT_CACHE_CONTROL = 'no-store';
const MISS_HEADER = 'X-Link-Redirect';
const MISS_HEADER_VALUE = 'miss';

export type CachedLinkRedirect =
  { type: 'hit'; redirectUrl: string } | { type: 'miss' };

export function linkRedirectRequest(origin: string, slug: string): Request {
  return new Request(`${origin}/${slug}`, { method: 'GET' });
}

export function clientLinkRedirect(redirectUrl: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Cache-Control': CLIENT_CACHE_CONTROL
    }
  });
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

export function scheduleLinkClick(
  event: H3Event<EventHandlerRequest>,
  increment: Promise<void>
) {
  const task = increment.catch((error: unknown) => {
    console.error('Failed to increment link clicks', error);
  });

  scheduleBackground(event, task);
}

export async function purgeLinkRedirect(origin: string, slug: string) {
  const cache = getDefaultCache();
  if (!cache) return;

  try {
    await cache.delete(linkRedirectRequest(origin, slug));
  } catch (error) {
    console.error('Failed to purge link redirect cache', error);
  }
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

function scheduleBackground(
  event: H3Event<EventHandlerRequest>,
  task: Promise<void>
) {
  const executionContext = event.context.cloudflare?.context;
  if (executionContext) {
    executionContext.waitUntil(task);
    return;
  }

  if (event.context.waitUntil) {
    event.context.waitUntil(task);
    return;
  }

  void task;
}
