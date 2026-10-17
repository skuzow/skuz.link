import type { EventHandlerRequest, H3Event } from 'h3';
import { LINK_REDIRECT_CACHE_TTL_SECONDS } from '#shared/constants/link.constant';

const STORED_CACHE_CONTROL = `public, max-age=${LINK_REDIRECT_CACHE_TTL_SECONDS}`;
const CLIENT_CACHE_CONTROL = 'no-store';

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
): Promise<Response | null> {
  const cache = getDefaultCache();
  if (!cache) return null;

  try {
    const cached = await cache.match(linkRedirectRequest(origin, slug));
    const location = cached?.headers.get('Location');
    if (!location) return null;

    return clientLinkRedirect(location);
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
  const cache = getDefaultCache();
  if (!cache) return;

  const task = cache
    .put(
      linkRedirectRequest(origin, slug),
      new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
          'Cache-Control': STORED_CACHE_CONTROL
        }
      })
    )
    .catch((error: unknown) => {
      console.error('Failed to store link redirect cache', error);
    });

  scheduleBackground(event, task);
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
