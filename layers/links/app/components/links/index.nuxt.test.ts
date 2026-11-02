import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '#layers/base/app/components/ui/tooltip';
import type { Link } from '#layers/links/shared/domain/link.type';
import { makeLink } from '#layers/links/app/testing/fixtures';
import Links from './index.vue';

const getLinks = vi.fn((): Link[] => []);

registerEndpoint('/api/links', { method: 'GET', handler: getLinks });

const mounted: { unmount: () => void }[] = [];

const mountLinks = async () => {
  const wrapper = await mountSuspended(
    // the root layout provides this in the app
    { render: () => h(TooltipProvider, () => h(Links)) },
    { attachTo: document.body }
  );
  await flushPromises();
  mounted.push(wrapper);

  return wrapper;
};

const findDialog = () => document.body.querySelector('[role="dialog"]');

beforeEach(() => {
  vi.clearAllMocks();
  clearNuxtData('links');
  getLinks.mockReturnValue([]);
});

afterEach(() => {
  // clearing the Links would otherwise re-render a tree the next line removes
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = '';
});

describe('Links', () => {
  describe('with no Links', () => {
    it('shows the blank plate and the way forward, with no toolbar', async () => {
      const wrapper = await mountLinks();

      expect(wrapper.find('input[type="search"]').exists()).toBe(false);
      expect(wrapper.text()).toContain('skuz.link/');
      expect(wrapper.find('h1').text()).toBe('No links yet');
      expect(wrapper.text()).toContain(
        'Create your first link to start sharing.'
      );
      expect(wrapper.find('button').text()).toBe('Create link');
    });

    it('opens Create link from the plate, which takes no keyboard focus', async () => {
      const wrapper = await mountLinks();
      const plate = wrapper
        .findAll('span')
        .find((span) => span.text() === 'skuz.link/');
      if (!plate) throw new Error('Missing the blank plate');

      expect(plate.element.closest('button, a, input, [tabindex]')).toBeNull();
      expect(findDialog()).toBeNull();

      await plate.trigger('click');
      await flushPromises();

      expect(findDialog()?.textContent).toContain(
        'Choose a slug and the URL to redirect to.'
      );
    });

    it('opens Create link from the Button', async () => {
      const wrapper = await mountLinks();

      await wrapper.find('button').trigger('click');
      await flushPromises();

      expect(findDialog()?.textContent).toContain(
        'Choose a slug and the URL to redirect to.'
      );
    });
  });

  describe('with Links', () => {
    beforeEach(() => {
      getLinks.mockReturnValue([makeLink({ slug: 'repo' })]);
    });

    const liveRegion = (wrapper: Awaited<ReturnType<typeof mountLinks>>) =>
      wrapper.find('[aria-live="polite"]');

    it('shows the toolbar and an empty live region', async () => {
      const wrapper = await mountLinks();

      expect(wrapper.find('input[type="search"]').exists()).toBe(true);
      expect(wrapper.find('button').text()).toBe('Create link');
      expect(wrapper.text()).toContain('/repo');
      expect(liveRegion(wrapper).text()).toBe('');
    });

    it('keeps the toolbar and only announces a search that finds nothing', async () => {
      const wrapper = await mountLinks();

      await wrapper.find('input[type="search"]').setValue('nothing');

      expect(wrapper.find('input[type="search"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Create link');
      expect(wrapper.text()).not.toContain('/repo');
      expect(wrapper.text()).not.toContain('No links yet');
      expect(wrapper.text()).not.toContain('Try a different slug.');

      // the region holds the only copy of the message, and no sighted User sees it
      expect(liveRegion(wrapper).text()).toBe('No links found');
      expect(wrapper.text().match(/No links found/g)).toHaveLength(1);
    });

    it('clears the live region when the search finds Links again', async () => {
      const wrapper = await mountLinks();
      const search = wrapper.find('input[type="search"]');

      await search.setValue('nothing');
      await search.setValue('rep');

      expect(wrapper.text()).toContain('/repo');
      expect(liveRegion(wrapper).text()).toBe('');
    });
  });
});
