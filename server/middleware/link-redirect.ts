import { LINK_SLUG_REGEX } from '#shared/constants/link.constant';
import {
  isReservedLinkSlug,
  normalizeLinkSlug
} from '#shared/schemas/link.schema';

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return;

  const requestURL = getRequestURL(event);

  const pathname = requestURL.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_')) return;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return;

  const slug = normalizeLinkSlug(segments[0] ?? '');
  if (!slug || !LINK_SLUG_REGEX.test(slug) || isReservedLinkSlug(slug)) return;

  const repository = await useRepository(event);

  const cached = await readCachedLinkRedirect(requestURL.origin, slug);
  if (cached?.type === 'miss') return;

  if (cached?.type === 'hit') {
    scheduleLinkClick(event, repository.link.incrementClicksBySlug(slug));
    return clientLinkRedirect(cached.redirectUrl);
  }

  const redirectUrl = await repository.link.findRedirectUrlBySlug(slug);
  if (!redirectUrl) {
    scheduleStoreLinkMiss(event, requestURL.origin, slug);
    return;
  }

  scheduleLinkClick(event, repository.link.incrementClicksBySlug(slug));
  scheduleStoreLinkRedirect(event, requestURL.origin, slug, redirectUrl);

  return clientLinkRedirect(redirectUrl);
});
