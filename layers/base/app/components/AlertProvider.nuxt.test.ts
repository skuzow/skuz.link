import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlertProvider from './AlertProvider.vue';

vi.mock('@vueuse/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useMediaQuery: () => ref(false)
}));

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const openDrawer = async () => {
  mounted = await mountSuspended(AlertProvider, { attachTo: document.body });

  const answer = useAlert().alert({
    title: 'Delete this?',
    description: 'For real?',
    confirm: 'Yes',
    cancel: 'No'
  });
  await vi.waitFor(() =>
    expect(document.body.textContent).toContain('Delete this?')
  );

  // wrapped, because returning the promise itself would wait for its answer
  return { answer };
};

const clickButton = (name: string) => {
  const button = [...document.body.querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === name
  );
  if (!button) throw new Error(`Missing button ${name}`);

  button.click();
};

afterEach(() => {
  // unmount before resetting state, or Vue patches the cleared body
  mounted?.unmount();
  document.body.innerHTML = '';
});

describe('AlertProvider on a small screen', () => {
  it('stays open on Escape until a button answers', async () => {
    const { answer } = await openDrawer();

    (document.activeElement ?? document.body).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await nextTick();

    expect(useAlert().isOpen.value).toBe(true);

    clickButton('No');

    await expect(answer).resolves.toBe(false);
    expect(useAlert().isOpen.value).toBe(false);
  });

  it('answers true from its confirm button', async () => {
    const { answer } = await openDrawer();

    clickButton('Yes');

    await expect(answer).resolves.toBe(true);
    expect(useAlert().isOpen.value).toBe(false);
  });
});
