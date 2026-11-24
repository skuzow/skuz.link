import type {
  Click,
  ClickRange,
  CountryClicks,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { CLICK_RANGE_MS } from '#layers/links/shared/domain/click.constant';
import {
  UNKNOWN_COUNTRY,
  toCountryKey
} from '#layers/links/shared/domain/click.country';
import type LinkService from '#layers/links/server/application/link.service';
import type ClickRepository from '#layers/links/server/infrastructure/click.repository';

// a range ends now, by the server's clock
const rangeStart = (range: ClickRange): Date =>
  new Date(Date.now() - CLICK_RANGE_MS[range]);

// XX, T1 and no country become one Unknown entry, which goes last
const toCountryClicks = (
  counts: { country: string | null; clicks: number }[]
): CountryClicks[] => {
  const byCountry = new Map<string, number>();
  for (const { country, clicks } of counts) {
    const key = toCountryKey(country);
    byCountry.set(key, (byCountry.get(key) ?? 0) + clicks);
  }

  return [...byCountry]
    .map(([country, clicks]) => ({ country, clicks }))
    .sort(
      (a, b) =>
        Number(a.country === UNKNOWN_COUNTRY) -
          Number(b.country === UNKNOWN_COUNTRY) ||
        b.clicks - a.clicks ||
        a.country.localeCompare(b.country)
    );
};

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

  async getStatistics(
    ownerId: string,
    id: string,
    range: ClickRange
  ): Promise<LinkStatistics> {
    const link = await this.linkService.findOwned(ownerId, id);
    const since = rangeStart(range);

    const [counts, topReferrer] = await Promise.all([
      this.clickRepository.countByCountry(link.id, since),
      this.clickRepository.findTopReferrer(link.id, since)
    ]);
    const countryClicks = toCountryClicks(counts);

    return {
      rangeClicks: countryClicks.reduce((sum, entry) => sum + entry.clicks, 0),
      clickCount: link.clicks,
      countries: countryClicks.filter(
        (entry) => entry.country !== UNKNOWN_COUNTRY
      ).length,
      topReferrer,
      countryClicks
    };
  }

  async listClicks(
    ownerId: string,
    id: string,
    range: ClickRange
  ): Promise<Click[]> {
    const link = await this.linkService.findOwned(ownerId, id);

    return this.clickRepository.findNewest(link.id, rangeStart(range));
  }
}

export default StatisticsService;
