import type { Link } from '#shared/types/link.type';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { links } from '../../database/schema';
import { setupTestServer } from '../../testing/server';

const server = await setupTestServer();

type Session = Awaited<ReturnType<typeof server.login>>;

let alice: Session;
let bob: Session;

beforeEach(async () => {
  await server.reset();

  alice = await server.login();
  bob = await server.login();
});

const findLink = async (id: string) => {
  const [link] = await server.db.select().from(links).where(eq(links.id, id));

  return link;
};

describe('authentication', () => {
  it.each([
    ['GET', '/api/links'],
    ['POST', '/api/links'],
    ['PUT', '/api/links/some-id'],
    ['DELETE', '/api/links/some-id']
  ])('%s %s returns 401 without a session', async (method, path) => {
    const response = await server.fetch(path, {
      method,
      json: method === 'GET' ? undefined : {}
    });

    expect(response.status).toBe(401);
  });

  it('returns 401 for a tampered session cookie', async () => {
    const cookie = alice.headers.get('cookie')!;

    const response = await server.fetch('/api/links', {
      headers: { cookie: `${cookie.slice(0, -4)}AAAA` }
    });

    expect(response.status).toBe(401);
  });
});

describe('GET /api/links', () => {
  it("lists only the caller's links, newest first", async () => {
    await server.db.insert(links).values([
      {
        id: 'older',
        slug: 'older',
        redirectUrl: 'https://example.com/older',
        userId: alice.user.id,
        createdAt: new Date(1_000)
      },
      {
        id: 'newer',
        slug: 'newer',
        redirectUrl: 'https://example.com/newer',
        userId: alice.user.id,
        createdAt: new Date(2_000)
      },
      {
        id: 'foreign',
        slug: 'foreign',
        redirectUrl: 'https://example.com/foreign',
        userId: bob.user.id
      }
    ]);

    const response = await server.fetch('/api/links', {
      headers: alice.headers
    });

    expect(response.status).toBe(200);

    const { body } = await response.json();
    expect(body.links.map((link: Link) => link.slug)).toEqual([
      'newer',
      'older'
    ]);
  });
});

describe('POST /api/links', () => {
  it('creates a link owned by the caller with a normalized slug', async () => {
    const response = await server.fetch('/api/links', {
      method: 'POST',
      headers: alice.headers,
      json: { slug: ' /Repo ', redirectUrl: 'https://example.com/repo' }
    });

    expect(response.status).toBe(200);

    const { body } = await response.json();
    expect(body.link).toMatchObject({
      slug: 'repo',
      redirectUrl: 'https://example.com/repo',
      userId: alice.user.id,
      clicks: 0
    });
  });

  it('ignores fields the client must not set', async () => {
    const response = await server.fetch('/api/links', {
      method: 'POST',
      headers: alice.headers,
      json: {
        slug: 'forged',
        redirectUrl: 'https://example.com/forged',
        id: 'forged-id',
        userId: bob.user.id,
        clicks: 999
      }
    });

    const { body } = await response.json();
    const link = await findLink(body.link.id);

    expect(link?.id).not.toBe('forged-id');
    expect(link?.userId).toBe(alice.user.id);
    expect(link?.clicks).toBe(0);
  });

  it('returns 400 with the validation issues', async () => {
    const response = await server.fetch('/api/links', {
      method: 'POST',
      headers: alice.headers,
      json: { slug: 'login', redirectUrl: 'javascript:alert(1)' }
    });

    expect(response.status).toBe(400);

    const { data } = await response.json();
    expect(data.map((issue: { path: string[] }) => issue.path[0])).toEqual([
      'slug',
      'redirectUrl'
    ]);
  });

  it('returns 409 when another user owns the slug', async () => {
    await server.createLink(bob.headers, 'taken');

    const response = await server.fetch('/api/links', {
      method: 'POST',
      headers: alice.headers,
      json: { slug: 'taken', redirectUrl: 'https://example.com/mine' }
    });

    expect(response.status).toBe(409);
  });

  it('purges a cached miss so the new link redirects at once', async () => {
    expect(await server.redirectTarget('fresh')).toBeNull();

    await server.createLink(alice.headers, 'fresh');

    expect(await server.redirectTarget('fresh')).toBe(
      'https://example.com/fresh'
    );
  });
});

describe('PUT /api/links/:id', () => {
  it("updates the caller's link", async () => {
    const link = await server.createLink(alice.headers, 'edit-me');

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'edited', redirectUrl: 'https://example.com/edited' }
    });

    expect(response.status).toBe(200);

    const { body } = await response.json();
    expect(body.link).toMatchObject({
      id: link.id,
      slug: 'edited',
      redirectUrl: 'https://example.com/edited'
    });
  });

  it("returns 404 for another user's link and leaves it untouched", async () => {
    const link = await server.createLink(bob.headers, 'bobs-link');

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'stolen', redirectUrl: 'https://example.com/stolen' }
    });

    expect(response.status).toBe(404);
    expect((await findLink(link.id))?.slug).toBe('bobs-link');
  });

  it('returns 404 for an unknown id', async () => {
    const response = await server.fetch('/api/links/missing', {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'missing', redirectUrl: 'https://example.com/missing' }
    });

    expect(response.status).toBe(404);
  });

  it('returns 400 for invalid fields', async () => {
    const link = await server.createLink(alice.headers, 'valid');

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: '-invalid-', redirectUrl: 'https://example.com' }
    });

    expect(response.status).toBe(400);
  });

  it('returns 409 when renaming onto a taken slug', async () => {
    await server.createLink(bob.headers, 'occupied');
    const link = await server.createLink(alice.headers, 'rename-me');

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'occupied', redirectUrl: link.redirectUrl }
    });

    expect(response.status).toBe(409);
  });

  it('purges the old and new slug when renaming', async () => {
    const link = await server.createLink(alice.headers, 'old-slug');

    expect(await server.redirectTarget('old-slug')).toBe(link.redirectUrl);
    expect(await server.redirectTarget('new-slug')).toBeNull();

    await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'new-slug', redirectUrl: 'https://example.com/moved' }
    });

    expect(await server.redirectTarget('old-slug')).toBeNull();
    expect(await server.redirectTarget('new-slug')).toBe(
      'https://example.com/moved'
    );
  });

  it('purges the cached target when only the url changes', async () => {
    const link = await server.createLink(alice.headers, 'same-slug');

    expect(await server.redirectTarget('same-slug')).toBe(link.redirectUrl);

    await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'same-slug', redirectUrl: 'https://example.com/updated' }
    });

    expect(await server.redirectTarget('same-slug')).toBe(
      'https://example.com/updated'
    );
  });
});

describe('DELETE /api/links/:id', () => {
  it("deletes the caller's link and purges its redirect", async () => {
    const link = await server.createLink(alice.headers, 'gone');

    expect(await server.redirectTarget('gone')).toBe(link.redirectUrl);

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'DELETE',
      headers: alice.headers
    });

    expect(response.status).toBe(200);
    expect(await findLink(link.id)).toBeUndefined();
    expect(await server.redirectTarget('gone')).toBeNull();
  });

  it("returns 404 for another user's link and keeps it", async () => {
    const link = await server.createLink(bob.headers, 'keep-me');

    const response = await server.fetch(`/api/links/${link.id}`, {
      method: 'DELETE',
      headers: alice.headers
    });

    expect(response.status).toBe(404);
    expect(await findLink(link.id)).toBeDefined();
  });
});
