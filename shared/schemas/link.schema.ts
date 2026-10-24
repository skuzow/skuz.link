import { z } from 'zod';

import {
  LINK_SLUG_MIN,
  LINK_SLUG_MAX,
  LINK_REDIRECT_URL_MAX,
  LINK_REDIRECT_URL_PROTOCOLS,
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '../constants/link.constant';

export const normalizeLinkSlug = (value: string) =>
  value.trim().replace(/^\/+/, '').toLowerCase();

export const isReservedLinkSlug = (slug: string) =>
  RESERVED_LINK_SLUGS.has(slug);

// zod still runs refinements after .url() fails, so this must not throw
const isHttpUrl = (value: string) => {
  try {
    return LINK_REDIRECT_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const LinkSlugSchema = z
  .string()
  .transform(normalizeLinkSlug)
  .pipe(
    z
      .string()
      .min(LINK_SLUG_MIN)
      .max(LINK_SLUG_MAX)
      .regex(LINK_SLUG_REGEX)
      .refine((slug) => !isReservedLinkSlug(slug))
  );

export const LinkRedirectUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(LINK_REDIRECT_URL_MAX)
  .url()
  .refine(isHttpUrl);

export const LinkCreationSchema = z.object({
  slug: LinkSlugSchema,
  redirectUrl: LinkRedirectUrlSchema
});
