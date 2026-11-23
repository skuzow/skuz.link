import type { Click } from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { CLICKS_RANGE_MS } from '#layers/links/shared/domain/click.constant';
import type LinkService from '#layers/links/server/application/link.service';
import type ClickRepository from '#layers/links/server/infrastructure/click.repository';

// only the Owner sees a Link's Statistics: anyone else gets LinkNotFoundError,
// through the same check that guards editing and deleting
class StatisticsService {
  constructor(
    private readonly linkService: LinkService,
    private readonly clickRepository: ClickRepository
  ) {}

  async findLink(ownerId: string, id: string): Promise<Link> {
    return this.linkService.findOwned(ownerId, id);
  }

  async listClicks(ownerId: string, id: string): Promise<Click[]> {
    const link = await this.linkService.findOwned(ownerId, id);

    return this.clickRepository.findNewest(
      link.id,
      new Date(Date.now() - CLICKS_RANGE_MS)
    );
  }
}

export default StatisticsService;
