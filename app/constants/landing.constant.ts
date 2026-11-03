import type { Link } from '#layers/links/shared/domain/link.type';

export const LANDING_PLATE_SLUG: string = 'github';

// these must exist as Links in production, owned by the person who runs
// skuz.link: Copy hands out their Short URLs. Their clicks are samples
export const LANDING_EXAMPLE_LINKS: Pick<
  Link,
  'slug' | 'redirectUrl' | 'clicks'
>[] = [
  {
    slug: LANDING_PLATE_SLUG,
    redirectUrl: 'https://github.com/skuzow',
    clicks: 1204
  },
  {
    slug: 'repo',
    redirectUrl: 'https://github.com/skuzow/skuz.link',
    clicks: 86
  },
  { slug: 'x', redirectUrl: 'https://x.com/skuzow', clicks: 3 }
];
