import { DOMWrapper } from '@vue/test-utils';

/**
 * Opens the header's language menu, found by its screen-reader label, the way
 * a keyboard user would.
 */
export const openLangMenu = async (label: string) => {
  const trigger = [
    ...document.body.querySelectorAll('[aria-haspopup="menu"]')
  ].find((element) => element.textContent?.includes(label));
  if (!trigger) throw new Error('Missing language menu');

  await new DOMWrapper(trigger).trigger('keydown', { key: 'Enter' });
};

/** The href the open language menu offers for a locale, titled by its code. */
export const langMenuLink = (title: string) =>
  document.body
    .querySelector(`[role="menuitem"][title="${title}"]`)
    ?.getAttribute('href');
