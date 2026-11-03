import { mountSuspended } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CheckIcon from '~icons/pixelarticons/check';
import CloseIcon from '~icons/pixelarticons/close';
import AlertProvider from './AlertProvider.vue';

const media = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@vueuse/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useMediaQuery: () => ref(media.isDesktop)
}));

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined;

const openAlert = async (danger = false) => {
  mounted = await mountSuspended(AlertProvider, { attachTo: document.body });

  const answer = useAlert().alert({
    title: 'Delete this?',
    description: 'For real?',
    confirm: 'Yes',
    cancel: 'No',
    danger
  });
  await vi.waitFor(() =>
    expect(document.body.textContent).toContain('Delete this?')
  );

  // wrapped, because returning the promise itself would wait for its answer
  return { answer };
};

const findButton = (name: string) => {
  const button = [...document.body.querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === name
  );
  if (!button) throw new Error(`Missing button ${name}`);

  return button;
};

const clickButton = (name: string) => findButton(name).click();

const iconPath = (icon: Component) => mount(icon).find('path').attributes('d');

const expectAnswerButtons = (danger: boolean) => {
  const cancel = findButton('No');
  const confirm = findButton('Yes');

  expect(cancel.querySelector('path')?.getAttribute('d')).toBe(
    iconPath(CloseIcon)
  );
  expect(confirm.querySelector('path')?.getAttribute('d')).toBe(
    iconPath(CheckIcon)
  );
  expect(confirm.classList.contains('bg-destructive')).toBe(danger);
  expect(confirm.classList.contains('bg-primary')).toBe(!danger);
};

afterEach(() => {
  // unmount before resetting state, or Vue patches the cleared body
  mounted?.unmount();
  document.body.innerHTML = '';
  media.isDesktop = false;
});

describe('AlertProvider on a small screen', () => {
  it('stays open on Escape until a button answers', async () => {
    const { answer } = await openAlert();

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
    const { answer } = await openAlert();

    clickButton('Yes');

    await expect(answer).resolves.toBe(true);
    expect(useAlert().isOpen.value).toBe(false);
  });

  it('draws a grab handle of three input pixels', async () => {
    await openAlert();

    const cells = document.body.querySelectorAll(
      '[data-slot="drawer-handle"] > i'
    );

    expect(cells).toHaveLength(3);
    cells.forEach((cell) =>
      expect(cell.classList.contains('bg-input')).toBe(true)
    );
  });

  it.each([true, false])(
    'gives its actions icons, with danger %s',
    async (danger) => {
      await openAlert(danger);

      expectAnswerButtons(danger);
    }
  );
});

describe('AlertProvider on a large screen', () => {
  it.each([true, false])(
    'gives its actions icons, with danger %s',
    async (danger) => {
      media.isDesktop = true;
      await openAlert(danger);

      expectAnswerButtons(danger);
    }
  );

  it('answers through its buttons', async () => {
    media.isDesktop = true;
    const { answer } = await openAlert();

    clickButton('Yes');

    await expect(answer).resolves.toBe(true);
    expect(useAlert().isOpen.value).toBe(false);
  });
});
