import type { Link, LinkInput } from '#layers/links/shared/domain/link.type';
import { LinkNotFoundError } from '#layers/links/shared/domain/link.error';
import type LinkRepository from '#layers/links/server/infrastructure/link.repository';
import type LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';

// every write purges the cached Redirects of the Slugs it touches, so a
// Short URL never keeps serving a stale Redirect URL or a stale miss
class LinkService {
  constructor(
    private readonly repository: LinkRepository,
    private readonly redirectCache: LinkRedirectCache
  ) {}

  async list(ownerId: string): Promise<Link[]> {
    return this.repository.findAllByUserId(ownerId);
  }

  async create(ownerId: string, input: LinkInput): Promise<Link> {
    const link = await this.repository.create(ownerId, input);

    await this.redirectCache.purge([link.slug]);

    return link;
  }

  async update(ownerId: string, id: string, input: LinkInput): Promise<Link> {
    const ownedLink = await this.findOwned(ownerId, id);
    const link = await this.repository.update(ownedLink.id, input);

    await this.redirectCache.purge([ownedLink.slug, link.slug]);

    return link;
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const ownedLink = await this.findOwned(ownerId, id);

    await this.repository.delete(ownedLink.id);

    await this.redirectCache.purge([ownedLink.slug]);
  }

  async purgeOwnerRedirects(ownerId: string): Promise<void> {
    const ownedLinks = await this.repository.findAllByUserId(ownerId);

    await this.redirectCache.purge(ownedLinks.map((link) => link.slug));
  }

  private async findOwned(ownerId: string, id: string): Promise<Link> {
    const link = await this.repository.findOwnedById(id, ownerId);

    if (!link) throw new LinkNotFoundError();

    return link;
  }
}

export default LinkService;
