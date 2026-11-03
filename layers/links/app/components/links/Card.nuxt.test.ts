import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { TooltipProvider } from '#layers/base/app/components/ui/tooltip';
import { makeLink } from '#layers/links/app/testing/fixtures';
import LinksCard from './Card.vue';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

const LINK = makeLink({
  slug: 'repo',
  clicks: 1204,
  // midday, so the date holds in whatever time zone the tests run
  createdAt: new Date('2026-10-02T12:00:00.000Z')
});

const mountCard = async () => {
  const wrapper = await mountSuspended(
    // the root layout provides this in the app
    { render: () => h(TooltipProvider, () => h(LinksCard, { link: LINK })) },
    { attachTo: document.body }
  );

  const openMenu = async () => {
    await wrapper
      .find('button[aria-label="Link actions"]')
      .trigger('keydown', { key: 'Enter' });
  };

  const menuItems = () => [
    ...document.body.querySelectorAll('[role="menuitem"]')
  ];

  const clickMenuItem = async (label: string) => {
    await openMenu();

    const item = menuItems().find(
      (element) => element.textContent?.trim() === label
    );
    if (!item) throw new Error(`Missing menu item ${label}`);

    await new DOMWrapper(item).trigger('click');
  };

  return { wrapper, openMenu, menuItems, clickMenuItem };
};

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();

  writeText = vi.fn(() => Promise.resolve());
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('LinksCard', () => {
  it('shows the slug, redirect URL, clicks and creation date', async () => {
    const { wrapper } = await mountCard();

    expect(wrapper.find('h3').text()).toBe('/repo');
    expect(wrapper.text()).toContain('https://example.com/repo');
    expect(wrapper.text()).toContain('Clicks');
    expect(wrapper.text()).toContain('1,204');
    expect(wrapper.text()).toContain('Created');
    expect(wrapper.find('time').text()).toBe('Oct 2, 2026');
  });

  it('carries the same hue on the card and its open menu', async () => {
    const { wrapper, openMenu } = await mountCard();

    await openMenu();

    const card = wrapper.find<HTMLElement>('[data-slot="card"]').element;
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]');

    expect(card.style.getPropertyValue('--link-hue')).toBe('var(--hue-gold)');
    expect(menu?.style.getPropertyValue('--link-hue')).toBe('var(--hue-gold)');
  });

  it('lists Copy first and Delete last in the menu', async () => {
    const { openMenu, menuItems } = await mountCard();

    await openMenu();

    expect(menuItems().map((item) => item.textContent?.trim())).toEqual([
      'Copy',
      'Edit',
      'Delete'
    ]);
  });

  it('copies the full short url', async () => {
    const { clickMenuItem } = await mountCard();

    await clickMenuItem('Copy');

    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Link copied', {
        description: `${useRequestURL().origin}/repo`
      })
    );
    expect(writeText).toHaveBeenCalledWith(`${useRequestURL().origin}/repo`);
  });

  it('shows an error when the clipboard rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { clickMenuItem } = await mountCard();

    await clickMenuItem('Copy');

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      )
    );
  });

  it.each(['Edit', 'Delete'])('emits %s with the link', async (label) => {
    const { wrapper, clickMenuItem } = await mountCard();

    await clickMenuItem(label);

    expect(
      wrapper.findComponent(LinksCard).emitted(label.toLowerCase())
    ).toEqual([[LINK]]);
  });
});
