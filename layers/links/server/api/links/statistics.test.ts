import type {
  Click,
  ClicksPage,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
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

const listClicksPage = async (
  id: string,
  headers = alice.headers,
  query = ''
) => {
  const response = await server.fetch(`/api/links/${id}/clicks${query}`, {
    headers
  });
  expect(response.status).toBe(200);

  return (await response.json()) as ClicksPage;
};

const listClicks = async (id: string, headers = alice.headers, query = '') =>
  (await listClicksPage(id, headers, query)).clicks;

// a test request sends no user agent, so the Click it records is a Bot's
const listRecorded = (id: string, headers = alice.headers) =>
  listClicks(id, headers, '?bots=true');

const getStatistics = async (id: string, query = '') => {
  const response = await server.fetch(`/api/links/${id}/statistics${query}`, {
    headers: alice.headers
  });
  expect(response.status).toBe(200);

  return (await response.json()) as LinkStatistics;
};

type ClickSeed = Partial<typeof clicks.$inferInsert> & { age: number };

// one statement per row, because D1 caps the parameters of a statement
const seedClicks = async (
  linkId: string,
  seeds: ClickSeed[],
  now = Date.now()
) => {
  const [first, ...rest] = seeds.map(({ age, ...values }) =>
    server.db
      .insert(clicks)
      .values({ ...values, linkId, createdAt: new Date(now - age) })
  );
  if (first) await server.db.batch([first, ...rest]);
};

const setClickCount = (linkId: string, count: number) =>
  server.db.update(links).set({ clicks: count }).where(eq(links.id, linkId));

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

    const listed = await listRecorded(link.id);
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

    const listed = await listRecorded(link.id);
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
    expect(await listRecorded(link.id)).toEqual([]);
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

    const listed = JSON.stringify(await listRecorded(link.id));
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

    const [click] = await listRecorded(link.id);
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

    const [person, bot] = await listRecorded(link.id);
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

    expect(await listRecorded(link.id)).toMatchObject([{ referrer }]);
  });

  it('cuts a Referrer host to a fixed length', async () => {
    const link = await server.createLink(alice.headers, 'from');
    const host = `${'a'.repeat(60)}.${'b'.repeat(60)}.${'c'.repeat(60)}.com`;

    await server.fetch('/from', {
      headers: { Referer: `https://${host}/` }
    });
    await server.flush();

    const [click] = await listRecorded(link.id);
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

      expect(await listRecorded(link.id)).toMatchObject([
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
});

describe('paging', () => {
  it('pages 120 Clicks as 50, 50 and 20, newest first, with no cursor at the end', async () => {
    const link = await server.createLink(alice.headers, 'paged');
    const now = Date.now();

    // pairs of Clicks share a millisecond, so the id keeps their order
    await seedClicks(
      link.id,
      Array.from({ length: 120 }, (_, index) => ({
        city: `c${index}`,
        age: (Math.floor(index / 2) + 1) * MINUTE_MS
      })),
      now
    );

    const first = await listClicksPage(link.id);
    const second = await listClicksPage(
      link.id,
      alice.headers,
      `?cursor=${encodeURIComponent(first.cursor!)}`
    );
    const third = await listClicksPage(
      link.id,
      alice.headers,
      `?cursor=${encodeURIComponent(second.cursor!)}`
    );

    expect([first, second, third].map((page) => page.clicks.length)).toEqual([
      50, 50, 20
    ]);
    expect(third.cursor).toBeNull();

    // within a millisecond the later row, c1 after c0, comes first
    const expected = Array.from({ length: 60 }, (_, pair) => [
      `c${pair * 2 + 1}`,
      `c${pair * 2}`
    ]).flat();
    expect(
      [first, second, third].flatMap((page) =>
        page.clicks.map((click) => click.city)
      )
    ).toEqual(expected);
  });

  it('keeps the range while paging', async () => {
    const link = await server.createLink(alice.headers, 'paged-range');

    await seedClicks(link.id, [
      ...Array.from({ length: 60 }, (_, index) => ({
        city: `in${index}`,
        age: (index + 1) * MINUTE_MS
      })),
      ...Array.from({ length: 10 }, (_, index) => ({
        city: `out${index}`,
        age: (index + 25) * 60 * MINUTE_MS
      }))
    ]);

    const first = await listClicksPage(link.id, alice.headers, '?range=24h');
    const second = await listClicksPage(
      link.id,
      alice.headers,
      `?range=24h&cursor=${encodeURIComponent(first.cursor!)}`
    );

    expect(second.clicks.map((click) => click.city)).toEqual(
      Array.from({ length: 10 }, (_, index) => `in${index + 50}`)
    );
    expect(second.cursor).toBeNull();
  });

  it('answers no cursor when the last page is exactly full', async () => {
    const link = await server.createLink(alice.headers, 'paged-full');

    await seedClicks(
      link.id,
      Array.from({ length: 50 }, (_, index) => ({
        age: (index + 1) * MINUTE_MS
      }))
    );

    expect((await listClicksPage(link.id)).cursor).toBeNull();
  });

  it.each(['nope', btoa('12-x'), btoa('-1-2'), '', btoa('1.5-2')])(
    'returns 400 with the issues for the bad cursor %j',
    async (cursor) => {
      const link = await server.createLink(alice.headers, 'bad-cursor');

      const response = await server.fetch(
        `/api/links/${link.id}/clicks?cursor=${encodeURIComponent(cursor)}`,
        { headers: alice.headers }
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toMatchObject({ statusMessage: 'Invalid fields' });
      expect(body.data.map((issue: { path: string[] }) => issue.path)).toEqual([
        ['cursor']
      ]);
    }
  );
});

describe('after', () => {
  // what the page sends: the last saved Click it shows
  const afterClick = (click: Click) => String(click.id);

  const findShown = async (linkId: string, query = '?bots=true') => {
    const shown = (await listClicks(linkId, alice.headers, query)).find(
      (click) => click.city === 'shown'
    );
    if (!shown) throw new Error('Missing the shown Click');

    return shown;
  };

  it('lists only the Clicks saved after the shown one, within the range, bots and country', async () => {
    const link = await server.createLink(alice.headers, 'polled');
    const now = Date.now();

    await seedClicks(
      link.id,
      [
        { city: 'older', country: 'ES', age: 20 * MINUTE_MS },
        { city: 'shown', country: 'ES', age: 10 * MINUTE_MS },
        // the same millisecond, but a later row, so it is newer
        { city: 'same-ms', country: 'ES', age: 10 * MINUTE_MS },
        { city: 'fr-new', country: 'FR', age: 3 * MINUTE_MS },
        { city: 'bot-new', country: 'ES', bot: true, age: 2 * MINUTE_MS },
        { city: 'es-new', country: 'ES', age: MINUTE_MS }
      ],
      now
    );
    const after = afterClick(await findShown(link.id));

    const cities = async (query: string) =>
      (await listClicks(link.id, alice.headers, `${query}&after=${after}`)).map(
        (click) => click.city
      );

    expect(await cities('?range=30d')).toEqual(['es-new', 'fr-new', 'same-ms']);
    expect(await cities('?bots=true')).toEqual([
      'es-new',
      'bot-new',
      'fr-new',
      'same-ms'
    ]);
    expect(await cities('?country=ES')).toEqual(['es-new', 'same-ms']);
  });

  it('lists a Click saved after the shown one, though it happened before it', async () => {
    const link = await server.createLink(alice.headers, 'polled-late');
    const now = Date.now();

    await seedClicks(
      link.id,
      [
        { city: 'older', age: 20 * MINUTE_MS },
        { city: 'shown', age: 10 * MINUTE_MS },
        // its Redirect started first, but its row came second
        { city: 'late', age: 11 * MINUTE_MS }
      ],
      now
    );
    const after = afterClick(await findShown(link.id));

    expect(
      (await listClicks(link.id, alice.headers, `?after=${after}`)).map(
        (click) => click.city
      )
    ).toEqual(['late']);
  });

  it('leaves out Clicks older than the range, even when saved after the shown one', async () => {
    const link = await server.createLink(alice.headers, 'polled-range');
    const now = Date.now();

    await seedClicks(
      link.id,
      [
        { city: 'shown', age: 3 * DAY_MS },
        { city: 'two-days', age: 2 * DAY_MS },
        { city: 'new', age: MINUTE_MS }
      ],
      now
    );
    const after = afterClick(await findShown(link.id));

    expect(
      (
        await listClicks(link.id, alice.headers, `?range=24h&after=${after}`)
      ).map((click) => click.city)
    ).toEqual(['new']);
  });

  it('lists the newest 50 when more were saved after the shown one', async () => {
    const link = await server.createLink(alice.headers, 'polled-full');
    const now = Date.now();

    await seedClicks(
      link.id,
      [
        { city: 'shown', country: 'FR', age: 100 * MINUTE_MS },
        ...Array.from({ length: 60 }, (_, index) => ({
          city: `n${index}`,
          country: 'ES',
          age: (index + 1) * MINUTE_MS
        }))
      ],
      now
    );
    // past the first page, so found by its country
    const after = afterClick(await findShown(link.id, '?country=FR'));

    expect(
      (await listClicks(link.id, alice.headers, `?after=${after}`)).map(
        (click) => click.city
      )
    ).toEqual(Array.from({ length: 50 }, (_, index) => `n${index}`));
  });

  it.each(['nope', '12-x', '-1', '0', '', '1.5', '01', btoa('12-3')])(
    'returns 400 with the issues for the bad after %j',
    async (after) => {
      const link = await server.createLink(alice.headers, 'bad-after');

      const response = await server.fetch(
        `/api/links/${link.id}/clicks?after=${encodeURIComponent(after)}`,
        { headers: alice.headers }
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toMatchObject({ statusMessage: 'Invalid fields' });
      expect(body.data.map((issue: { path: string[] }) => issue.path)).toEqual([
        ['after']
      ]);
    }
  );
});

describe('ranges', () => {
  const HOUR_MS = 60 * MINUTE_MS;

  // either side of where each range starts
  const AGES: ClickSeed[] = [
    { city: '23 hours', age: 23 * HOUR_MS },
    { city: '25 hours', age: 25 * HOUR_MS },
    { city: '6 days', age: 6 * DAY_MS },
    { city: '8 days', age: 8 * DAY_MS },
    { city: '29 days', age: 29 * DAY_MS },
    { city: '31 days', age: 31 * DAY_MS },
    { city: '364 days', age: 364 * DAY_MS },
    { city: '366 days', age: 366 * DAY_MS }
  ];

  const MONTH = ['23 hours', '25 hours', '6 days', '8 days', '29 days'];

  it.each([
    ['24 hours', '?range=24h', ['23 hours']],
    ['7 days', '?range=7d', ['23 hours', '25 hours', '6 days']],
    ['30 days', '?range=30d', MONTH],
    ['12 months', '?range=12m', [...MONTH, '31 days', '364 days']],
    ['30 days when no range is given', '', MONTH]
  ])('%s counts and lists the same Clicks', async (_, query, cities) => {
    const link = await server.createLink(alice.headers, 'ranges');
    await seedClicks(link.id, AGES);
    await setClickCount(link.id, 9);

    expect(
      (await listClicks(link.id, alice.headers, query)).map(
        (click) => click.city
      )
    ).toEqual(cities);
    expect(await getStatistics(link.id, query)).toMatchObject({
      rangeClicks: cities.length,
      clickCount: 9
    });
  });

  it.each(['/clicks', '/statistics'])(
    'GET /api/links/:id%s returns 400 with the issues for a bad range',
    async (suffix) => {
      const link = await server.createLink(alice.headers, 'bad-range');

      const response = await server.fetch(
        `/api/links/${link.id}${suffix}?range=1y`,
        { headers: alice.headers }
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toMatchObject({ statusMessage: 'Invalid fields' });
      expect(body.data.map((issue: { path: string[] }) => issue.path)).toEqual([
        ['range']
      ]);
    }
  );
});

describe('GET /api/links/:id/statistics', () => {
  it('counts the Countries without Unknown, and joins XX, T1 and no country as one Unknown', async () => {
    const link = await server.createLink(alice.headers, 'countries');

    await seedClicks(link.id, [
      { country: 'FR', age: MINUTE_MS },
      { country: 'ES', age: MINUTE_MS },
      { country: 'ES', age: MINUTE_MS },
      { country: 'XX', age: MINUTE_MS },
      { country: 'T1', age: MINUTE_MS },
      { country: null, age: MINUTE_MS },
      { country: 'DE', age: MINUTE_MS }
    ]);

    expect(await getStatistics(link.id)).toMatchObject({
      rangeClicks: 7,
      countries: 3,
      // most Clicks first, then by code, and Unknown last whatever its count
      countryClicks: [
        { country: 'ES', clicks: 2 },
        { country: 'DE', clicks: 1 },
        { country: 'FR', clicks: 1 },
        { country: 'XX', clicks: 3 }
      ]
    });
  });

  it.each([
    [
      'the most common host, never Direct',
      [null, null, null, 'google.com', 'google.com', 't.co'],
      'google.com'
    ],
    [
      'the first host alphabetically on a tie',
      ['t.co', 'bing.com', 't.co', 'bing.com'],
      'bing.com'
    ],
    ['null with no Referrer at all', [null, null], null]
  ])('gives Top referrer as %s', async (_, referrers, topReferrer) => {
    const link = await server.createLink(alice.headers, 'referrers');

    await seedClicks(
      link.id,
      referrers.map((referrer) => ({ referrer, age: MINUTE_MS }))
    );

    expect((await getStatistics(link.id)).topReferrer).toBe(topReferrer);
  });

  it('gives zeros for a range with no Clicks, and keeps the Click count', async () => {
    const link = await server.createLink(alice.headers, 'quiet');
    await seedClicks(link.id, [
      { country: 'ES', referrer: 'google.com', age: 2 * DAY_MS }
    ]);
    await setClickCount(link.id, 4);

    expect(await getStatistics(link.id, '?range=24h')).toEqual({
      rangeClicks: 0,
      clickCount: 4,
      countries: 0,
      topReferrer: null,
      countryClicks: []
    });
    expect(await listClicks(link.id, alice.headers, '?range=24h')).toEqual([]);
  });
});

describe('Bots', () => {
  const seedBotsAndPeople = async (linkId: string) => {
    await seedClicks(linkId, [
      { city: 'person-es', country: 'ES', referrer: 't.co', age: MINUTE_MS },
      {
        city: 'bot-fr',
        country: 'FR',
        referrer: 'google.com',
        bot: true,
        age: 2 * MINUTE_MS
      },
      {
        city: 'bot-de',
        country: 'DE',
        referrer: 'google.com',
        bot: true,
        age: 3 * MINUTE_MS
      },
      { city: 'person-xx', country: 'XX', age: 4 * MINUTE_MS }
    ]);
    await setClickCount(linkId, 4);
  };

  it.each([
    ['by default', ''],
    ['with bots=false', '?bots=false']
  ])(
    'leaves Bots out of the figures, the countries and the list %s',
    async (_, query) => {
      const link = await server.createLink(alice.headers, 'bots-hidden');
      await seedBotsAndPeople(link.id);

      expect(await getStatistics(link.id, query)).toEqual({
        rangeClicks: 2,
        clickCount: 4,
        countries: 1,
        topReferrer: 't.co',
        countryClicks: [
          { country: 'ES', clicks: 1 },
          { country: 'XX', clicks: 1 }
        ]
      });
      expect(
        (await listClicks(link.id, alice.headers, query)).map(
          (click) => click.city
        )
      ).toEqual(['person-es', 'person-xx']);
    }
  );

  it('counts Bots with bots=true', async () => {
    const link = await server.createLink(alice.headers, 'bots-shown');
    await seedBotsAndPeople(link.id);

    expect(await getStatistics(link.id, '?bots=true')).toEqual({
      rangeClicks: 4,
      clickCount: 4,
      countries: 3,
      topReferrer: 'google.com',
      countryClicks: [
        { country: 'DE', clicks: 1 },
        { country: 'ES', clicks: 1 },
        { country: 'FR', clicks: 1 },
        { country: 'XX', clicks: 1 }
      ]
    });
    expect(
      (await listClicks(link.id, alice.headers, '?bots=true')).map(
        (click) => click.city
      )
    ).toEqual(['person-es', 'bot-fr', 'bot-de', 'person-xx']);
  });

  it('keeps Bots out of every page', async () => {
    const link = await server.createLink(alice.headers, 'bots-paged');

    // a Bot after every person, so a page of 50 people spans 100 Clicks
    await seedClicks(
      link.id,
      Array.from({ length: 120 }, (_, index) => ({
        city: `c${index}`,
        bot: index % 2 === 1,
        age: (index + 1) * MINUTE_MS
      }))
    );

    const first = await listClicksPage(link.id);
    const second = await listClicksPage(
      link.id,
      alice.headers,
      `?cursor=${encodeURIComponent(first.cursor!)}`
    );

    expect(
      [first, second].flatMap((page) => page.clicks.map((click) => click.city))
    ).toEqual(Array.from({ length: 60 }, (_, index) => `c${index * 2}`));
    expect(second.cursor).toBeNull();
  });

  it.each(['/clicks', '/statistics'])(
    'GET /api/links/:id%s returns 400 with the issues for a bad bots',
    async (suffix) => {
      const link = await server.createLink(alice.headers, 'bad-bots');

      const response = await server.fetch(
        `/api/links/${link.id}${suffix}?bots=yes`,
        { headers: alice.headers }
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toMatchObject({ statusMessage: 'Invalid fields' });
      expect(body.data.map((issue: { path: string[] }) => issue.path)).toEqual([
        ['bots']
      ]);
    }
  );
});

describe('country', () => {
  const seedCountries = (linkId: string) =>
    seedClicks(linkId, [
      { city: 'es-1', country: 'ES', age: MINUTE_MS },
      { city: 'fr', country: 'FR', age: 2 * MINUTE_MS },
      { city: 'xx', country: 'XX', age: 3 * MINUTE_MS },
      { city: 'es-2', country: 'ES', age: 4 * MINUTE_MS },
      { city: 't1', country: 'T1', age: 5 * MINUTE_MS },
      { city: 'none', country: null, age: 6 * MINUTE_MS },
      { city: 'es-old', country: 'ES', age: 40 * DAY_MS }
    ]);

  it("lists only Spain's Clicks with country=ES, within the range", async () => {
    const link = await server.createLink(alice.headers, 'country-es');
    await seedCountries(link.id);

    expect(
      (await listClicks(link.id, alice.headers, '?country=ES')).map(
        (click) => click.city
      )
    ).toEqual(['es-1', 'es-2']);
  });

  it('lists every Unknown Click with country=XX: XX, T1 and no country', async () => {
    const link = await server.createLink(alice.headers, 'country-xx');
    await seedCountries(link.id);

    expect(
      (await listClicks(link.id, alice.headers, '?country=XX')).map(
        (click) => click.city
      )
    ).toEqual(['xx', 't1', 'none']);
  });

  it.each(['es', 'ESP', 'E1'])(
    'GET /api/links/:id/clicks returns 400 with the issues for country=%s',
    async (country) => {
      const link = await server.createLink(alice.headers, 'bad-country');

      const response = await server.fetch(
        `/api/links/${link.id}/clicks?country=${country}`,
        { headers: alice.headers }
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toMatchObject({ statusMessage: 'Invalid fields' });
      expect(body.data.map((issue: { path: string[] }) => issue.path)).toEqual([
        ['country']
      ]);
    }
  );
});

describe('access', () => {
  it.each(['', '/clicks', '/statistics'])(
    'GET /api/links/:id%s returns 401 without a session',
    async (suffix) => {
      const link = await server.createLink(alice.headers, 'signed-out');

      const response = await server.fetch(`/api/links/${link.id}${suffix}`);

      expect(response.status).toBe(401);
    }
  );

  it.each(['', '/clicks', '/statistics'])(
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

  it.each(['', '/clicks', '/statistics'])(
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

    expect(await listRecorded(second.id, bob.headers)).toEqual([]);
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

    expect(await listRecorded(link.id)).toMatchObject([MADRID]);
    expect((await getLink(link.id)).clicks).toBe(1);
  });
});
