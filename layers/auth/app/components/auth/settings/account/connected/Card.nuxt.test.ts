import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import AuthSettingsAccountConnectedCard from './Card.vue';

const mountCard = (providerId: string) =>
  mountSuspended(AuthSettingsAccountConnectedCard, {
    props: {
      account: {
        id: 'account-1',
        accountId: 'provider-account-1',
        providerId,
        userId: 'user-1',
        createdAt: new Date('2026-11-02T12:00:00Z'),
        updatedAt: new Date('2026-11-02T12:00:00Z')
      },
      length: 2
    }
  });

describe('AuthSettingsAccountConnectedCard', () => {
  it.each([
    ['github', 'GitHub'],
    ['google', 'Google'],
    ['credential', 'Credentials']
  ])('names a %s account as %s', async (providerId, name) => {
    const wrapper = await mountCard(providerId);

    expect(wrapper.text()).toContain(name);
  });
});
