import { mountSuspended } from '@nuxt/test-utils/runtime';
import { DOMWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { makeLink } from '#layers/links/app/testing/fixtures';
import LinksCard from './Card.vue';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

const LINK = makeLink({ slug: 'repo', clicks: 3 });

const mountCard = async () => {
  const wrapper = await mountSuspended(LinksCard, {
    props: { link: LINK },
    attachTo: document.body
  });

  const openMenu = async () => {
    await wrapper
      .find('button[aria-label="Link actions"]')
      .trigger('keydown', { key: 'Enter' });
  };

  const clickMenuItem = async (label: string) => {
    await openMenu();

    const item = [...document.body.querySelectorAll('[role="menuitem"]')].find(
      (element) => element.textContent?.trim() === label
    );
    if (!item) throw new Error(`Missing menu item ${label}`);

    await new DOMWrapper(item).trigger('click');
  };

  return { wrapper, clickMenuItem };
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
  it('shows the short path, destination and clicks', async () => {
    const { wrapper } = await mountCard();

    expect(wrapper.text()).toContain('/repo');
    expect(wrapper.text()).toContain('https://example.com/repo');
    expect(wrapper.text()).toContain('3 clicks');
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

    expect(wrapper.emitted(label.toLowerCase())).toEqual([[LINK]]);
  });
});
