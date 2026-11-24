import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { getQuery, type H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import type {
  ClicksPage,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { decodeClickCursor } from '#layers/links/shared/domain/click.cursor';
import {
  makeClick,
  makeClicksPage,
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
const getClicks = vi.fn((_event: H3Event): ClicksPage => makeClicksPage());
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

// whether each call to a route asked for Bots
const botsAsked = (route: typeof getClicks | typeof getStatistics) =>
  route.mock.calls.map(([event]) => getQuery(event).bots);

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

const map = () => document.body.querySelector('svg[role="img"]');

// the texts in the strip of the panel that holds the map
const mapStrip = () =>
  [
    ...([...document.body.querySelectorAll('h2')].find(
      (heading) => heading.textContent?.trim() === 'Clicks by country'
    )?.parentElement?.children ?? [])
  ].map((element) => element.textContent?.trim());

// moves the pointer onto a country's dots
const point = async (country: string) => {
  map()
    ?.querySelector(`[data-country="${country}"]`)
    ?.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  await nextTick();
};

const tooltip = () =>
  document.body.querySelector('[role="tooltip"]')?.textContent?.trim();

// "Countries, most Clicks first", in either language
const countryList = () => document.body.querySelector('ol[aria-label]');

// each row's words: code, name and Clicks
const countryRows = () =>
  [...(countryList()?.querySelectorAll('button') ?? [])].map((button) =>
    [...button.children]
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .join(' ')
  );

const showAllButton = () =>
  [...document.body.querySelectorAll('button')].find((button) =>
    ['Show all', 'Show fewer'].includes(button.textContent?.trim() ?? '')
  );

const legend = () =>
  [...document.body.querySelectorAll('[aria-label="Map legend"] li')].map(
    (step) => step.textContent?.trim()
  );

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

const botsToggle = () =>
  [...document.body.querySelectorAll('button')].find(
    (button) => button.textContent?.trim() === 'Show bots'
  );

// until the figures and the Clicks with or without Bots have landed, or failed
const toggleBots = async () => {
  botsToggle()?.click();
  await nextTick();
  await vi.waitFor(() =>
    expect(document.body.querySelector('[aria-busy="true"]')).toBeNull()
  );
  await flushPromises();
};

const loadMoreButton = () =>
  [...document.body.querySelectorAll('button')].find(
    (button) => button.textContent?.trim() === 'Load more'
  );

// until the next page has landed, or failed
const loadMore = async () => {
  loadMoreButton()?.click();
  await nextTick();
  await vi.waitFor(() =>
    expect(loadMoreButton()?.getAttribute('aria-busy')).not.toBe('true')
  );
  await flushPromises();
};

// the cursor each call to the Click list sent
const cursorsAsked = () =>
  getClicks.mock.calls.map(([event]) => getQuery(event).cursor);

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
  getClicks.mockReset().mockReturnValue(makeClicksPage());
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
    getClicks.mockReturnValue(
      makeClicksPage([
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
      ])
    );

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
    getClicks.mockReturnValue(
      makeClicksPage([
        makeClick({ id: 3, country: 'XX', region: null, city: null }),
        makeClick({ id: 2, country: 'T1', region: null, city: null }),
        makeClick({ id: 1, country: null, region: null, city: null })
      ])
    );

    await mountPage();

    expect(rows().map((row) => row.children[1]?.textContent?.trim())).toEqual([
      '--Unknown',
      '--Unknown',
      '--Unknown'
    ]);
  });

  it("reads each Click's client, and marks Bots", async () => {
    getClicks.mockReturnValue(
      makeClicksPage([
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
      ])
    );

    await mountPage();

    expect(clients()).toEqual([
      'Chrome · macOS · Desktop',
      'Other · Other · Other',
      'Slackbot-LinkExpanding Bot',
      'Unknown Bot'
    ]);
  });

  it("reads each Click's Referrer host, or Direct", async () => {
    getClicks.mockReturnValue(
      makeClicksPage([
        makeClick({ id: 2, referrer: 'news.ycombinator.com' }),
        makeClick({ id: 1, referrer: null })
      ])
    );

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
    getClicks.mockReturnValue(
      makeClicksPage([makeClick({ id: 2 }), makeClick({ id: 1 })])
    );
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
    // the country list and the Click list
    expect(wrapper.text().match(/No Clicks in this range/g)).toHaveLength(2);
    expect(mapStrip()).toEqual(['Clicks by country', '0 countries']);
    expect(legend()).toEqual(['None']);
    expect(wrapper.text()).not.toContain('0 of 0');

    getClicks.mockReturnValue(
      makeClicksPage([makeClick({ id: 1, city: 'Madrid' })])
    );
    getStatistics.mockReturnValue(
      makeStatistics({ rangeClicks: 1, clickCount: 5, countries: 1 })
    );
    await chooseRange('12 months');

    expect(rows()).toHaveLength(1);
    expect(figures()[0]).toEqual(['Clicks · 12 months', '1']);
  });

  describe('map', () => {
    it('counts the countries in its strip', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 3,
          countryClicks: [
            { country: 'ES', clicks: 118 },
            { country: 'US', clicks: 40 },
            { country: 'FR', clicks: 2 },
            { country: 'XX', clicks: 5 }
          ]
        })
      );

      await mountPage();

      expect(mapStrip()).toEqual(['Clicks by country', '3 countries']);
    });

    it('shows the lower bound of each step in its legend, from the real counts', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 3,
          countryClicks: [
            { country: 'ES', clicks: 118 },
            { country: 'US', clicks: 40 },
            { country: 'FR', clicks: 2 },
            // Unknown has no dot, so it never sets the top step
            { country: 'XX', clicks: 500 }
          ]
        })
      );

      await mountPage();

      // ceil(4 × ln(1 + n) / ln(1 + 118)) first reaches 2 at 3, 3 at 10 and
      // 4 at 36
      expect(legend()).toEqual(['None', '1+', '3+', '10+', '36+']);
    });

    it('shows only the steps that a count can reach', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 1,
          countryClicks: [{ country: 'ES', clicks: 1 }]
        })
      );

      await mountPage();

      // with one Click at most, that Click lights the top step
      expect(legend()).toEqual(['None', '1+']);
    });

    it("shows a country's name and Clicks while the pointer is on its dots", async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 2,
          countryClicks: [
            { country: 'ES', clicks: 118 },
            { country: 'PT', clicks: 1 }
          ]
        })
      );
      await mountPage();

      await point('ES');
      expect(tooltip()).toBe('Spain · 118 Clicks');

      await point('PT');
      expect(tooltip()).toBe('Portugal · 1 Click');

      // land with no Clicks does nothing
      await point('FR');
      expect(tooltip()).toBeUndefined();

      await point('ES');
      map()?.dispatchEvent(new PointerEvent('pointerleave'));
      await nextTick();
      expect(tooltip()).toBeUndefined();
    });

    it('lists each country with its Clicks, most first, and Unknown last', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 2,
          countryClicks: [
            { country: 'XX', clicks: 50 },
            { country: 'ES', clicks: 1180 },
            { country: 'DE', clicks: 3 }
          ]
        })
      );
      await mountPage();

      expect(countryList()?.getAttribute('aria-label')).toBe(
        'Countries, most Clicks first'
      );
      expect(countryRows()).toEqual([
        'ES Spain 1,180',
        'DE Germany 3',
        '-- Unknown 50'
      ]);
    });

    it('names countries in the language of the page', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 2,
          countryClicks: [
            { country: 'ES', clicks: 1180 },
            { country: 'DE', clicks: 3 },
            { country: 'XX', clicks: 1 }
          ]
        })
      );
      await mountPage('/es/links/link-1');

      expect(countryRows()).toEqual([
        'ES España 1180',
        'DE Alemania 3',
        '-- Desconocido 1'
      ]);

      await point('ES');
      expect(tooltip()).toBe('España · 1180 clics');
    });

    it('folds the list after six countries until Show all', async () => {
      const codes = ['ES', 'US', 'DE', 'FR', 'PT', 'IT', 'GB'];
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: codes.length,
          countryClicks: codes.map((country, index) => ({
            country,
            clicks: 10 - index
          }))
        })
      );
      await mountPage();

      expect(countryRows()).toHaveLength(7);
      expect(showAllButton()?.textContent?.trim()).toBe('Show all');

      showAllButton()?.click();
      await nextTick();
      expect(showAllButton()?.textContent?.trim()).toBe('Show fewer');

      showAllButton()?.click();
      await nextTick();
      expect(showAllButton()?.textContent?.trim()).toBe('Show all');
    });

    it('has no Show all with six countries or fewer', async () => {
      getStatistics.mockReturnValue(
        makeStatistics({
          countries: 1,
          countryClicks: [{ country: 'ES', clicks: 1 }]
        })
      );
      await mountPage();

      expect(showAllButton()).toBeUndefined();
    });

    it('points from the map to the country list', async () => {
      await mountPage();

      expect(map()?.getAttribute('aria-label')).toContain('country list');
    });
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

      getClicks.mockReturnValue(
        makeClicksPage([makeClick({ id: 1, city: 'Lisbon' })])
      );
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
      getClicks.mockReturnValue(
        makeClicksPage([makeClick({ id: 1, city: 'Madrid' })])
      );
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

  describe('Bots', () => {
    it('leaves Bots out by default', async () => {
      await mountPage();

      expect(botsToggle()?.getAttribute('aria-pressed')).toBe('false');
      expect(botsAsked(getStatistics)).toEqual(['false']);
      expect(botsAsked(getClicks)).toEqual(['false']);
    });

    it('reads Show bots from the address on load', async () => {
      await mountPage('/links/link-1?range=7d&bots=true');

      expect(botsToggle()?.getAttribute('aria-pressed')).toBe('true');
      expect(botsAsked(getStatistics)).toEqual(['true']);
      expect(botsAsked(getClicks)).toEqual(['true']);
      expect(rangesAsked(getClicks)).toEqual(['7d']);
    });

    it('writes Show bots into the address in place, and fetches again', async () => {
      await mountPage('/links/link-1?range=7d');
      const historyLength = window.history.length;

      getClicks.mockReturnValue(
        makeClicksPage([makeClick({ id: 1, bot: true, botName: 'Slackbot' })])
      );
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 1 }));
      await toggleBots();

      expect(currentQuery()).toEqual({ range: '7d', bots: 'true' });
      expect(window.history.length).toBe(historyLength);
      expect(botsToggle()?.getAttribute('aria-pressed')).toBe('true');
      expect(figures()[0]).toEqual(['Clicks · 7 days', '1']);
      expect(clients()).toEqual(['Slackbot Bot']);
      expect(botsAsked(getStatistics)).toEqual(['false', 'true']);
      expect(botsAsked(getClicks)).toEqual(['false', 'true']);
      expect(rangesAsked(getClicks)).toEqual(['7d', '7d']);

      // hidden Bots are left out of the address
      await toggleBots();

      expect(currentQuery()).toEqual({ range: '7d' });
      expect(window.history.length).toBe(historyLength);
      expect(botsToggle()?.getAttribute('aria-pressed')).toBe('false');
      expect(botsAsked(getClicks)).toEqual(['false', 'true', 'false']);
    });

    it('keeps Show bots through a new range and Load more', async () => {
      getClicks.mockReturnValue(makeClicksPage([makeClick()], 'page-2'));
      await mountPage('/links/link-1?bots=true');

      await chooseRange('7 days');
      await loadMore();

      expect(currentQuery()).toEqual({ range: '7d', bots: 'true' });
      expect(botsAsked(getStatistics)).toEqual(['true', 'true']);
      expect(botsAsked(getClicks)).toEqual(['true', 'true', 'true']);
    });

    it('shows the toast and keeps what it showed when Show bots fails', async () => {
      getClicks.mockReturnValue(
        makeClicksPage([makeClick({ id: 1, city: 'Madrid' })])
      );
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 1 }));
      await mountPage();

      // every time, because $fetch tries a failed GET twice
      getClicks.mockImplementation(() => {
        throw createError({ statusCode: 500 });
      });
      await toggleBots();

      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      );
      expect(rows()[0]?.textContent).toContain('Madrid');
      expect(figures()[0]).toEqual(['Clicks · 30 days', '1']);
      expect(botsToggle()?.getAttribute('aria-pressed')).toBe('false');
      expect(currentQuery()).toEqual({});
    });
  });

  describe('country', () => {
    // the country each call to the Click list asked for
    const countriesAsked = () =>
      getClicks.mock.calls.map(([event]) => getQuery(event).country);

    const countryRow = (code: string) =>
      [...(countryList()?.querySelectorAll('button') ?? [])].find(
        (button) => button.children[1]?.textContent?.trim() === code
      );

    // the button beside the Click list's heading, in either language
    const chip = () =>
      document.body.querySelector<HTMLButtonElement>('h2 + button');

    const announced = () =>
      document.body.querySelector('[aria-live="polite"]')?.textContent?.trim();

    // until the Clicks of the new filter have landed, or failed
    const settle = async () => {
      await nextTick();
      await vi.waitFor(() =>
        expect(document.body.querySelector('[aria-busy="true"]')).toBeNull()
      );
      await flushPromises();
    };

    const pickRow = async (code: string) => {
      countryRow(code)?.click();
      await settle();
    };

    const clickMap = async (code: string) => {
      map()
        ?.querySelector(`[data-country="${code}"]`)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
    };

    beforeEach(() => {
      getStatistics.mockReturnValue(
        makeStatistics({
          rangeClicks: 120,
          countries: 2,
          countryClicks: [
            { country: 'ES', clicks: 118 },
            { country: 'PT', clicks: 1 },
            { country: 'XX', clicks: 1 }
          ]
        })
      );
      getClicks.mockImplementation((event) =>
        getQuery(event).country === 'ES'
          ? makeClicksPage([makeClick({ id: 2, city: 'Madrid' })])
          : makeClicksPage([
              makeClick({ id: 2, city: 'Madrid' }),
              makeClick({ id: 1, country: 'PT', city: 'Lisbon' })
            ])
      );
    });

    it('lists every country by default', async () => {
      const wrapper = await mountPage();

      expect(countriesAsked()).toEqual([undefined]);
      expect(chip()).toBeNull();
      expect(countryRow('ES')?.getAttribute('aria-pressed')).toBe('false');
      expect(wrapper.text()).toContain('2 of 120');
    });

    it('reads the picked country from the address on load', async () => {
      const wrapper = await mountPage('/links/link-1?range=7d&country=ES');

      expect(countriesAsked()).toEqual(['ES']);
      expect(rangesAsked(getClicks)).toEqual(['7d']);
      expect(getQuery(getStatistics.mock.calls[0]![0]).country).toBeUndefined();
      expect(countryRow('ES')?.getAttribute('aria-pressed')).toBe('true');
      expect(chip()?.textContent?.trim()).toBe('Spain');
      expect(wrapper.text()).toContain('1 of 118');
    });

    it('ignores a country it does not read', async () => {
      await mountPage('/links/link-1?country=spain');

      expect(countriesAsked()).toEqual([undefined]);
      expect(chip()).toBeNull();
    });

    it('picks a country from the list, and clears it with a second pick', async () => {
      const wrapper = await mountPage('/links/link-1?range=7d');
      const historyLength = window.history.length;

      await pickRow('ES');

      expect(currentQuery()).toEqual({ range: '7d', country: 'ES' });
      expect(window.history.length).toBe(historyLength);
      expect(rows().map((row) => row.children[1]?.textContent)).toEqual([
        expect.stringContaining('Madrid')
      ]);
      expect(countryRow('ES')?.getAttribute('aria-pressed')).toBe('true');
      expect(countryRow('PT')?.getAttribute('aria-pressed')).toBe('false');
      expect(wrapper.text()).toContain('1 of 118');
      // only the Click list is fetched again
      expect(getStatistics).toHaveBeenCalledTimes(1);
      expect(countriesAsked()).toEqual([undefined, 'ES']);
      expect(rangesAsked(getClicks)).toEqual(['7d', '7d']);

      await pickRow('ES');

      expect(currentQuery()).toEqual({ range: '7d' });
      expect(window.history.length).toBe(historyLength);
      expect(rows()).toHaveLength(2);
      expect(countryRow('ES')?.getAttribute('aria-pressed')).toBe('false');
      expect(chip()).toBeNull();
      expect(countriesAsked()).toEqual([undefined, 'ES', undefined]);
    });

    it('picks Unknown from the list', async () => {
      await mountPage();

      await pickRow('--');

      expect(currentQuery()).toEqual({ country: 'XX' });
      expect(countriesAsked()).toEqual([undefined, 'XX']);
      expect(chip()?.getAttribute('aria-label')).toBe(
        'Clear the filter: Unknown'
      );
    });

    it('picks a lit country on the map, and does nothing on land with no Clicks', async () => {
      await mountPage();

      await clickMap('FR');

      expect(countriesAsked()).toEqual([undefined]);
      expect(currentQuery()).toEqual({});

      await clickMap('ES');

      expect(countriesAsked()).toEqual([undefined, 'ES']);
      expect(currentQuery()).toEqual({ country: 'ES' });

      await clickMap('ES');

      expect(countriesAsked()).toEqual([undefined, 'ES', undefined]);
      expect(currentQuery()).toEqual({});
    });

    it('clears the filter with the chip, and announces each change', async () => {
      await mountPage();

      expect(announced()).toBe('');

      await pickRow('ES');

      expect(chip()?.getAttribute('aria-label')).toBe(
        'Clear the filter: Spain'
      );
      expect(announced()).toBe('Showing Clicks from Spain');

      chip()?.click();
      await settle();

      expect(chip()).toBeNull();
      expect(currentQuery()).toEqual({});
      expect(rows()).toHaveLength(2);
      expect(announced()).toBe('Showing Clicks from every country');
    });

    it('keeps the country through a new range and Load more', async () => {
      getClicks
        .mockReset()
        .mockReturnValue(makeClicksPage([makeClick()], 'page-2'));
      await mountPage('/links/link-1?country=ES');

      await chooseRange('7 days');
      await loadMore();

      expect(currentQuery()).toEqual({ range: '7d', country: 'ES' });
      expect(countriesAsked()).toEqual(['ES', 'ES', 'ES']);
    });

    it('shows the new range when a country is picked before its figures land', async () => {
      await mountPage();

      getStatistics.mockReturnValue(
        makeStatistics({
          rangeClicks: 7,
          countries: 1,
          countryClicks: [{ country: 'ES', clicks: 7 }]
        })
      );
      rangeButton('7 days')?.click();
      await nextTick();
      await pickRow('ES');

      expect(figures()[0]).toEqual(['Clicks · 7 days', '7']);
      expect(rangesAsked(getStatistics).at(-1)).toBe('7d');
      expect(currentQuery()).toEqual({ range: '7d', country: 'ES' });
    });

    it('clears the filter with a second press before the first pick lands', async () => {
      await mountPage();

      countryRow('ES')?.click();
      await nextTick();
      await pickRow('ES');

      expect(countriesAsked()).toEqual([undefined, 'ES', undefined]);
      expect(currentQuery()).toEqual({});
      expect(chip()).toBeNull();
    });

    it('shows the toast and keeps the rows when a pick fails', async () => {
      await mountPage();

      // every time, because $fetch tries a failed GET twice
      getClicks.mockImplementation(() => {
        throw createError({ statusCode: 500 });
      });
      await pickRow('ES');

      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      );
      expect(rows()).toHaveLength(2);
      expect(countryRow('ES')?.getAttribute('aria-pressed')).toBe('false');
      expect(chip()).toBeNull();
      expect(currentQuery()).toEqual({});
    });

    it('reads in Spanish', async () => {
      await mountPage('/es/links/link-1');

      await pickRow('ES');

      expect(chip()?.getAttribute('aria-label')).toBe(
        'Quitar el filtro: España'
      );
      expect(announced()).toBe('Mostrando clics de España');
    });
  });

  describe('Load more', () => {
    beforeEach(() => {
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 3 }));
      getClicks.mockImplementation((event) =>
        getQuery(event).cursor === 'page-2'
          ? makeClicksPage([makeClick({ id: 1, city: 'Porto' })])
          : makeClicksPage(
              [
                makeClick({ id: 3, city: 'Madrid' }),
                makeClick({ id: 2, city: 'Lisbon' })
              ],
              'page-2'
            )
      );
    });

    it('appends the next Clicks, and goes away at the end', async () => {
      const wrapper = await mountPage('/links/link-1?range=7d');

      expect(rows()).toHaveLength(2);
      expect(wrapper.text()).toContain('2 of 3');

      await loadMore();

      expect(rows().map((row) => row.children[1]?.textContent)).toEqual([
        expect.stringContaining('Madrid'),
        expect.stringContaining('Lisbon'),
        expect.stringContaining('Porto')
      ]);
      expect(wrapper.text()).toContain('3 of 3');
      expect(cursorsAsked()).toEqual([undefined, 'page-2']);
      expect(rangesAsked(getClicks)).toEqual(['7d', '7d']);
      expect(loadMoreButton()).toBeUndefined();
    });

    it('shows no Load more when the first page is the last', async () => {
      getClicks.mockReset().mockReturnValue(makeClicksPage([makeClick()]));
      await mountPage();

      expect(rows()).toHaveLength(1);
      expect(loadMoreButton()).toBeUndefined();
    });

    it('shows the toast and keeps the rows when Load more fails', async () => {
      await mountPage();

      // every time, because $fetch tries a failed GET twice
      getClicks.mockImplementation(() => {
        throw createError({ statusCode: 500 });
      });
      await loadMore();

      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      );
      expect(rows()).toHaveLength(2);
      expect(loadMoreButton()).toBeDefined();
    });

    it('starts again from the first page after a new range', async () => {
      await mountPage();
      await loadMore();
      await chooseRange('7 days');

      expect(rows()).toHaveLength(2);
      expect(cursorsAsked()).toEqual([undefined, 'page-2', undefined]);
      expect(loadMoreButton()).toBeDefined();
    });
  });

  describe('live', () => {
    const NOW = new Date('2026-11-23T12:00:00.000Z');

    // the after each call to the Click list sent, as the Click it names
    const aftersAsked = () =>
      getClicks.mock.calls.map(([event]) => {
        const after = getQuery(event).after;

        return typeof after === 'string' ? decodeClickCursor(after) : after;
      });

    const cities = () =>
      rows().map((row) => row.children[1]?.textContent?.trim());

    // the words at the end of the summary's strip, beside "Statistics"
    const liveState = () =>
      document.body
        .querySelector('h1')
        ?.closest('[data-slot="card"]')
        ?.querySelector('[data-slot="card-header"]')
        ?.lastElementChild?.textContent?.trim();

    // as the browser does when the tab hides or shows
    const setVisibility = (state: DocumentVisibilityState) => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state
      });
      document.dispatchEvent(new Event('visibilitychange'));
    };

    afterEach(() => {
      // back to the browser's own value
      Reflect.deleteProperty(document, 'visibilityState');
    });

    beforeEach(() => {
      // the interval too, so 30 seconds pass at once
      vi.useFakeTimers({
        toFake: ['Date', 'setInterval', 'clearInterval'],
        now: NOW
      });
      getClicks.mockImplementation((event) => {
        const { after, cursor } = getQuery(event);

        if (after) {
          return makeClicksPage([
            makeClick({
              id: 13,
              createdAt: new Date('2026-11-23T11:59:40.000Z'),
              city: 'Porto'
            })
          ]);
        }

        if (cursor === 'page-2') {
          return makeClicksPage([makeClick({ id: 10, city: 'Paris' })]);
        }

        return makeClicksPage(
          [
            makeClick({
              id: 12,
              createdAt: new Date('2026-11-23T11:00:00.000Z'),
              city: 'Madrid'
            }),
            makeClick({ id: 11, city: 'Lisbon' })
          ],
          'page-2'
        );
      });
    });

    it('asks for newer Clicks and fresh figures every 30 seconds, and shows the Clicks on top', async () => {
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 3 }));
      await mountPage('/links/link-1?range=7d&bots=true&country=ES');

      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 4 }));
      vi.advanceTimersByTime(29_999);
      await flushPromises();

      expect(getClicks).toHaveBeenCalledTimes(1);
      expect(getStatistics).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1);
      await vi.waitFor(() => expect(rows()).toHaveLength(3));
      await flushPromises();

      expect(cities()).toEqual([
        expect.stringContaining('Porto'),
        expect.stringContaining('Madrid'),
        expect.stringContaining('Lisbon')
      ]);
      // newer than the newest Click shown, within the same filter
      expect(aftersAsked()).toEqual([
        undefined,
        { createdAt: new Date('2026-11-23T11:00:00.000Z'), id: 12 }
      ]);
      expect(getQuery(getClicks.mock.calls[1]![0])).toMatchObject({
        range: '7d',
        bots: 'true',
        country: 'ES'
      });
      expect(rangesAsked(getStatistics)).toEqual(['7d', '7d']);
      expect(botsAsked(getStatistics)).toEqual(['true', 'true']);
      expect(figures()[0]).toEqual(['Clicks · 7 days', '4']);
    });

    it('pauses while the tab is hidden, and asks at once when it shows', async () => {
      const wrapper = await mountPage();

      expect(liveState()).toBe('Live');

      setVisibility('hidden');
      await nextTick();

      expect(liveState()).toBe('Paused');

      vi.advanceTimersByTime(90_000);
      await flushPromises();

      expect(getClicks).toHaveBeenCalledTimes(1);
      expect(getStatistics).toHaveBeenCalledTimes(1);

      setVisibility('visible');
      await vi.waitFor(() => expect(rows()).toHaveLength(3));

      expect(liveState()).toBe('Live');
      expect(aftersAsked()).toHaveLength(2);
      expect(getStatistics).toHaveBeenCalledTimes(2);
      expect(wrapper.text()).toContain('Porto');

      // and again 30 seconds later
      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(getClicks).toHaveBeenCalledTimes(3));
    });

    it('reads in Spanish', async () => {
      await mountPage('/es/links/link-1');

      expect(liveState()).toBe('En directo');

      setVisibility('hidden');
      await nextTick();

      expect(liveState()).toBe('En pausa');
    });

    it('loads the list again from the top when a full page of new Clicks arrives', async () => {
      await mountPage();

      // 50 newer Clicks may leave a gap below them, so the first page comes
      // again, with a cursor of its own
      const newer = Array.from({ length: 50 }, (_, index) =>
        makeClick({
          id: 100 - index,
          createdAt: new Date(NOW.getTime() - (index + 2) * 1000),
          city: `New ${index}`
        })
      );
      getClicks.mockImplementation((event) => {
        const { after, cursor } = getQuery(event);

        if (after) return makeClicksPage(newer);
        if (cursor === 'top-2') {
          return makeClicksPage([makeClick({ id: 1, city: 'Oldest' })]);
        }

        return makeClicksPage(
          [
            makeClick({
              id: 101,
              createdAt: new Date(NOW.getTime() - 1000),
              city: 'Newest'
            }),
            ...newer.slice(0, 49)
          ],
          'top-2'
        );
      });
      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(rows()).toHaveLength(50));
      await flushPromises();

      expect(cities()[0]).toContain('Newest');
      expect(cities()[49]).toContain('New 48');
      expect(aftersAsked()).toEqual([
        undefined,
        { createdAt: new Date('2026-11-23T11:00:00.000Z'), id: 12 },
        undefined
      ]);
      expect(cursorsAsked()).toEqual([undefined, undefined, undefined]);

      // Load more goes on from the new first page
      await loadMore();

      expect(cursorsAsked().at(-1)).toBe('top-2');
      expect(cities().at(-1)).toContain('Oldest');
    });

    it('shows nothing when a poll fails, and asks again on the next tick', async () => {
      getStatistics.mockReturnValue(makeStatistics({ rangeClicks: 2 }));
      await mountPage();

      // every time, because $fetch tries a failed GET twice
      getStatistics.mockImplementation(() => {
        throw createError({ statusCode: 500 });
      });
      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(getStatistics).toHaveBeenCalledTimes(3));
      await flushPromises();

      expect(toast.error).not.toHaveBeenCalled();
      expect(useError().value).toBeUndefined();
      expect(rows()).toHaveLength(2);
      expect(figures()[0]).toEqual(['Clicks · 30 days', '2']);
      expect(liveState()).toBe('Live');

      getStatistics
        .mockReset()
        .mockReturnValue(makeStatistics({ rangeClicks: 3 }));
      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(rows()).toHaveLength(3));
      await flushPromises();

      expect(figures()[0]).toEqual(['Clicks · 30 days', '3']);
    });

    it('fails with a fatal 404 when the Link is deleted in another tab', async () => {
      await mountPage();

      const notFound = () => {
        throw createError({ statusCode: 404, statusMessage: 'Link not found' });
      };
      getClicks.mockImplementation(notFound);
      getStatistics.mockImplementation(notFound);
      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(useError().value).toBeDefined());

      expect(useError().value).toMatchObject({ status: 404, fatal: true });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("keeps Load more's place when new Clicks arrive", async () => {
      await mountPage();

      vi.advanceTimersByTime(30_000);
      await vi.waitFor(() => expect(rows()).toHaveLength(3));
      await loadMore();

      expect(cursorsAsked()).toEqual([undefined, undefined, 'page-2']);
      expect(cities()).toEqual([
        expect.stringContaining('Porto'),
        expect.stringContaining('Madrid'),
        expect.stringContaining('Lisbon'),
        expect.stringContaining('Paris')
      ]);
    });
  });

  it('reads in Spanish', async () => {
    getClicks.mockReturnValue(
      makeClicksPage([
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
      ])
    );
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

  it.each([
    ['a new range', () => chooseRange('7 days')],
    ['Show bots', () => toggleBots()],
    ['Load more', () => loadMore()]
  ])(
    'fails with a fatal 404 when %s finds the Link deleted',
    async (_, act) => {
      getClicks.mockReturnValue(makeClicksPage([makeClick()], 'page-2'));
      await mountPage();

      const notFound = () => {
        throw createError({ statusCode: 404, statusMessage: 'Link not found' });
      };
      getClicks.mockImplementation(notFound);
      getStatistics.mockImplementation(notFound);
      await act();

      expect(useError().value).toMatchObject({ status: 404, fatal: true });
      expect(toast.error).not.toHaveBeenCalled();
    }
  );

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
