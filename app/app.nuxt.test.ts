import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  langMenuLink,
  langMenuRow,
  menuTooltip,
  openLangMenu,
  openMenu
} from '@/testing/headerMenu';
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

// a link in the page's text, past the switcher and the index
const mainLink = (label: string) =>
  [...(document.body.querySelector('main')?.querySelectorAll('a') ?? [])]
    .find(
      (element) =>
        !element.closest('nav') && element.textContent?.trim() === label
    )
    ?.getAttribute('href');

const landmarkName = (element: Element) =>
  element.getAttribute('aria-label') ??
  document
    .getElementById(element.getAttribute('aria-labelledby') ?? '')
    ?.textContent?.trim();

// a navigation landmark, found by its name like a screen reader
const navigation = (name: string) => {
  const index = [...document.body.querySelectorAll('nav')].find(
    (element) => landmarkName(element) === name
  );
  if (!index) throw new Error(`Missing navigation ${name}`);

  return index;
};

// the switcher's links as their label, where they go and whether it's the current page
const switcherLinks = (name: string) =>
  [...navigation(name).querySelectorAll('a')].map((link) => [
    link.textContent?.trim(),
    link.getAttribute('href'),
    link.getAttribute('aria-current')
  ]);

// each entry as its number, its title and where it links
const pageIndexEntries = (name: string) =>
  [...navigation(name).querySelectorAll('ol > li > a')].map((link) => [
    link.firstElementChild?.textContent?.trim(),
    link.lastChild?.textContent?.trim(),
    link.getAttribute('href')
  ]);

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
  useColorMode().preference = 'light';
  useState('auth:session').value = null;
  useState('auth:user').value = null;
});

const selectedThemeRows = () =>
  [
    ...document.body.querySelectorAll(
      '[role="menuitemradio"][aria-checked="true"]'
    )
  ].map((element) => element.textContent?.trim());

const themeRow = (label: string) => {
  const row = [
    ...document.body.querySelectorAll('[role="menuitemradio"]')
  ].find((element) => element.textContent?.trim() === label);
  if (!row) throw new Error(`Missing theme row ${label}`);

  return row;
};

describe('app header', () => {
  it('marks English as the current language at an unprefixed path', async () => {
    await mountApp('/');

    await openLangMenu('Toggle language');

    expect(langMenuRow('EN')?.getAttribute('aria-current')).toBe('true');
    expect(langMenuRow('ES')?.hasAttribute('aria-current')).toBe(false);
  });

  it('marks Spanish as the current language at a Spanish path', async () => {
    await mountApp('/es');

    await openLangMenu('Alternar idioma');

    expect(langMenuRow('ES')?.getAttribute('aria-current')).toBe('true');
    expect(langMenuRow('EN')?.hasAttribute('aria-current')).toBe(false);
  });

  it('shows the same words as the label in the language and theme Tooltips', async () => {
    await mountApp('/');
    expect(await menuTooltip('Toggle language')).toBe('Toggle language');
    mounted?.unmount();

    await mountApp('/es');
    expect(await menuTooltip('Alternar tema')).toBe('Alternar tema');
  });

  it('selects the chosen theme in the theme menu', async () => {
    const colorMode = useColorMode();
    await mountApp('/');

    await openMenu('Toggle theme');
    expect(selectedThemeRows()).toEqual(['Light']);

    await new DOMWrapper(themeRow('Dark')).trigger('click');
    expect(colorMode.preference).toBe('dark');

    await openMenu('Toggle theme');
    expect(selectedThemeRows()).toEqual(['Dark']);
  });

  it('names the User menu trigger in English and Spanish', async () => {
    useState('auth:session').value = { token: 'session-token' };
    useState('auth:user').value = { name: 'Ada Lovelace', image: null };

    await mountApp('/');
    expect(
      document.body.querySelector('button[aria-label="User menu"]')
    ).not.toBeNull();
    mounted?.unmount();

    await mountApp('/es');
    expect(
      document.body.querySelector('button[aria-label="Menú de usuario"]')
    ).not.toBeNull();
  });
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

describe('pixel field', () => {
  const fieldRoutes = ['/', '/es', '/login', '/es/login'];

  const field = () => document.body.querySelector('canvas');

  it.each(fieldRoutes)(
    'draws behind %s with no meaning for a screen reader',
    async (route) => {
      await mountApp(route);

      expect(field()?.getAttribute('aria-hidden')).toBe('true');
    }
  );

  it.each(['/privacy', '/es/privacidad'])('stays off %s', async (route) => {
    await mountApp(route);

    expect(field()).toBeNull();
  });

  const blurs = (selector: string) =>
    document.body
      .querySelector(selector)
      ?.classList.contains('backdrop-blur-md');

  it.each([...fieldRoutes, '/privacy'])(
    'keeps the field behind the header and footer backgrounds at %s',
    async (route) => {
      await mountApp(route);

      expect(blurs('header')).toBe(true);
      expect(blurs('footer')).toBe(true);
    }
  );
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
      '/ 01Who runs skuz.link'
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
    ).toBe('/ 01Quién gestiona skuz.link');
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

  it('indexes the Spanish sections under a Spanish name', async () => {
    await mountApp('/es/terminos');

    expect(pageIndexEntries('En esta página')).toEqual([
      [
        '01',
        'Qué es skuz.link y quién lo gestiona',
        '#que-es-skuz-link-y-quien-lo-gestiona'
      ],
      ['02', 'Aceptación de estos términos', '#aceptacion-de-estos-terminos'],
      ['03', 'Tu cuenta', '#tu-cuenta'],
      ['04', 'Tus enlaces', '#tus-enlaces'],
      ['05', 'Qué no está permitido', '#que-no-esta-permitido'],
      [
        '06',
        'Qué pasa si un enlace incumple estos términos',
        '#que-pasa-si-un-enlace-incumple-estos-terminos'
      ],
      ['07', 'Cómo denunciar un abuso', '#como-denunciar-un-abuso'],
      ['08', 'Cuánto duran los enlaces', '#cuanto-duran-los-enlaces'],
      ['09', 'Sin garantías', '#sin-garantias'],
      ['10', 'Cambios', '#cambios'],
      ['11', 'Ley y tribunales', '#ley-y-tribunales']
    ]);
  });

  it('titles an index entry the way its heading reads', async () => {
    await mountApp('/terms');

    const heading = document.getElementById('what-isn-t-allowed');

    expect(heading?.textContent).toBe('/ 05What isn’t allowed');
    expect(pageIndexEntries('On this page')[4]).toEqual([
      '05',
      'What isn’t allowed',
      '#what-isn-t-allowed'
    ]);
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
  it('labels a section with its number and keeps its anchor', async () => {
    await mountApp('/privacy');

    const section = document.getElementById('what-i-process-and-why');

    expect(section?.tagName).toBe('H2');
    expect(section?.textContent).toBe('/ 02What I process and why');
    expect(section?.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      '/'
    );
  });

  it('labels a Spanish section with its number and keeps its anchor', async () => {
    await mountApp('/es/privacidad');

    expect(
      document.getElementById('que-datos-trato-y-para-que')?.textContent
    ).toBe('/ 02Qué datos trato y para qué');
  });

  it('gives a subsection its anchor and no number', async () => {
    await mountApp('/privacy');

    const subsection = document.getElementById('anyone-who-opens-skuz-link');

    expect(subsection?.tagName).toBe('H3');
    expect(subsection?.textContent).toBe('Anyone who opens skuz.link');
  });

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

  it('indexes every numbered section on first render, with no subsection', async () => {
    await mountApp('/privacy');

    expect(pageIndexEntries('On this page')).toEqual([
      ['01', 'Who I am', '#who-i-am'],
      ['02', 'What I process and why', '#what-i-process-and-why'],
      ['03', 'Legal bases', '#legal-bases'],
      ['04', 'Cookies and browser storage', '#cookies-and-browser-storage'],
      ['05', 'Who else receives data', '#who-else-receives-data'],
      ['06', 'How long I keep it', '#how-long-i-keep-it'],
      ['07', 'Your rights', '#your-rights'],
      ['08', 'Minimum age', '#minimum-age'],
      ['09', 'Changes', '#changes']
    ]);
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

describe('legal documents switcher', () => {
  // each Legal document as its title and its path, in the footer's order
  type Documents = [title: string, path: string][];

  const english: Documents = [
    ['Legal notice', '/legal-notice'],
    ['Privacy policy', '/privacy'],
    ['Terms of use', '/terms']
  ];
  const spanish: Documents = [
    ['Aviso legal', '/es/aviso-legal'],
    ['Política de privacidad', '/es/privacidad'],
    ['Términos de uso', '/es/terminos']
  ];

  it.each([
    ...english.map(([open, route]) => ({
      route,
      name: 'Legal documents',
      documents: english,
      open
    })),
    ...spanish.map(([open, route]) => ({
      route,
      name: 'Documentos legales',
      documents: spanish,
      open
    }))
  ])(
    'links the three Legal documents and marks the open one at $route',
    async ({ route, name, documents, open }) => {
      await mountApp(route);

      expect(switcherLinks(name)).toEqual(
        documents.map(([title, path]) => [
          title,
          path,
          title === open ? 'page' : null
        ])
      );
    }
  );
});

describe('legal document index fold', () => {
  // the phone row: a disclosure whose summary reads as the index's name
  const indexFold = (name: string) =>
    [...navigation(name).querySelectorAll('details')].find(
      (element) =>
        element.querySelector('summary')?.textContent?.trim() === name
    );

  it.each([
    ['/privacy', 'On this page'],
    ['/es/privacidad', 'En esta página']
  ])(
    'folds the index of %s into a closed %s disclosure',
    async (route, name) => {
      await mountApp(route);

      const fold = indexFold(name);

      expect(fold).toBeDefined();
      expect(fold?.open).toBe(false);
    }
  );
});

describe('login page', () => {
  it.each([
    ['/login', ['Continue with Google', 'Continue with GitHub']],
    ['/es/login', ['Continuar con Google', 'Continuar con GitHub']]
  ])('offers both Providers by name at %s', async (route, labels) => {
    await mountApp(route);

    const buttons = [
      ...(document.body.querySelector('main')?.querySelectorAll('button') ?? [])
    ].map((button) => button.textContent?.trim());

    expect(buttons).toEqual(labels);
  });

  it('links the Terms of use and the Privacy policy under the Provider buttons at an unprefixed path', async () => {
    await mountApp('/login');

    expect(mainText()).toContain(
      "By continuing, you accept the Terms of use and confirm you've read the Privacy policy."
    );
    expect(mainLink('Terms of use')).toBe('/terms');
    expect(mainLink('Privacy policy')).toBe('/privacy');
  });

  it('links the Spanish Terms of use and Privacy policy under the Provider buttons at a Spanish path', async () => {
    await mountApp('/es/login');

    expect(mainText()).toContain(
      'Al continuar, aceptas los Términos de uso y confirmas que has leído la Política de privacidad.'
    );
    expect(mainLink('Términos de uso')).toBe('/es/terminos');
    expect(mainLink('Política de privacidad')).toBe('/es/privacidad');
  });
});
