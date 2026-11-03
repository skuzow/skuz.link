import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LinksSlugMark from './SlugMark.vue';

describe('LinksSlugMark', () => {
  it('stays hidden from assistive tech', async () => {
    const wrapper = await mountSuspended(LinksSlugMark, {
      props: { slug: 'github' }
    });

    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });
});
