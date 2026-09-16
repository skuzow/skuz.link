import type { Link, LinkCreation, LinkUpdate } from '#shared/types/link.type';
import { and, desc, eq, sql } from 'drizzle-orm';
import { links } from '~~/server/database/schema';
import {
  isUniqueConstraintError,
  LinkAlreadyInUseError
} from '~~/server/utils/errors';

type Database = Awaited<ReturnType<typeof useDB>>;

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

  async create(userId: string, data: LinkCreation): Promise<Link> {
    try {
      const [link] = await this.db
        .insert(links)
        .values({
          id: crypto.randomUUID(),
          link: data.link,
          redirectUrl: data.redirectUrl,
          userId
        })
        .returning();

      if (!link) {
        throw new Error('Link was not created');
      }

      return link;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new LinkAlreadyInUseError();
      }

      throw error;
    }
  }

  async update(id: string, data: LinkUpdate): Promise<Link> {
    try {
      const [link] = await this.db
        .update(links)
        .set({
          link: data.link,
          redirectUrl: data.redirectUrl
        })
        .where(eq(links.id, id))
        .returning();

      if (!link) {
        throw new Error('Link was not updated');
      }

      return link;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new LinkAlreadyInUseError();
      }

      throw error;
    }
  }

  async delete(id: string) {
    await this.db.delete(links).where(eq(links.id, id));
  }

  async deleteAllByUserId(userId: string) {
    await this.db.delete(links).where(eq(links.userId, userId));
  }

  async incrementClicksBySlug(
    slug: string
  ): Promise<{ redirectUrl: string } | null> {
    const [updated] = await this.db
      .update(links)
      .set({
        clicks: sql`${links.clicks} + 1`
      })
      .where(eq(links.link, slug))
      .returning({
        redirectUrl: links.redirectUrl
      });

    return updated ?? null;
  }
}

export default LinkRepository;
