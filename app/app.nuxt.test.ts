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

const mainLink = (label: string) =>
  [...(document.body.querySelector('main')?.querySelectorAll('a') ?? [])]
    .find((element) => element.textContent?.trim() === label)
    ?.getAttribute('href');

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
  it('links the Legal notice, the Privacy policy, the Terms of use and Contact and shows no images at an unprefixed path', async () => {
    await mountApp('/');

    expect(footerLink('Legal notice').getAttribute('href')).toBe(
      '/legal-notice'
    );
    expect(footerLink('Privacy').getAttribute('href')).toBe('/privacy');
    expect(footerLink('Terms').getAttribute('href')).toBe('/terms');
    expect(footerLink('Contact').getAttribute('href')).toBe(
      'mailto:contact@skuz.link'
    );
    expect(footer().querySelectorAll('img')).toHaveLength(0);
  });

  it('links the Spanish Legal notice, Privacy policy, Terms of use and Contact and shows no images at a Spanish path', async () => {
    await mountApp('/es');

    expect(footerLink('Aviso legal').getAttribute('href')).toBe(
      '/es/aviso-legal'
    );
    expect(footerLink('Privacidad').getAttribute('href')).toBe(
      '/es/privacidad'
    );
    expect(footerLink('Términos').getAttribute('href')).toBe('/es/terminos');
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

  it('links the Terms of use and the Privacy policy in the same locale', async () => {
    await mountApp('/legal-notice');
    expect(mainLink('Terms of use')).toBe('/terms');
    expect(mainLink('Privacy policy')).toBe('/privacy');
    mounted?.unmount();

    await mountApp('/es/aviso-legal');
    expect(mainLink('Términos de uso')).toBe('/es/terminos');
    expect(mainLink('Política de privacidad')).toBe('/es/privacidad');
  });
});

describe('terms of use', () => {
  it('shows the English Terms of use with the translation line at its English path', async () => {
    await mountApp('/terms');

    expect(headings()).toEqual(['Terms of use']);
    expect(mainText()).toContain('Last updated:');
    expect(mainText()).toContain('you must be at least 14');
    expect(mainText()).toContain(
      'This is a translation. If it differs from the Spanish version, the Spanish one prevails.'
    );
  });

  it('shows the Spanish Terms of use without the translation line at its Spanish path', async () => {
    await mountApp('/es/terminos');

    expect(headings()).toEqual(['Términos de uso']);
    expect(mainText()).toContain('Última actualización:');
    expect(mainText()).toContain('tener al menos 14 años');
    expect(mainText()).not.toContain('This is a translation.');
  });

  it('offers the Spanish path from the language menu at its English path', async () => {
    await mountApp('/terms');

    await openLangMenu('Toggle language');

    expect(langMenuLink('ES')).toBe('/es/terminos');
  });

  it('offers the English path from the language menu at its Spanish path', async () => {
    await mountApp('/es/terminos');

    await openLangMenu('Alternar idioma');

    expect(langMenuLink('EN')).toBe('/terms');
  });

  it('links the Legal notice and the Privacy policy in the same locale', async () => {
    await mountApp('/terms');
    expect(mainLink('Legal notice')).toBe('/legal-notice');
    expect(mainLink('Privacy policy')).toBe('/privacy');
    mounted?.unmount();

    await mountApp('/es/terminos');
    expect(mainLink('Aviso legal')).toBe('/es/aviso-legal');
    expect(mainLink('Política de privacidad')).toBe('/es/privacidad');
  });
});

describe('privacy policy', () => {
  it('shows the English Privacy policy with the translation line at its English path', async () => {
    await mountApp('/privacy');

    expect(headings()).toEqual(['Privacy policy']);
    expect(mainText()).toContain('Last updated:');
    expect(mainText()).toContain('I never sell your data');
    expect(mainText()).toContain(
      'This is a translation. If it differs from the Spanish version, the Spanish one prevails.'
    );
  });

  it('shows the Spanish Privacy policy without the translation line at its Spanish path', async () => {
    await mountApp('/es/privacidad');

    expect(headings()).toEqual(['Política de privacidad']);
    expect(mainText()).toContain('Última actualización:');
    expect(mainText()).toContain('Nunca vendo tus datos');
    expect(mainText()).not.toContain('This is a translation.');
  });

  it('offers the Spanish path from the language menu at its English path', async () => {
    await mountApp('/privacy');

    await openLangMenu('Toggle language');

    expect(langMenuLink('ES')).toBe('/es/privacidad');
  });

  it('offers the English path from the language menu at its Spanish path', async () => {
    await mountApp('/es/privacidad');

    await openLangMenu('Alternar idioma');

    expect(langMenuLink('EN')).toBe('/privacy');
  });

  it('links the Legal notice and the Terms of use in the same locale', async () => {
    await mountApp('/privacy');
    expect(mainLink('Legal notice')).toBe('/legal-notice');
    expect(mainLink('Terms of use')).toBe('/terms');
    mounted?.unmount();

    await mountApp('/es/privacidad');
    expect(mainLink('Aviso legal')).toBe('/es/aviso-legal');
    expect(mainLink('Términos de uso')).toBe('/es/terminos');
  });
});
