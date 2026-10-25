import { LinkSlugSchema } from '#layers/links/shared/domain/link.schema';
import { useRedirectService } from '#layers/links/server/container';

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

  const pathname = getRequestURL(event).pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_')) return;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return;

  const result = LinkSlugSchema.safeParse(segments[0]);
  if (!result.success) return;

  const redirectService = await useRedirectService(event);
  const redirectUrl = await redirectService.resolve(result.data, {
    // HEAD only asks whether the Short URL exists
    isExistenceCheck: event.method === 'HEAD'
  });
  if (!redirectUrl) return;

  return clientLinkRedirect(redirectUrl);
});
