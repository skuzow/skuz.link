import { DOMWrapper } from '@vue/test-utils';
import { vi } from 'vitest';

const menuTrigger = (label: string) => {
  const trigger = document.body.querySelector(
    `[aria-haspopup="menu"][aria-label="${label}"]`
  );
  if (!trigger) throw new Error(`Missing menu ${label}`);

  return new DOMWrapper(trigger);
};

/** Opens a header menu, found by its trigger's aria-label, the way a keyboard user would. */
export const openMenu = (label: string) =>
  menuTrigger(label).trigger('keydown', { key: 'Enter' });

export const openLangMenu = openMenu;

/** The words of the Tooltip a header menu's trigger shows under the pointer. */
export const menuTooltip = async (label: string) => {
  await menuTrigger(label).trigger('pointermove', { pointerType: 'mouse' });

  return vi.waitFor(() => {
    const tooltip = document.body.querySelector('[role="tooltip"]');
    if (!tooltip) throw new Error(`Missing Tooltip of ${label}`);

    return tooltip.textContent;
  });
};

/** The link the open language menu offers for a locale, titled by its code. */
export const langMenuRow = (title: string) =>
  document.body.querySelector(`[role="menuitem"][title="${title}"]`);

/** The href the open language menu offers for a locale. */
export const langMenuLink = (title: string) =>
  langMenuRow(title)?.getAttribute('href');
