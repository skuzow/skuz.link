import type {
  Click,
  ClickDetails
} from '#layers/links/shared/domain/click.type';
import { and, asc, count, desc, eq, gte, isNotNull, sql } from 'drizzle-orm';
import type { Database } from '#layers/base/server/platform/db';
import { CLICKS_PAGE_SIZE } from '#layers/links/shared/domain/click.constant';
import { clicks, links } from './schema';

// a bound value as a selected column, for INSERT … SELECT
const param = <T>(value: T, alias: string) => sql<T>`${value}`.as(alias);

// every column but the Link's id, which the caller already knows
const clickColumns = {
  id: clicks.id,
  createdAt: clicks.createdAt,
  country: clicks.country,
  region: clicks.region,
  city: clicks.city,
  referrer: clicks.referrer,
  browser: clicks.browser,
  os: clicks.os,
  device: clicks.device,
  bot: clicks.bot,
  botName: clicks.botName
};

const inRange = (linkId: string, since: Date) =>
  and(eq(clicks.linkId, linkId), gte(clicks.createdAt, since));

class ClickRepository {
  constructor(private db: Database) {}

  // one batch, so the Click count and the Clicks never disagree; the Click
  // finds its Link by Slug, so a cached Redirect needs no Link id, and a Link
  // deleted in the meantime leaves both writes without a row to change
  async recordBySlug(slug: string, details: ClickDetails): Promise<void> {
    await this.db.batch([
      this.db
        .update(links)
        .set({ clicks: sql`${links.clicks} + 1` })
        .where(eq(links.slug, slug)),
      this.db.insert(clicks).select(
        this.db
          .select({
            id: param(null, 'id'),
            linkId: links.id,
            createdAt: param(details.createdAt.getTime(), 'createdAt'),
            country: param(details.country, 'country'),
            region: param(details.region, 'region'),
            city: param(details.city, 'city'),
            referrer: param(details.referrer, 'referrer'),
            browser: param(details.browser, 'browser'),
            os: param(details.os, 'os'),
            device: param(details.device, 'device'),
            bot: param(details.bot ? 1 : 0, 'bot'),
            botName: param(details.botName, 'botName')
          })
          .from(links)
          .where(eq(links.slug, slug))
      )
    ]);
  }

  // newest first, by time and then by id, so Clicks in the same millisecond
  // keep one order
  async findNewest(linkId: string, since: Date): Promise<Click[]> {
    return this.db
      .select(clickColumns)
      .from(clicks)
      .where(inRange(linkId, since))
      .orderBy(desc(clicks.createdAt), desc(clicks.id))
      .limit(CLICKS_PAGE_SIZE);
  }

  // by the country as Cloudflare sent it, so XX, T1 and none stay apart
  async countByCountry(
    linkId: string,
    since: Date
  ): Promise<{ country: string | null; clicks: number }[]> {
    return this.db
      .select({ country: clicks.country, clicks: count() })
      .from(clicks)
      .where(inRange(linkId, since))
      .groupBy(clicks.country);
  }

  // Direct Clicks have no host, so they never count; a tie goes to the
  // first host alphabetically
  async findTopReferrer(linkId: string, since: Date): Promise<string | null> {
    const [top] = await this.db
      .select({ referrer: clicks.referrer })
      .from(clicks)
      .where(and(inRange(linkId, since), isNotNull(clicks.referrer)))
      .groupBy(clicks.referrer)
      .orderBy(desc(count()), asc(clicks.referrer))
      .limit(1);

    return top?.referrer ?? null;
  }
}

export default ClickRepository;
