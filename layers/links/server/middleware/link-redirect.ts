import { scheduleBackground } from '#layers/base/server/platform/background';
import { LinkSlugSchema } from '#layers/links/shared/domain/link.schema';
import {
  readCachedLinkRedirect,
  scheduleStoreLinkMiss,
  scheduleStoreLinkRedirect
} from '#layers/links/server/infrastructure/link-redirect-cache';
import { useRepository } from '#layers/links/server/infrastructure/repository';

const REDIRECT_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD']);
const CLIENT_CACHE_CONTROL = 'no-store';

function clientLinkRedirect(redirectUrl: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Cache-Control': CLIENT_CACHE_CONTROL
    }
  });
}

export default defineEventHandler(async (event) => {
  if (!REDIRECT_METHODS.has(event.method)) return;

  const requestURL = getRequestURL(event);

  const pathname = requestURL.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_')) return;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return;

  const result = LinkSlugSchema.safeParse(segments[0]);
  if (!result.success) return;

  const slug = result.data;

  const repository = await useRepository(event);

  // HEAD comes from bots and link previews, so only GET counts as a click
  const countClick = () => {
    if (event.method !== 'GET') return;

    const increment = repository.link
      .incrementClicksBySlug(slug)
      .catch((error: unknown) => {
        console.error('Failed to increment link clicks', error);
      });

    scheduleBackground(event, increment);
  };

  const cached = await readCachedLinkRedirect(requestURL.origin, slug);
  if (cached?.type === 'miss') return;

  if (cached?.type === 'hit') {
    countClick();
    return clientLinkRedirect(cached.redirectUrl);
  }

  const redirectUrl = await repository.link.findRedirectUrlBySlug(slug);
  if (!redirectUrl) {
    scheduleStoreLinkMiss(event, requestURL.origin, slug);
    return;
  }

  countClick();
  scheduleStoreLinkRedirect(event, requestURL.origin, slug, redirectUrl);

  return clientLinkRedirect(redirectUrl);
});
