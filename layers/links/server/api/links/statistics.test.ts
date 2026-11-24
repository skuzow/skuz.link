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

  // one Short URL per Click, so each case reads its own Click
  const clickWith = async (userAgent: string | null) => {
    const link = await server.createLink(alice.headers, 'client');

    await server.fetch('/client', {
      headers: userAgent === null ? {} : { 'User-Agent': userAgent }
    });
    await server.flush();

    const [click] = await listClicks(link.id);
    return click;
  };

  it.each([
    [
      'Slack',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'Slackbot-LinkExpanding'
    ],
    ['WhatsApp', 'WhatsApp/2.23.20.0 A', 'WhatsApp'],
    [
      'Discord',
      'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      'Discordbot'
    ],
    ['X', 'Twitterbot/1.0', 'Twitterbot'],
    [
      'Facebook',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'facebookexternalhit'
    ],
    [
      'LinkedIn',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
      'LinkedInBot'
    ],
    ['Telegram', 'TelegramBot (like TwitterBot)', 'TelegramBot'],
    [
      'Googlebot',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/131.0.6778.69 Safari/537.36',
      'Googlebot'
    ],
    ['curl', 'curl/8.4.0', 'curl'],
    ['python-requests', 'python-requests/2.31.0', 'python-requests'],
    [
      // isbot matches only http inside the comment
      'Mastodon',
      'Mastodon/4.2.1 (http.rb/5.1.1; +https://mastodon.social/)',
      'Mastodon'
    ],
    [
      // isbot matches only inside the URL
      'Iframely',
      'Iframely/1.3.1 (+https://iframely.com/docs/about)',
      'Iframely'
    ],
    ['no user agent', null, null]
  ])('reads %s as a Bot with its name', async (_, userAgent, botName) => {
    expect(await clickWith(userAgent)).toMatchObject({
      bot: true,
      botName,
      browser: null,
      os: null,
      device: null
    });
  });

  it.each([
    [
      'Chrome on macOS',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ['Chrome', 'macOS', 'Desktop']
    ],
    [
      'Safari on an iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      ['Safari', 'iOS', 'Mobile']
    ],
    [
      'Firefox on Windows',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
      ['Firefox', 'Windows', 'Desktop']
    ],
    [
      'Edge',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      ['Edge', 'Windows', 'Desktop']
    ],
    [
      'Samsung Internet on Android',
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36',
      ['Samsung Internet', 'Android', 'Mobile']
    ],
    [
      'Opera on Linux',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/115.0.0.0',
      ['Opera', 'Linux', 'Desktop']
    ],
    [
      'Chrome on ChromeOS',
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ['Chrome', 'ChromeOS', 'Desktop']
    ],
    [
      'Chrome on an Android tablet',
      'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ['Chrome', 'Android', 'Tablet']
    ],
    [
      'Safari on an iPad',
      'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      ['Safari', 'iPadOS', 'Tablet']
    ],
    [
      // an iPad that asks for the desktop site sends a Mac's user agent
      'an iPad in desktop mode',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      ['Safari', 'macOS', 'Desktop']
    ],
    [
      'an unknown browser',
      'Mozilla/5.0 (X11; Linux x86_64) KHTML/5.27.0 (like Gecko) Konqueror/5.0',
      ['Other', 'Linux', 'Desktop']
    ],
    [
      'an unknown system',
      'Lynx/2.9.0dev.12 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/3.7.8',
      ['Other', 'Other', 'Other']
    ]
  ])('reads %s', async (_, userAgent, [browser, os, device]) => {
    expect(await clickWith(userAgent)).toMatchObject({
      bot: false,
      botName: null,
      browser,
      os,
      device
    });
  });

  it('keeps no full user agent, and cuts a Bot name to a fixed length', async () => {
    const link = await server.createLink(alice.headers, 'long');
    const userAgent = `${'x'.repeat(300)}bot/1.0 (+https://example.com/bot)`;

    await server.fetch('/long', { headers: { 'User-Agent': userAgent } });
    await server.fetch('/long', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });
    await server.flush();

    const [person, bot] = await listClicks(link.id);
    expect(bot).toMatchObject({ bot: true });
    expect(bot?.botName).toBe('x'.repeat(128));

    const rows = JSON.stringify(
      await server.db.select().from(clicks).where(eq(clicks.linkId, link.id))
    );
    for (const kept of [
      'Mozilla',
      'AppleWebKit',
      '10_15_7',
      '131.0',
      '+https'
    ]) {
      expect(rows).not.toContain(kept);
    }
    expect(person).toMatchObject({ browser: 'Chrome' });
  });

  it.each([
    ['a www host', 'https://www.Google.com/search?q=x', 'google.com'],
    ['another subdomain', 'https://l.facebook.com/', 'l.facebook.com'],
    [
      'a deeper subdomain',
      'http://news.ycombinator.com/item?id=1',
      'news.ycombinator.com'
    ],
    ['a host with a trailing dot', 'https://www.google.com./', 'google.com'],
    ['skuz.link itself', 'https://skuz.link/links', 'skuz.link'],
    ['an app', 'android-app://com.google.android.gm/', null],
    ['no Referer', null, null],
    ['a broken Referer', 'https://', null],
    ['a Referer that is not a URL', 'not a url', null]
  ])('keeps the Referrer host of %s', async (_, referer, referrer) => {
    const link = await server.createLink(alice.headers, 'from');

    await server.fetch('/from', {
      headers: referer === null ? {} : { Referer: referer }
    });
    await server.flush();

    expect(await listClicks(link.id)).toMatchObject([{ referrer }]);
  });

  it('cuts a Referrer host to a fixed length', async () => {
    const link = await server.createLink(alice.headers, 'from');
    const host = `${'a'.repeat(60)}.${'b'.repeat(60)}.${'c'.repeat(60)}.com`;

    await server.fetch('/from', {
      headers: { Referer: `https://${host}/` }
    });
    await server.flush();

    const [click] = await listClicks(link.id);
    expect(click?.referrer).toBe(host.slice(0, 128));
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
