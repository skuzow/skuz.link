import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Click } from '#layers/links/shared/domain/click.type';
import type { Link } from '#layers/links/shared/domain/link.type';
import { makeClick, makeLink } from '#layers/links/app/testing/fixtures';
// beside the component, because Nuxt would route a test file in pages/
import StatisticsPage from '#layers/links/app/pages/links/[id].vue';

const getLink = vi.fn((): Link =>
  makeLink({
    id: 'link-1',
    slug: 'repo',
    redirectUrl: 'https://example.com/repo'
  })
);
const getClicks = vi.fn((): Click[] => []);

registerEndpoint('/api/links/link-1', { method: 'GET', handler: getLink });
registerEndpoint('/api/links/link-1/clicks', {
  method: 'GET',
  handler: getClicks
});

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
  getClicks.mockReturnValue([]);
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

    expect(headers()).toEqual(['Time', 'Where', 'Client']);
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

  it('says so when no Click came in the last 30 days', async () => {
    const wrapper = await mountPage();

    expect(wrapper.find('table').exists()).toBe(false);
    expect(wrapper.text()).toContain('No Clicks in this range');
  });

  it('reads in Spanish', async () => {
    getClicks.mockReturnValue([
      makeClick({
        id: 3,
        country: 'ES',
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

    const wrapper = await mountPage('/es/links/link-1');

    expect(wrapper.text()).toContain('Estadísticas');
    expect(headers()).toEqual(['Hora', 'Dónde', 'Cliente']);
    expect(rows()[1]?.textContent).toContain('Desconocido');
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
