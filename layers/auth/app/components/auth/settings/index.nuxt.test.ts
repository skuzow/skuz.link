import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthSettings from './index.vue';

const CURRENT_TOKEN = 'current-token';

const session = (token: string, device: string) => ({
  id: token,
  token,
  userId: 'user-1',
  userAgent: `Mozilla/5.0 (${device}) AppleWebKit/605.1.15`,
  expiresAt: '2026-11-08T12:00:00.000Z',
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z'
});

const account = (providerId: string) => ({
  id: `account-${providerId}`,
  accountId: `provider-${providerId}`,
  providerId,
  userId: 'user-1',
  scopes: [],
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z'
});

let sessions: ReturnType<typeof session>[] = [];

let accounts: ReturnType<typeof account>[] = [];

// while set, the Sessions list doesn't answer until it settles
let sessionsHeld: Promise<void> | undefined;

let sessionsRequests = 0;

// while set, the Connected accounts list doesn't answer until it settles
let accountsHeld: Promise<void> | undefined;

// how a list fails: its request throws, or better-auth answers with an error
type Failure = 'request' | 'answer' | undefined;

let sessionsFailure: Failure;

let accountsFailure: Failure;

const failedAnswer = (failure: Failure) => {
  if (failure === 'request') throw new TypeError('Failed to fetch');

  return Response.json(
    { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' },
    { status: 500 }
  );
};

// a promise to hold a list with, and the function that settles it
const hold = () => {
  let settle = () => {};
  const held = new Promise<void>((resolve) => (settle = resolve));

  return { held, settle };
};

let updatedNames: string[] = [];

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const mountSettings = async (route = '/') => {
  useState('auth:session').value = { token: CURRENT_TOKEN };
  useState('auth:user').value = { name: 'Ada Lovelace', image: null };
  useState('settings:isOpen').value = true;

  mounted = await mountSuspended(AuthSettings, {
    route,
    attachTo: document.body
  });
};

const button = (name: string) => {
  const found = [...document.body.querySelectorAll('button')].find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name
  );
  if (!found) throw new Error(`Missing button ${name}`);

  return found;
};

const row = (text: string) =>
  vi.waitFor(() => {
    const found = [...document.body.querySelectorAll('li')].find((element) =>
      element.textContent?.includes(text)
    );
    if (!found) throw new Error(`Missing row ${text}`);

    return found;
  });

const panelHeading = (section: HTMLElement) =>
  document.getElementById(section.getAttribute('aria-labelledby') ?? '');

// a panel is a section named by its heading
const panel = (name: string) =>
  vi.waitFor(() => {
    const found = [...document.body.querySelectorAll('section')].find(
      (section) => panelHeading(section)?.textContent?.trim() === name
    );
    if (!found) throw new Error(`Missing panel ${name}`);

    return found;
  });

// what the panel's strip reads after its heading
const panelCount = (section: HTMLElement) =>
  panelHeading(section)?.nextElementSibling?.textContent?.trim();

const panelWithRows = async (name: string, rows: number) => {
  const found = await panel(name);

  await vi.waitFor(() => {
    if (found.querySelectorAll('li').length !== rows) {
      throw new Error(`${name} doesn't have ${rows} rows`);
    }
  });

  return found;
};

// the field its Name label points at
const nameField = (section: HTMLElement) =>
  vi.waitFor(() => {
    const label = [...section.querySelectorAll('label')].find(
      (element) => element.textContent?.trim() === 'Name'
    );
    const found = label && document.getElementById(label.htmlFor);
    if (!(found instanceof HTMLInputElement)) {
      throw new Error('Missing Name field');
    }

    return found;
  });

// longer than the 5ms vee-validate debounces its validation by
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(() => {
  accounts = [];
  sessionsHeld = undefined;
  sessionsRequests = 0;
  accountsHeld = undefined;
  sessionsFailure = undefined;
  accountsFailure = undefined;
  updatedNames = [];
  sessions = [
    session(CURRENT_TOKEN, 'Macintosh; Intel Mac OS X 10_15_7'),
    session('other-token', 'iPhone; CPU iPhone OS 18_0 like Mac OS X')
  ];

  // better-auth calls fetch on an absolute URL, which registerEndpoint misses
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const { pathname } = new URL(new Request(input, init).url);

    if (pathname === '/api/auth/list-sessions') {
      sessionsRequests++;
      await sessionsHeld;

      return sessionsFailure
        ? failedAnswer(sessionsFailure)
        : Response.json(sessions);
    }

    if (pathname === '/api/auth/revoke-session') {
      const { token } = JSON.parse(String(init?.body));
      sessions = sessions.filter((listed) => listed.token !== token);

      return Response.json({ status: true });
    }

    if (pathname === '/api/auth/update-user') {
      updatedNames.push(JSON.parse(String(init?.body)).name);

      return Response.json({ status: true });
    }

    if (pathname === '/api/auth/list-accounts') {
      await accountsHeld;

      return accountsFailure
        ? failedAnswer(accountsFailure)
        : Response.json(accounts);
    }

    if (pathname === '/api/auth/unlink-account') {
      const { accountId } = JSON.parse(String(init?.body));
      accounts = accounts.filter((listed) => listed.id !== accountId);

      return Response.json({ status: true });
    }

    return Response.json({});
  });
});

afterEach(() => {
  // unmount before wiping, or clearNuxtData re-renders a removed tree
  mounted?.unmount();
  vi.restoreAllMocks();
  clearNuxtData();
  useState('auth:session').value = null;
  useState('auth:user').value = null;
  useState('settings:isOpen').value = false;
  document.body.innerHTML = '';
});

describe('AuthSettings', () => {
  it('labels its Close button in the page language', async () => {
    await mountSettings('/es');

    expect(button('Cerrar')).toBeTruthy();
  });

  it('marks only the current Session as Current, with its User-Agent text', async () => {
    await mountSettings();

    const current = await row('Macintosh - Intel Mac OS X 10_15_7');
    const other = await row('iPhone - CPU iPhone OS 18_0 like Mac OS X');

    expect(current.textContent).toContain('Current');
    expect(other.textContent).not.toContain('Current');
  });

  it('disables Disconnect on the only Connected account', async () => {
    accounts = [account('google')];
    await mountSettings();

    const disconnect = (await row('Google')).querySelector('button');

    expect(disconnect?.textContent).toContain('Disconnect');
    expect(disconnect?.disabled).toBe(true);
  });

  it('allows Disconnect when another Connected account remains', async () => {
    accounts = [account('google'), account('github')];
    await mountSettings();

    expect((await row('Google')).querySelector('button')?.disabled).toBe(false);
    expect((await row('GitHub')).querySelector('button')?.disabled).toBe(false);
  });

  it('counts the Sessions in their strip, and again after Revoke', async () => {
    await mountSettings();

    const sessionsPanel = await panelWithRows('Sessions', 2);

    expect(panelCount(sessionsPanel)).toBe('2');

    const other = await row('iPhone - CPU iPhone OS 18_0 like Mac OS X');
    other.querySelector('button')?.click();

    await panelWithRows('Sessions', 1);
    expect(panelCount(sessionsPanel)).toBe('1');
  });

  it('counts the Connected accounts in their strip, and again after Disconnect', async () => {
    accounts = [account('google'), account('github')];
    await mountSettings();

    const accountsPanel = await panelWithRows('Connected accounts', 2);

    expect(panelCount(accountsPanel)).toBe('2');

    (await row('GitHub')).querySelector('button')?.click();

    await panelWithRows('Connected accounts', 1);
    expect(panelCount(accountsPanel)).toBe('1');
  });

  it('offers Connect account while a Provider is left to connect', async () => {
    accounts = [account('google')];
    await mountSettings();

    const accountsPanel = await panelWithRows('Connected accounts', 1);

    expect(accountsPanel.textContent).toContain('Connect account');
  });

  it('offers no Connect account once Google and GitHub are both connected', async () => {
    accounts = [account('google'), account('github')];
    await mountSettings();

    const accountsPanel = await panelWithRows('Connected accounts', 2);

    expect(accountsPanel.textContent).not.toContain('Connect account');
  });

  it('keeps the Sessions and their count while they reload after Revoke', async () => {
    await mountSettings();

    const sessionsPanel = await panelWithRows('Sessions', 2);

    let settle = () => {};
    sessionsHeld = new Promise((resolve) => (settle = resolve));

    (await row('iPhone - CPU iPhone OS 18_0 like Mac OS X'))
      .querySelector('button')
      ?.click();

    await vi.waitFor(() => {
      if (sessionsRequests !== 2) throw new Error('Sessions not reloading');
    });

    expect(sessionsPanel.querySelectorAll('li')).toHaveLength(2);
    expect(panelCount(sessionsPanel)).toBe('2');

    settle();

    await panelWithRows('Sessions', 1);
    expect(panelCount(sessionsPanel)).toBe('1');
  });

  it('swaps the Profile body for the Name form, without the Avatar, with focus in Name', async () => {
    await mountSettings();

    const profilePanel = await panel('Profile');

    // the Avatar's fallback shows the User's initials
    await vi.waitFor(() => expect(profilePanel.textContent).toContain('AD'));

    button('Update profile').click();

    const name = await nameField(profilePanel);

    expect(profilePanel.textContent).not.toContain('AD');
    expect(profilePanel.textContent).not.toContain('Update profile');
    expect(profilePanel.textContent).toContain('Cancel');
    expect(profilePanel.textContent).toContain('Save changes');
    await vi.waitFor(() => expect(document.activeElement).toBe(name));
  });

  it('brings the Profile body back after Cancel, with focus on Update profile', async () => {
    await mountSettings();

    const profilePanel = await panel('Profile');

    button('Update profile').click();
    await nameField(profilePanel);

    button('Cancel').click();

    await vi.waitFor(() =>
      expect(document.activeElement).toBe(button('Update profile'))
    );
    expect(profilePanel.textContent).toContain('AD');
    expect(profilePanel.textContent).not.toContain('Save changes');
  });

  it('shows no Name error when focus leaves the empty field, as on pressing Cancel', async () => {
    await mountSettings();

    const profilePanel = await panel('Profile');

    button('Update profile').click();
    const name = await nameField(profilePanel);

    // pressing Cancel takes focus off Name before its click lands
    await vi.waitFor(() => expect(document.activeElement).toBe(name));
    button('Cancel').focus();

    await settle();

    expect(profilePanel.textContent).not.toContain('Name is required');
    expect(name.getAttribute('aria-invalid')).toBe('false');
  });

  it('still says Name is required when Save changes is pressed with it empty', async () => {
    await mountSettings();

    const profilePanel = await panel('Profile');

    button('Update profile').click();
    const name = await nameField(profilePanel);

    button('Save changes').click();

    await vi.waitFor(() =>
      expect(profilePanel.textContent).toContain('Name is required')
    );
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(updatedNames).toEqual([]);
  });

  it('brings the Profile body back after a successful save, with focus on Update profile', async () => {
    await mountSettings();

    const profilePanel = await panel('Profile');

    button('Update profile').click();
    const name = await nameField(profilePanel);

    name.value = 'Grace Hopper';
    name.dispatchEvent(new Event('input'));
    button('Save changes').click();

    await vi.waitFor(() =>
      expect(document.activeElement).toBe(button('Update profile'))
    );
    expect(updatedNames).toEqual(['Grace Hopper']);
    expect(profilePanel.textContent).not.toContain('Save changes');
  });

  it('marks loading panels busy, with no count and no Connect account', async () => {
    accounts = [account('google')];
    const sessionsLoad = hold();
    const accountsLoad = hold();
    sessionsHeld = sessionsLoad.held;
    accountsHeld = accountsLoad.held;
    await mountSettings();

    const sessionsPanel = await panel('Sessions');
    const accountsPanel = await panel('Connected accounts');

    for (const loading of [sessionsPanel, accountsPanel]) {
      expect(loading.querySelector('[aria-busy="true"]')).toBeTruthy();
      expect(panelCount(loading)).toBeUndefined();
    }
    expect(accountsPanel.textContent).not.toContain('Connect account');

    sessionsLoad.settle();
    accountsLoad.settle();

    await panelWithRows('Sessions', 2);
    await panelWithRows('Connected accounts', 1);
    expect(sessionsPanel.querySelector('[aria-busy="true"]')).toBeNull();
    expect(accountsPanel.querySelector('[aria-busy="true"]')).toBeNull();
    expect(accountsPanel.textContent).toContain('Connect account');
  });

  it.each([
    ['its request fails', 'request'],
    ['better-auth answers with an error', 'answer']
  ] as const)(
    'says a list failed when %s, with Try again, no count and no Connect account',
    async (_, failure) => {
      accounts = [account('google')];
      sessionsFailure = failure;
      accountsFailure = failure;
      await mountSettings();

      const sessionsPanel = await panel('Sessions');
      const accountsPanel = await panel('Connected accounts');

      await vi.waitFor(() => {
        expect(sessionsPanel.textContent).toContain(
          'Something went wrong with your sessions'
        );
        expect(accountsPanel.textContent).toContain(
          'Something went wrong with your connected accounts'
        );
      });

      for (const failedPanel of [sessionsPanel, accountsPanel]) {
        expect(failedPanel.textContent).toContain('Try again');
        expect(failedPanel.querySelector('[aria-busy="true"]')).toBeNull();
        expect(panelCount(failedPanel)).toBeUndefined();
      }
      expect(accountsPanel.textContent).not.toContain('Connect account');
    }
  );

  it('says a failed list in the page language', async () => {
    sessionsFailure = 'request';
    accountsFailure = 'request';
    await mountSettings('/es');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain(
        'Ha ocurrido un error con tus sesiones'
      );
      expect(document.body.textContent).toContain(
        'Ha ocurrido un error con tus cuentas conectadas'
      );
    });
    expect(button('Reintentar')).toBeTruthy();
  });

  it('requests a failed list again on Try again, and its rows replace the sentence', async () => {
    sessionsFailure = 'request';
    await mountSettings();

    const sessionsPanel = await panel('Sessions');
    const tryAgain = await vi.waitFor(() => button('Try again'));

    sessionsFailure = undefined;
    const sessionsLoad = hold();
    sessionsHeld = sessionsLoad.held;

    tryAgain.click();

    // Try again shows its loader while the sentence stays
    await vi.waitFor(() => {
      if (sessionsRequests !== 2) throw new Error('Sessions not reloading');
      expect(tryAgain.getAttribute('aria-busy')).toBe('true');
    });
    expect(sessionsPanel.textContent).toContain(
      'Something went wrong with your sessions'
    );

    sessionsLoad.settle();

    await panelWithRows('Sessions', 2);
    expect(sessionsPanel.textContent).not.toContain('Something went wrong');
    expect(sessionsPanel.textContent).not.toContain('Try again');
    expect(panelCount(sessionsPanel)).toBe('2');
  });
});
