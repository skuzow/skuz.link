import type { Click } from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { clicks, links } from '#layers/links/server/infrastructure/schema';
import { setupTestServer } from '~~/server/testing/server';

const server = await setupTestServer();

type Session = Awaited<ReturnType<typeof server.login>>;

let alice: Session;
let bob: Session;

beforeEach(async () => {
  await server.reset();

  alice = await server.login();
  bob = await server.login();
});

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const MADRID = {
  country: 'ES',
  region: 'Community of Madrid',
  city: 'Madrid'
};

const getLink = async (id: string, headers = alice.headers) => {
  const response = await server.fetch(`/api/links/${id}`, { headers });
  expect(response.status).toBe(200);

  return (await response.json()) as Link;
};

const listClicks = async (id: string, headers = alice.headers) => {
  const response = await server.fetch(`/api/links/${id}/clicks`, { headers });
  expect(response.status).toBe(200);

  return (await response.json()) as Click[];
};

// one statement per row, because D1 caps the parameters of a statement
const seedClicks = async (
  linkId: string,
  seeds: { city: string; age: number }[],
  now = Date.now()
) => {
  const [first, ...rest] = seeds.map(({ city, age }) =>
    server.db
      .insert(clicks)
      .values({ linkId, city, createdAt: new Date(now - age) })
  );
  if (first) await server.db.batch([first, ...rest]);
};

const countStoredClicks = async (linkId: string) =>
  (await server.db.select().from(clicks).where(eq(clicks.linkId, linkId)))
    .length;

describe('recording a Click', () => {
  it('records a GET Redirect with its time and place, and raises the Click count', async () => {
    const link = await server.createLink(alice.headers, 'madrid');
    const before = Date.now();

    const response = await server.fetch('/madrid', { cf: MADRID });
    await server.flush();

    expect(response.status).toBe(302);

    const listed = await listClicks(link.id);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject(MADRID);

    const time = new Date(listed[0]!.createdAt).getTime();
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(Date.now());

    expect((await getLink(link.id)).clicks).toBe(1);
  });

  it('records a Click on the cached path too', async () => {
    const link = await server.createLink(alice.headers, 'cached');

    await server.fetch('/cached', { cf: MADRID });
    await server.flush();

    // a cached Redirect still answers with the old Redirect URL
    await server.db
      .update(links)
      .set({ redirectUrl: 'https://example.com/changed' })
      .where(eq(links.id, link.id));

    const response = await server.fetch('/cached', {
      cf: { country: 'FR', region: 'Île-de-France', city: 'Paris' }
    });
    await server.flush();

    expect(response.headers.get('location')).toBe(link.redirectUrl);

    const listed = await listClicks(link.id);
    expect(listed.map((click) => click.city)).toEqual(['Paris', 'Madrid']);
    expect((await getLink(link.id)).clicks).toBe(2);
  });

  it('records nothing for a HEAD', async () => {
    const link = await server.createLink(alice.headers, 'head');

    const response = await server.fetch('/head', {
      method: 'HEAD',
      cf: MADRID
    });
    await server.flush();

    expect(response.status).toBe(302);
    expect(await listClicks(link.id)).toEqual([]);
    expect((await getLink(link.id)).clicks).toBe(0);
  });

  it('keeps no IP address and nothing else from cf', async () => {
    const link = await server.createLink(alice.headers, 'private');
    const neverKept = [
      '203.0.113.7',
      '198.51.100.23',
      '40.41680',
      '-3.70380',
      '28013',
      'Europe/Madrid',
      '64496',
      'Telefonica'
    ];

    await server.fetch('/private', {
      headers: {
        'CF-Connecting-IP': '203.0.113.7',
        'X-Forwarded-For': '198.51.100.23, 203.0.113.7'
      },
      cf: {
        ...MADRID,
        latitude: '40.41680',
        longitude: '-3.70380',
        postalCode: '28013',
        timezone: 'Europe/Madrid',
        asn: 64496,
        asOrganization: 'Telefonica'
      }
    });
    await server.flush();

    const listed = JSON.stringify(await listClicks(link.id));
    const rows = JSON.stringify(
      await server.db.select().from(clicks).where(eq(clicks.linkId, link.id))
    );

    expect(listed).toContain('Madrid');
    expect(rows).toContain('Madrid');
    for (const value of neverKept) {
      expect(listed).not.toContain(value);
      expect(rows).not.toContain(value);
    }
  });

  it.each([
    ['XX', { country: 'XX' }, 'XX'],
    ['T1', { country: 'T1' }, 'T1'],
    ['no cf', undefined, null]
  ])(
    'keeps the country of a request with %s as sent',
    async (_, cf, country) => {
      const link = await server.createLink(alice.headers, 'unknown');

      await server.fetch('/unknown', { cf });
      await server.flush();

      expect(await listClicks(link.id)).toMatchObject([
        { country, region: null, city: null }
      ]);
    }
  );
});

describe('GET /api/links/:id/clicks', () => {
  it('lists the newest 50 Clicks of the last 30 days, by time and then by id', async () => {
    const link = await server.createLink(alice.headers, 'busy');
    const now = Date.now();

    await seedClicks(
      link.id,
      [
        { city: 'old', age: 31 * DAY_MS },
        // the same millisecond: the later row comes first
        { city: 'same-a', age: MINUTE_MS },
        { city: 'same-b', age: MINUTE_MS },
        ...Array.from({ length: 50 }, (_, index) => ({
          city: `n${index + 3}`,
          age: (index + 3) * MINUTE_MS
        }))
      ],
      now
    );

    const listed = await listClicks(link.id);

    expect(listed.map((click) => click.city)).toEqual([
      'same-b',
      'same-a',
      ...Array.from({ length: 48 }, (_, index) => `n${index + 3}`)
    ]);
  });

  it('keeps Clicks of the last 30 days and leaves out older ones', async () => {
    const link = await server.createLink(alice.headers, 'month');

    await seedClicks(link.id, [
      { city: 'inside', age: 29 * DAY_MS },
      { city: 'outside', age: 31 * DAY_MS }
    ]);

    expect((await listClicks(link.id)).map((click) => click.city)).toEqual([
      'inside'
    ]);
  });
});

describe('access', () => {
  it.each(['', '/clicks'])(
    'GET /api/links/:id%s returns 401 without a session',
    async (suffix) => {
      const link = await server.createLink(alice.headers, 'signed-out');

      const response = await server.fetch(`/api/links/${link.id}${suffix}`);

      expect(response.status).toBe(401);
    }
  );

  it.each(['', '/clicks'])(
    "GET /api/links/:id%s returns 404 for another User's Link",
    async (suffix) => {
      const link = await server.createLink(bob.headers, 'bobs-link');

      const response = await server.fetch(`/api/links/${link.id}${suffix}`, {
        headers: alice.headers
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({
        statusCode: 404,
        statusMessage: 'Link not found'
      });
    }
  );

  it.each(['', '/clicks'])(
    'GET /api/links/:id%s returns 404 for an unknown id',
    async (suffix) => {
      const response = await server.fetch(`/api/links/missing${suffix}`, {
        headers: alice.headers
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({
        statusCode: 404,
        statusMessage: 'Link not found'
      });
    }
  );

  it('GET /api/links/:id returns the Link as the list does', async () => {
    const link = await server.createLink(alice.headers, 'listed');

    const response = await server.fetch('/api/links', {
      headers: alice.headers
    });
    const [listed]: Link[] = await response.json();

    expect(await getLink(link.id)).toEqual(listed);
  });
});

describe('lifecycle', () => {
  it('deletes the Clicks with their Link', async () => {
    const link = await server.createLink(alice.headers, 'doomed');
    await server.fetch('/doomed', { cf: MADRID });
    await server.flush();

    expect(await countStoredClicks(link.id)).toBe(1);

    await server.fetch(`/api/links/${link.id}`, {
      method: 'DELETE',
      headers: alice.headers
    });

    expect(await countStoredClicks(link.id)).toBe(0);
  });

  it('starts a new Link with a freed Slug at zero', async () => {
    const first = await server.createLink(alice.headers, 'reused');
    await server.fetch('/reused', { cf: MADRID });
    await server.flush();
    await server.fetch(`/api/links/${first.id}`, {
      method: 'DELETE',
      headers: alice.headers
    });

    const second = await server.createLink(bob.headers, 'reused');

    expect(await listClicks(second.id, bob.headers)).toEqual([]);
    expect((await getLink(second.id, bob.headers)).clicks).toBe(0);
  });

  it('keeps the Clicks through a Slug and Redirect URL change', async () => {
    const link = await server.createLink(alice.headers, 'before');
    await server.fetch('/before', { cf: MADRID });
    await server.flush();

    await server.fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: alice.headers,
      json: { slug: 'after', redirectUrl: 'https://example.com/after' }
    });

    expect(await listClicks(link.id)).toMatchObject([MADRID]);
    expect((await getLink(link.id)).clicks).toBe(1);
  });
});
