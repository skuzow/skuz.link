export interface LitSectionInput {
  // each section heading's top relative to the viewport, in document order
  tops: number[];
  // the reading line, in px from the top of the viewport
  line: number;
  // whether the page is scrolled to its end
  atEnd: boolean;
  // the index of the section a click or a #section link on load jumped to,
  // until the reader scrolls
  jump?: number;
}

// the index of the section the reader is in, or null for none
export const litSection = ({
  tops,
  line,
  atEnd,
  jump
}: LitSectionInput): number | null => {
  // the chosen entry, even when the page can't scroll its heading to the line
  if (jump !== undefined) return jump;

  // short final sections never reach the line
  if (atEnd && tops.length) return tops.length - 1;

  const passed = tops.findLastIndex((top) => top <= line);

  return passed === -1 ? null : passed;
};
