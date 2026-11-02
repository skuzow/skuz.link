import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { isReservedLinkSlug } from '#layers/links/shared/domain/link.schema';
import App from '@/app.vue';
import { LANDING_EXAMPLE_LINKS } from '@/constants/landing.constant';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const mountLanding = async (route = '/') => {
  mounted = await mountSuspended(App, { route, attachTo: document.body });

  return mounted;
};

const main = () => {
  const element = document.body.querySelector('main');
  if (!element) throw new Error('Missing main');

  return element;
};

const clickCopy = async () => {
  const button = [...main().querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === 'Copy'
  );
  if (!button) throw new Error('Missing Copy button');

  await new DOMWrapper(button).trigger('click');
};

const panelRows = () => [...main().querySelectorAll('li')];

const rowTexts = () =>
  panelRows().map((row) =>
    [...row.querySelectorAll('span')].map((element) =>
      element.textContent?.trim()
    )
  );

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  // better-auth calls fetch on an absolute URL, which registerEndpoint misses
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json({})
  );

  writeText = vi.fn(() => Promise.resolve());
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
});

afterEach(() => {
  // unmount before clearing the body, or Vue patches the cleared body
  mounted?.unmount();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  useState('auth:session').value = null;
  useState('auth:user').value = null;
});

describe('landing plate', () => {
  it('copies the full Short URL and confirms it in a toast', async () => {
    await mountLanding();

    expect(main().textContent).toContain('skuz.link/github');

    await clickCopy();

    const shortUrl = `${useRequestURL().origin}/github`;
    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Link copied', {
        description: shortUrl
      })
    );
    expect(writeText).toHaveBeenCalledWith(shortUrl);
  });

  it('shows an error when the clipboard rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    await mountLanding();

    await clickCopy();

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      )
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe('landing example panel', () => {
  it.each([
    ['/', 'Example', '1,204'],
    ['/es', 'Ejemplo', '1204']
  ])('labels the rows as samples at %s', async (route, label, clicks) => {
    await mountLanding(route);

    expect(main().textContent).toContain(label);
    expect(rowTexts()).toEqual([
      ['/github', 'https://github.com/skuzow', clicks],
      ['/repo', 'https://github.com/skuzow/skuz.link', '86'],
      ['/x', 'https://x.com/skuzow', '3']
    ]);
  });

  it('gives each row a Slug mark and no way to interact', async () => {
    await mountLanding();

    for (const row of panelRows()) {
      expect(row.querySelectorAll('svg')).toHaveLength(1);
      expect(row.querySelectorAll('a, button')).toHaveLength(0);
    }
  });

  it('never shows a Reserved slug', () => {
    expect(LANDING_EXAMPLE_LINKS.map(({ slug }) => slug)).toEqual([
      'github',
      'repo',
      'x'
    ]);
    for (const { slug } of LANDING_EXAMPLE_LINKS)
      expect(isReservedLinkSlug(slug), slug).toBe(false);
  });
});

describe('landing Get started', () => {
  const getStartedHref = (label: string) =>
    [...main().querySelectorAll('a')]
      .find((element) => element.textContent?.trim() === label)
      ?.getAttribute('href');

  it.each([
    ['/', 'Get started', '/login'],
    ['/es', 'Empezar', '/es/login']
  ])('goes to login when signed out at %s', async (route, label, href) => {
    await mountLanding(route);

    expect(getStartedHref(label)).toBe(href);
  });

  it.each([
    ['/', 'Get started', '/links'],
    ['/es', 'Empezar', '/es/links']
  ])('goes to Links when signed in at %s', async (route, label, href) => {
    useState('auth:session').value = { token: 'session-token' };
    useState('auth:user').value = { name: 'Ada Lovelace', image: null };

    await mountLanding(route);

    expect(getStartedHref(label)).toBe(href);
  });
});
