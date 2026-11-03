import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import Sonner from './Sonner.vue';

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const showToast = async (show: () => void) => {
  mounted = await mountSuspended(Sonner, { attachTo: document.body });

  show();

  return vi.waitFor(() => {
    const element = document.body.querySelector('[data-sonner-toast]');
    if (!element) throw new Error('Missing toast');

    return element;
  });
};

afterEach(() => {
  toast.dismiss();
  mounted?.unmount();
  document.body.innerHTML = '';
});

describe('Toaster', () => {
  it.each([
    ['success', 'text-success'],
    ['error', 'text-destructive']
  ] as const)('shows an %s LED in place of an icon', async (type, color) => {
    const element = await showToast(() => toast[type]('Link copied'));

    expect(element.querySelector(`[data-icon] .led.${color}`)).not.toBeNull();
    expect(element.querySelector('[data-icon] svg')).toBeNull();
  });

  it('keeps the title in words and the description in Geist Mono', async () => {
    const element = await showToast(() =>
      toast.success('Link copied', { description: 'https://skuz.link/github' })
    );

    expect(element.querySelector('[data-title]')?.textContent).toBe(
      'Link copied'
    );

    const description = element.querySelector('[data-description]');

    expect(description?.textContent).toBe('https://skuz.link/github');
    expect(description?.classList.contains('font-mono')).toBe(true);
  });

  it('sits on popover with a strong border', async () => {
    const element = await showToast(() => toast.success('Link copied'));

    expect(element.classList.contains('bg-popover')).toBe(true);
    expect(element.classList.contains('border-border-strong')).toBe(true);
  });
});
