import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorPage from './error.vue';

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const mountErrorPage = async (
  status: number,
  route: string,
  message?: string
) => {
  mounted = await mountSuspended(ErrorPage, {
    props: { error: createError({ status, message }) },
    route,
    attachTo: document.body
  });

  return mounted;
};

const login = () => {
  useState('auth:session').value = { token: 'session-token' };
  useState('auth:user').value = { name: 'Ada Lovelace', image: null };
};

const clickUserMenuItem = async (label: string) => {
  const avatar = document.body.querySelector('[data-slot="avatar-fallback"]');
  const trigger = avatar?.closest('[aria-haspopup="menu"]');
  if (!trigger) throw new Error('Missing user menu');

  await new DOMWrapper(trigger).trigger('keydown', { key: 'Enter' });

  const item = [...document.body.querySelectorAll('[role="menuitem"]')].find(
    (element) => element.textContent?.trim() === label
  );
  if (!item) throw new Error(`Missing menu item ${label}`);

  await new DOMWrapper(item).trigger('click');
};

beforeEach(() => {
  // better-auth calls fetch on an absolute URL, which registerEndpoint misses
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json({})
  );
});

afterEach(() => {
  // unmount before resetting state, or Vue patches the cleared body
  mounted?.unmount();
  vi.restoreAllMocks();
  useState('auth:session').value = null;
  useState('auth:user').value = null;
  useState('settings:isOpen').value = false;
  document.body.innerHTML = '';
});

describe('error page', () => {
  it('shows the English not-found copy and links home at an unprefixed path', async () => {
    const wrapper = await mountErrorPage(404, '/typo');

    expect(wrapper.text()).toContain('404');
    expect(wrapper.find('h1').text()).toBe('Page not found');
    expect(wrapper.text()).toContain(
      "The link or page you're looking for doesn't exist."
    );
    expect(wrapper.find('main a').attributes('href')).toBe('/');
  });

  it('shows the Spanish not-found copy and links to the Spanish home at a Spanish path', async () => {
    const wrapper = await mountErrorPage(404, '/es/typo');

    expect(wrapper.text()).toContain('404');
    expect(wrapper.find('h1').text()).toBe('Página no encontrada');
    expect(wrapper.text()).toContain(
      'El enlace o la página que buscas no existe.'
    );
    expect(wrapper.find('main a').attributes('href')).toBe('/es');
  });

  it('shows the generic copy and hides the error message on a crash', async () => {
    const wrapper = await mountErrorPage(
      500,
      '/',
      'Cannot read db of undefined'
    );

    expect(wrapper.text()).toContain('500');
    expect(wrapper.find('h1').text()).toBe('Something went wrong');
    expect(wrapper.text()).toContain(
      'An unexpected error occurred. Please try again later.'
    );
    expect(wrapper.text()).not.toContain('Cannot read db of undefined');
  });

  it('opens Settings from the user menu for a signed-in user', async () => {
    login();
    await mountErrorPage(404, '/typo');

    await clickUserMenuItem('Settings');

    await vi.waitFor(() =>
      expect(
        document.body.querySelector('[role="dialog"]')?.textContent
      ).toContain('Settings')
    );
  });
});
