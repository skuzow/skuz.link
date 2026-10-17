import {
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '#shared/constants/link.constant';
import { normalizeLinkSlug } from '#shared/schemas/link.schema';
import {
  clientLinkRedirect,
  readCachedLinkRedirect,
  scheduleLinkClick,
  scheduleStoreLinkRedirect
} from '~~/server/utils/link-redirect-cache';

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return;

  const requestURL = getRequestURL(event);

  const pathname = requestURL.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_')) return;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return;

  const slug = normalizeLinkSlug(segments[0] ?? '');
  if (
    !slug ||
    RESERVED_LINK_SLUGS.has(slug) ||
    slug.startsWith('_') ||
    !LINK_SLUG_REGEX.test(slug)
  ) {
    return;
  }

  const repository = await useRepository(event);

  const cached = await readCachedLinkRedirect(requestURL.origin, slug);
  if (cached) {
    scheduleLinkClick(event, repository.link.incrementClicksBySlug(slug));
    return cached;
  }

  const redirectUrl = await repository.link.findRedirectUrlBySlug(slug);
  if (!redirectUrl) return;

  scheduleLinkClick(event, repository.link.incrementClicksBySlug(slug));
  scheduleStoreLinkRedirect(event, requestURL.origin, slug, redirectUrl);

  return clientLinkRedirect(redirectUrl);
});
