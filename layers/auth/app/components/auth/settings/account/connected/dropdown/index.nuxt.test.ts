import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AuthSettingsAccountConnectedDropdown from './index.vue';

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const openMenu = async (accountProviders: string[]) => {
  mounted = await mountSuspended(AuthSettingsAccountConnectedDropdown, {
    props: { accountProviders },
    attachTo: document.body
  });

  const trigger = document.body.querySelector('[aria-haspopup="menu"]');
  if (!trigger) throw new Error('Missing Connect account trigger');
  await new DOMWrapper(trigger).trigger('keydown', { key: 'Enter' });

  return vi.waitFor(() => {
    const rows = [...document.body.querySelectorAll('[role="menuitem"]')];
    if (!rows.length) throw new Error('Missing Connect account rows');

    return rows.map((row) => row.textContent?.trim());
  });
};

afterEach(() => {
  mounted?.unmount();
  document.body.innerHTML = '';
});

describe('AuthSettingsAccountConnectedDropdown', () => {
  it('offers GitHub by name when it is not connected', async () => {
    expect(await openMenu(['google'])).toEqual(['GitHub']);
  });
});
