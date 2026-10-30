import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './app.vue';

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const mountApp = async (route: string) => {
  mounted = await mountSuspended(App, { route, attachTo: document.body });

  return mounted;
};

const footer = () => {
  const element = document.body.querySelector('footer');
  if (!element) throw new Error('Missing footer');

  return element;
};

const footerLink = (label: string) => {
  const link = [...footer().querySelectorAll('a')].find(
    (element) => element.textContent?.trim() === label
  );
  if (!link) throw new Error(`Missing footer link ${label}`);

  return link;
};

beforeEach(() => {
  // better-auth calls fetch on an absolute URL, which registerEndpoint misses
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json({})
  );
});

afterEach(() => {
  // unmount before clearing the body, or Vue patches the cleared body
  mounted?.unmount();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('app footer', () => {
  it('links Contact to the contact address and shows no images at an unprefixed path', async () => {
    await mountApp('/');

    expect(footerLink('Contact').getAttribute('href')).toBe(
      'mailto:contact@skuz.link'
    );
    expect(footer().querySelectorAll('img')).toHaveLength(0);
  });

  it('links Contact to the contact address and shows no images at a Spanish path', async () => {
    await mountApp('/es');

    expect(footerLink('Contactar').getAttribute('href')).toBe(
      'mailto:contact@skuz.link'
    );
    expect(footer().querySelectorAll('img')).toHaveLength(0);
  });
});
