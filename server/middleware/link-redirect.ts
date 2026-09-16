import {
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '#shared/constants/link.constant';
import { normalizeLinkSlug } from '#shared/schemas/link.schema';

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return;

  const pathname = getRequestURL(event).pathname;
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
  const updated = await repository.link.incrementClicksBySlug(slug);
  if (!updated) return;

  return sendRedirect(event, updated.redirectUrl, 302);
});
