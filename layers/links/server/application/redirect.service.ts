import type { EventHandlerRequest, H3Event } from 'h3';
import { scheduleBackground } from '#layers/base/server/platform/background';
import type LinkRepository from '#layers/links/server/infrastructure/link.repository';
import type LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';

interface ResolveOptions {
  // a check that only asks whether the Short URL exists is never a Click
  isExistenceCheck: boolean;
}

// the cache remembers hits and misses so most Redirects skip D1; counting a
// Click and writing the cache run in the background, and a failure in either
// is logged without ever blocking the Redirect
class RedirectService {
  constructor(
    private readonly event: H3Event<EventHandlerRequest>,
    private readonly repository: LinkRepository,
    private readonly redirectCache: LinkRedirectCache
  ) {}

  async resolve(
    slug: string,
    { isExistenceCheck }: ResolveOptions
  ): Promise<string | null> {
    const cached = await this.redirectCache.read(slug);
    if (cached?.type === 'miss') return null;

    if (cached?.type === 'hit') {
      if (!isExistenceCheck) this.scheduleClick(slug);
      return cached.redirectUrl;
    }

    const redirectUrl = await this.repository.findRedirectUrlBySlug(slug);
    if (!redirectUrl) {
      this.redirectCache.scheduleStoreMiss(slug);
      return null;
    }

    if (!isExistenceCheck) this.scheduleClick(slug);
    this.redirectCache.scheduleStoreRedirect(slug, redirectUrl);

    return redirectUrl;
  }

  private scheduleClick(slug: string) {
    const increment = this.repository
      .incrementClicksBySlug(slug)
      .catch((error: unknown) => {
        console.error('Failed to increment link clicks', error);
      });

    scheduleBackground(this.event, increment);
  }
}

export default RedirectService;
