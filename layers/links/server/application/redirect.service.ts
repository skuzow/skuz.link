import type { EventHandlerRequest, H3Event } from 'h3';
import type { ClickDetails } from '#layers/links/shared/domain/click.type';
import { scheduleBackground } from '#layers/base/server/platform/background';
import type ClickRepository from '#layers/links/server/infrastructure/click.repository';
import type LinkRepository from '#layers/links/server/infrastructure/link.repository';
import type LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';

interface ResolveOptions {
  // null for a check that only asks whether the Short URL exists, which is
  // never a Click
  click: ClickDetails | null;
}

// the cache remembers hits and misses so most Redirects skip D1; recording a
// Click and writing the cache run in the background, and a failure in either
// is logged without ever blocking the Redirect
class RedirectService {
  constructor(
    private readonly event: H3Event<EventHandlerRequest>,
    private readonly repository: LinkRepository,
    private readonly clickRepository: ClickRepository,
    private readonly redirectCache: LinkRedirectCache
  ) {}

  async resolve(
    slug: string,
    { click }: ResolveOptions
  ): Promise<string | null> {
    const cached = await this.redirectCache.read(slug);
    if (cached?.type === 'miss') return null;

    if (cached?.type === 'hit') {
      if (click) this.scheduleClick(slug, click);
      return cached.redirectUrl;
    }

    const redirectUrl = await this.repository.findRedirectUrlBySlug(slug);
    if (!redirectUrl) {
      this.redirectCache.scheduleStoreMiss(slug);
      return null;
    }

    if (click) this.scheduleClick(slug, click);
    this.redirectCache.scheduleStoreRedirect(slug, redirectUrl);

    return redirectUrl;
  }

  private scheduleClick(slug: string, click: ClickDetails) {
    const record = this.clickRepository
      .recordBySlug(slug, click)
      .catch((error: unknown) => {
        console.error('Failed to record link click', error);
      });

    scheduleBackground(this.event, record);
  }
}

export default RedirectService;
