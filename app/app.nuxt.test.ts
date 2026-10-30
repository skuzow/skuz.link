import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { langMenuLink, openLangMenu } from '@/testing/langMenu';
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

const headings = () =>
  [...document.body.querySelectorAll('h1')].map((element) =>
    element.textContent?.trim()
  );

const mainText = () => document.body.querySelector('main')?.textContent ?? '';

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
  it('links the Legal notice and Contact and shows no images at an unprefixed path', async () => {
    await mountApp('/');

    expect(footerLink('Legal notice').getAttribute('href')).toBe(
      '/legal-notice'
    );
    expect(footerLink('Contact').getAttribute('href')).toBe(
      'mailto:contact@skuz.link'
    );
    expect(footer().querySelectorAll('img')).toHaveLength(0);
  });

  it('links the Spanish Legal notice and Contact and shows no images at a Spanish path', async () => {
    await mountApp('/es');

    expect(footerLink('Aviso legal').getAttribute('href')).toBe(
      '/es/aviso-legal'
    );
    expect(footerLink('Contactar').getAttribute('href')).toBe(
      'mailto:contact@skuz.link'
    );
    expect(footer().querySelectorAll('img')).toHaveLength(0);
  });
});

describe('legal notice', () => {
  it('shows the English Legal notice with the translation line at its English path', async () => {
    await mountApp('/legal-notice');

    expect(headings()).toEqual(['Legal notice']);
    expect(mainText()).toContain('Last updated:');
    expect(mainText()).toContain('a personal, non-commercial project');
    expect(mainText()).toContain(
      'This is a translation. If it differs from the Spanish version, the Spanish one prevails.'
    );
    expect(document.getElementById('who-runs-skuz-link')?.textContent).toBe(
      '1. Who runs skuz.link'
    );
  });

  it('shows the Spanish Legal notice without the translation line at its Spanish path', async () => {
    await mountApp('/es/aviso-legal');

    expect(headings()).toEqual(['Aviso legal']);
    expect(mainText()).toContain('Última actualización:');
    expect(mainText()).toContain('un proyecto personal y no comercial');
    expect(mainText()).not.toContain('This is a translation.');
    expect(
      document.getElementById('quien-gestiona-skuz-link')?.textContent
    ).toBe('1. Quién gestiona skuz.link');
  });

  it('offers the Spanish path from the language menu at its English path', async () => {
    await mountApp('/legal-notice');

    await openLangMenu('Toggle language');

    expect(langMenuLink('ES')).toBe('/es/aviso-legal');
  });

  it('offers the English path from the language menu at its Spanish path', async () => {
    await mountApp('/es/aviso-legal');

    await openLangMenu('Alternar idioma');

    expect(langMenuLink('EN')).toBe('/legal-notice');
  });
});
