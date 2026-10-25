import type { Link, LinkInput } from '#shared/types/link.type';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Database } from '#layers/base/server/platform/db';
import { isUniqueConstraintError } from '#layers/base/server/platform/errors';
import { links } from '~~/server/database/schema';
import { LinkAlreadyInUseError } from '~~/server/utils/errors';

class LinkRepository {
  constructor(private db: Database) {}

  async findAllByUserId(userId: string): Promise<Link[]> {
    return this.db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt));
  }

  async findOwnedById(id: string, userId: string): Promise<Link | null> {
    const [link] = await this.db
      .select()
      .from(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .limit(1);

    return link ?? null;
  }

  async create(userId: string, data: LinkInput): Promise<Link> {
    const [link] = await this.withUniqueSlug(() =>
      this.db
        .insert(links)
        .values({
          ...data,
          id: crypto.randomUUID(),
          userId
        })
        .returning()
    );

    if (!link) {
      throw new Error('Link was not created');
    }

    return link;
  }

  async update(id: string, data: LinkInput): Promise<Link> {
    const [link] = await this.withUniqueSlug(() =>
      this.db.update(links).set(data).where(eq(links.id, id)).returning()
    );

    if (!link) {
      throw new Error('Link was not updated');
    }

    return link;
  }

  async delete(id: string) {
    await this.db.delete(links).where(eq(links.id, id));
  }

  async findRedirectUrlBySlug(slug: string): Promise<string | null> {
    const [link] = await this.db
      .select({
        redirectUrl: links.redirectUrl
      })
      .from(links)
      .where(eq(links.slug, slug))
      .limit(1);

    return link?.redirectUrl ?? null;
  }

  async incrementClicksBySlug(slug: string): Promise<void> {
    await this.db
      .update(links)
      .set({
        clicks: sql`${links.clicks} + 1`
      })
      .where(eq(links.slug, slug));
  }

  private async withUniqueSlug<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new LinkAlreadyInUseError();

      throw error;
    }
  }
}

export default LinkRepository;
