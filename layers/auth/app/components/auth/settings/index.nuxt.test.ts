import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
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

let accounts: ReturnType<typeof account>[] = [];

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

const openSection = (title: string) =>
  new DOMWrapper(button(title)).trigger('click');

beforeEach(() => {
  // better-auth calls fetch on an absolute URL, which registerEndpoint misses
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const { pathname } = new URL(new Request(input, init).url);

    if (pathname === '/api/auth/list-sessions') {
      return Response.json([
        session(CURRENT_TOKEN, 'Macintosh; Intel Mac OS X 10_15_7'),
        session('other-token', 'iPhone; CPU iPhone OS 18_0 like Mac OS X')
      ]);
    }

    if (pathname === '/api/auth/list-accounts') {
      return Response.json(accounts);
    }

    return Response.json({});
  });
});

afterEach(() => {
  // unmount before wiping, or clearNuxtData re-renders a removed tree
  mounted?.unmount();
  vi.restoreAllMocks();
  clearNuxtData();
  accounts = [];
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

    await openSection('Sessions');

    const current = await row('Macintosh - Intel Mac OS X 10_15_7');
    const other = await row('iPhone - CPU iPhone OS 18_0 like Mac OS X');

    expect(current.textContent).toContain('Current');
    expect(other.textContent).not.toContain('Current');
  });

  it('disables Disconnect on the only Connected account', async () => {
    accounts = [account('google')];
    await mountSettings();

    await openSection('Connected accounts');

    const disconnect = (await row('Google')).querySelector('button');

    expect(disconnect?.textContent).toContain('Disconnect');
    expect(disconnect?.disabled).toBe(true);
  });

  it('allows Disconnect when another Connected account remains', async () => {
    accounts = [account('google'), account('github')];
    await mountSettings();

    await openSection('Connected accounts');

    expect((await row('Google')).querySelector('button')?.disabled).toBe(false);
    expect((await row('GitHub')).querySelector('button')?.disabled).toBe(false);
  });
});
