import { z } from 'zod';

import {
  LINK_SLUG_MIN,
  LINK_SLUG_MAX,
  LINK_REDIRECT_URL_MAX,
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '../constants/link.constant';

export const normalizeLinkSlug = (value: string) =>
  value.trim().replace(/^\/+/, '').toLowerCase();

export const LinkSlugSchema = z
  .string()
  .transform(normalizeLinkSlug)
  .pipe(
    z
      .string()
      .min(LINK_SLUG_MIN)
      .max(LINK_SLUG_MAX)
      .regex(LINK_SLUG_REGEX)
      .refine((slug) => !RESERVED_LINK_SLUGS.has(slug) && !slug.startsWith('_'))
  );

export const LinkRedirectUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(LINK_REDIRECT_URL_MAX)
  .url()
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'));

export const LinkCreationSchema = z.object({
  link: LinkSlugSchema,
  redirectUrl: LinkRedirectUrlSchema
});

export const LinkUpdateSchema = LinkCreationSchema;
