import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { getQuery, type H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import type {
  Click,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import {
  makeClick,
  makeLink,
  makeStatistics
} from '#layers/links/app/testing/fixtures';
// beside the component, because Nuxt would route a test file in pages/
import StatisticsPage from '#layers/links/app/pages/links/[id].vue';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

const getLink = vi.fn((): Link =>
  makeLink({
    id: 'link-1',
    slug: 'repo',
    redirectUrl: 'https://example.com/repo'
  })
);
const getClicks = vi.fn((_event: H3Event): Click[] => []);
const getStatistics = vi.fn((_event: H3Event): LinkStatistics =>
  makeStatistics()
);

registerEndpoint('/api/links/link-1', { method: 'GET', handler: getLink });
registerEndpoint('/api/links/link-1/clicks', {
  method: 'GET',
  handler: getClicks
});
registerEndpoint('/api/links/link-1/statistics', {
  method: 'GET',
  handler: getStatistics
});

// the range each call to a route asked for
const rangesAsked = (route: typeof getClicks | typeof getStatistics) =>
  route.mock.calls.map(([event]) => getQuery(event).range);

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const mountPage = async (
  route = '/links/link-1',
  stubs: Record<string, boolean> = {}
) => {
  mounted = await mountSuspended(StatisticsPage, {
    route,
    attachTo: document.body,
    global: { stubs }
  });
  await flushPromises();

  return mounted;
};

// in the app, a fatal error swaps the page for the ErrorPage; a mounted page
// would go on to render without its data, so its content is stubbed
const mountFailingPage = async () => {
  await mountPage('/links/link-1', { LinksStatistics: true });

  return useError().value;
};

const headers = () =>
  [...document.body.querySelectorAll('th')].map((th) => th.textContent?.trim());

const rows = () => [...document.body.querySelectorAll('tbody tr')];

// the Client cell's words, with the Bot badge as its own word
const clients = () =>
  rows().map((row) =>
    [...(row.lastElementChild?.querySelectorAll('*') ?? [])]
      .filter((element) => !element.children.length)
      .map((element) => element.textContent?.trim())
      .join(' ')
  );

// the From cell's text, the third of each row
const froms = () => rows().map((row) => row.children[2]?.textContent?.trim());

// each figure as its key and its value
const figures = () =>
  [...document.body.querySelectorAll('dl > div')].map((figure) => [
    figure.querySelector('dt')?.textContent?.trim(),
    figure.querySelector('dd')?.textContent?.trim()
  ]);

// by accessible name, which stays whole when phones show the short label
const rangeButton = (name: string) =>
  document.body.querySelector<HTMLButtonElement>(
    `[role="group"] button[aria-label="${name}"]`
  );

const pressedRanges = () =>
  [...document.body.querySelectorAll('[role="group"] button')]
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .map((button) => button.getAttribute('aria-label'));

// until the figures and the Clicks of the new range have landed, or failed
const chooseRange = async (name: string) => {
  rangeButton(name)?.click();
  await nextTick();
  await vi.waitFor(() =>
    expect(document.body.querySelector('[aria-busy="true"]')).toBeNull()
  );
  await flushPromises();
};

const currentQuery = () => useRouter().currentRoute.value.query;

const backLink = () =>
  [...document.body.querySelectorAll('a')].find(
    (element) => element.textContent?.trim() === 'Links'
  );

beforeEach(() => {
  vi.clearAllMocks();
  // midday, so the dates hold in whatever time zone the tests run
  vi.useFakeTimers({
    toFake: ['Date'],
    now: new Date('2026-11-23T12:00:00.000Z')
  });
  clearNuxtData();
  useState('auth:session').value = { token: 'session-token' };
  getClicks.mockReset().mockReturnValue([]);
  getStatistics.mockReset().mockReturnValue(makeStatistics());
});

afterEach(() => {
  // unmount before clearing the body, or Vue patches the cleared body
  mounted?.unmount();
  mounted = undefined;
  vi.useRealTimers();
  clearError();
  useState('auth:session').value = null;
  document.body.innerHTML = '';
});

describe('Statistics page', () => {
  it('shows the Short URL, its Redirect URL and the way back to Links', async () => {
    const wrapper = await mountPage();

    expect(wrapper.find('h1').text()).toBe('skuz.link/repo');
    expect(wrapper.text()).toContain('Statistics');
    expect(wrapper.text()).toContain('https://example.com/repo');
    expect(backLink()?.getAttribute('href')).toBe('/links');
  });

  it('names the Short URL in the title', async () => {
    await mountPage();

    await vi.waitFor(() =>
      expect(document.title).toBe('Statistics for skuz.link/repo - skuz.link')
    );
  });

  it('lists each Click with its time and place, newest first', async () => {
    getClicks.mockReturnValue([
      makeClick({
        id: 2,
        createdAt: new Date('2026-11-19T12:29:00.000Z'),
        country: 'ES',
        region: 'Community of Madrid',
        city: 'Madrid'
      }),
      makeClick({
        id: 1,
        createdAt: new Date('2025-12-30T12:00:00.000Z'),
        country: 'FR',
        region: 'Île-de-France',
        city: 'Paris'
      })
    ]);

    await mountPage();

    expect(headers()).toEqual(['Time', 'Where', 'From', 'Client']);
    expect(rows()).toHaveLength(2);

    const [madrid, paris] = rows();
    const madridTime = madrid?.querySelector('time');

    expect(madridTime?.getAttribute('datetime')).toBe(
      '2026-11-19T12:29:00.000Z'
    );
    // this year's Clicks leave the year out
    expect(madridTime?.textContent).toMatch(/^Nov 19, \d{1,2}:29\s[AP]M$/);
    expect(madridTime?.getAttribute('title')).toMatch(
      /^Nov 19, 2026, \d{1,2}:29:00\s[AP]M$/
    );
    expect(madrid?.textContent).toContain('ES');
    expect(madrid?.textContent).toContain('Madrid, Community of Madrid');

    expect(paris?.querySelector('time')?.textContent).toMatch(
      /^Dec 30, 2025, \d{1,2}:00\s[AP]M$/
    );
    expect(paris?.textContent).toContain('FR');
    expect(paris?.textContent).toContain('Paris, Île-de-France');
  });

  it('reads XX, T1 and a missing country as Unknown', async () => {
    getClicks.mockReturnValue([
      makeClick({ id: 3, country: 'XX', region: null, city: null }),
      makeClick({ id: 2, country: 'T1', region: null, city: null }),
      makeClick({ id: 1, country: null, region: null, city: null })
    ]);

    await mountPage();

    expect(rows().map((row) => row.children[1]?.textContent?.trim())).toEqual([
      '--Unknown',
      '--Unknown',
      '--Unknown'
    ]);
  });

  it("reads each Click's client, and marks Bots", async () => {
    getClicks.mockReturnValue([
      makeClick({
        id: 4,
        browser: 'Chrome',
        os: 'macOS',
        device: 'Desktop'
      }),
      makeClick({
        id: 3,
        browser: 'Other',
        os: 'Other',
        device: 'Other'
      }),
      makeClick({ id: 2, bot: true, botName: 'Slackbot-LinkExpanding' }),
      makeClick({ id: 1, bot: true, botName: null })
    ]);

    await mountPage();

    expect(clients()).toEqual([
      'Chrome · macOS · Desktop',
      'Other · Other · Other',
      'Slackbot-LinkExpanding Bot',
      'Unknown Bot'
    ]);
  });

  it("reads each Click's Referrer host, or Direct", async () => {
    getClicks.mockReturnValue([
      makeClick({ id: 2, referrer: 'news.ycombinator.com' }),
      makeClick({ id: 1, referrer: null })
    ]);

    await mountPage();

    expect(froms()).toEqual(['news.ycombinator.com', 'Direct']);
  });

  it('shows the figures the route returns', async () => {
    getStatistics.mockReturnValue(
      makeStatistics({
        rangeClicks: 1204,
        clickCount: 3456,
        countries: 12,
        topReferrer: 'news.ycombinator.com'
      })
    );

    await mountPage();

    expect(figures()).toEqual([
      ['Clicks · 30 days', '1,204'],
      ['Lifetime Clicks', '3,456'],
      ['Countries', '12'],
      ['Top referrer', 'news.ycombinator.com']
    ]);
  });

  it('counts the Clicks shown out of the Clicks in the range', async () => {
    getClicks.mockReturnValue([makeClick({ id: 2 }), makeClick({ id: 1 })]);
    getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 1180 }));

    const wrapper = await mountPage();

    expect(wrapper.text()).toContain('2 of 1,180');
  });

  it('shows zeros, "—" and an empty list for a range with no Clicks, and still switches', async () => {
    getStatistics.mockReturnValue(makeStatistics({ clickCount: 5 }));

    const wrapper = await mountPage();

    expect(figures()).toEqual([
      ['Clicks · 30 days', '0'],
      ['Lifetime Clicks', '5'],
      ['Countries', '0'],
      ['Top referrer', '—']
    ]);
    expect(wrapper.find('table').exists()).toBe(false);
    expect(wrapper.text()).toContain('No Clicks in this range');
    expect(wrapper.text()).not.toContain('0 of 0');

    getClicks.mockReturnValue([makeClick({ id: 1, city: 'Madrid' })]);
    getStatistics.mockReturnValue(
      makeStatistics({ rangeClicks: 1, clickCount: 5, countries: 1 })
    );
    await chooseRange('12 months');

    expect(rows()).toHaveLength(1);
    expect(figures()[0]).toEqual(['Clicks · 12 months', '1']);
  });

  describe('range', () => {
    it('presses 30 days and asks for it by default', async () => {
      await mountPage();

      expect(pressedRanges()).toEqual(['30 days']);
      expect(rangesAsked(getStatistics)).toEqual(['30d']);
      expect(rangesAsked(getClicks)).toEqual(['30d']);
    });

    it('reads the range from the address on load', async () => {
      await mountPage('/links/link-1?range=7d');

      expect(pressedRanges()).toEqual(['7 days']);
      expect(figures()[0]?.[0]).toBe('Clicks · 7 days');
      expect(rangesAsked(getStatistics)).toEqual(['7d']);
      expect(rangesAsked(getClicks)).toEqual(['7d']);
    });

    it('falls back to 30 days for a range it does not know', async () => {
      await mountPage('/links/link-1?range=1y');

      expect(pressedRanges()).toEqual(['30 days']);
      expect(rangesAsked(getStatistics)).toEqual(['30d']);
      expect(rangesAsked(getClicks)).toEqual(['30d']);
    });

    it('writes a new range into the address in place, and fetches again', async () => {
      await mountPage();
      const historyLength = window.history.length;

      getClicks.mockReturnValue([makeClick({ id: 1, city: 'Lisbon' })]);
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 1 }));
      await chooseRange('24h');

      expect(currentQuery()).toEqual({ range: '24h' });
      expect(window.history.length).toBe(historyLength);
      expect(pressedRanges()).toEqual(['24h']);
      expect(figures()[0]).toEqual(['Clicks · 24h', '1']);
      expect(rows()[0]?.textContent).toContain('Lisbon');
      expect(rangesAsked(getStatistics)).toEqual(['30d', '24h']);
      expect(rangesAsked(getClicks)).toEqual(['30d', '24h']);

      // the default is left out of the address
      await chooseRange('30 days');

      expect(currentQuery()).toEqual({});
      expect(window.history.length).toBe(historyLength);
      expect(rangesAsked(getStatistics)).toEqual(['30d', '24h', '30d']);
    });

    it('shows the toast and keeps what it showed when a new range fails', async () => {
      getClicks.mockReturnValue([makeClick({ id: 1, city: 'Madrid' })]);
      getStatistics.mockReturnValue(
        makeStatistics({ rangeClicks: 1, clickCount: 1, countries: 1 })
      );
      await mountPage();

      // every time, because $fetch tries a failed GET twice
      getStatistics.mockImplementation(() => {
        throw createError({ statusCode: 500 });
      });
      await chooseRange('7 days');

      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      );
      expect(rows()[0]?.textContent).toContain('Madrid');
      expect(figures()[0]).toEqual(['Clicks · 30 days', '1']);
      expect(pressedRanges()).toEqual(['30 days']);
      expect(currentQuery()).toEqual({});
    });
  });

  it('reads in Spanish', async () => {
    getClicks.mockReturnValue([
      makeClick({
        id: 3,
        country: 'ES',
        referrer: 'google.com',
        browser: 'Safari',
        os: 'iOS',
        device: 'Mobile'
      }),
      makeClick({
        id: 2,
        country: 'XX',
        region: null,
        city: null,
        browser: 'Other',
        os: 'Other',
        device: 'Desktop'
      }),
      makeClick({ id: 1, bot: true, botName: null })
    ]);
    getStatistics.mockReturnValue(
      makeStatistics({ rangeClicks: 1204, clickCount: 3456, countries: 2 })
    );

    const wrapper = await mountPage('/es/links/link-1?range=7d');

    expect(wrapper.text()).toContain('Estadísticas');
    expect(figures()).toEqual([
      ['Clics · 7 días', '1204'],
      ['Clics totales', '3456'],
      ['Países', '2'],
      ['Referente principal', '—']
    ]);
    expect(pressedRanges()).toEqual(['7 días']);
    expect(wrapper.text()).toContain('3 de 1204');
    expect(headers()).toEqual(['Hora', 'Dónde', 'Desde', 'Cliente']);
    expect(rows()[1]?.textContent).toContain('Desconocido');
    expect(froms()).toEqual(['google.com', 'Directo', 'Directo']);
    expect(clients()).toEqual([
      'Safari · iOS · Móvil',
      'Otro · Otro · Escritorio',
      'Desconocido Bot'
    ]);
    expect(backLink()?.getAttribute('href')).toBe('/es/links');
  });

  it('fails with a fatal 404 for a Link that is not found', async () => {
    getLink.mockImplementationOnce(() => {
      throw createError({ statusCode: 404, statusMessage: 'Link not found' });
    });

    expect(await mountFailingPage()).toMatchObject({
      status: 404,
      fatal: true
    });
  });

  it('fails with a fatal error when the Clicks fail to load', async () => {
    // every time, because $fetch tries a failed GET twice
    getClicks.mockImplementation(() => {
      throw createError({ statusCode: 500 });
    });

    expect(await mountFailingPage()).toMatchObject({
      status: 500,
      fatal: true
    });
  });
});
