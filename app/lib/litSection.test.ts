import { describe, expect, it } from 'vitest';
import { litSection } from './litSection';

// the line 88px from the top, under the Header
const LINE = 88;

describe('litSection', () => {
  it('lights nothing before any heading reaches the line', () => {
    expect(
      litSection({ tops: [300, 900, 1500], line: LINE, atEnd: false })
    ).toBeNull();
  });

  it('lights the one heading that has passed the line', () => {
    expect(
      litSection({ tops: [40, 600, 1200], line: LINE, atEnd: false })
    ).toBe(0);
  });

  it('lights a heading sitting exactly on the line', () => {
    expect(
      litSection({ tops: [88, 600, 1200], line: LINE, atEnd: false })
    ).toBe(0);
  });

  it('lights the last of several passed headings', () => {
    expect(
      litSection({ tops: [-900, -300, 20, 700], line: LINE, atEnd: false })
    ).toBe(2);
  });

  it('lights the last section at the end of the page', () => {
    expect(
      litSection({ tops: [-900, -300, 200, 450], line: LINE, atEnd: true })
    ).toBe(3);
  });

  it('lights a pending jump over the end of the page', () => {
    // a jump to the second-last section, which can't reach the line
    expect(
      litSection({
        tops: [-900, -300, 200, 450],
        line: LINE,
        atEnd: true,
        jump: 2
      })
    ).toBe(2);
  });

  it('lights a pending jump over a later passed heading', () => {
    expect(
      litSection({
        tops: [-900, -300, 20, 700],
        line: LINE,
        atEnd: false,
        jump: 1
      })
    ).toBe(1);
  });

  it('applies the normal rule again once no jump is pending', () => {
    expect(
      litSection({
        tops: [-900, -300, 20, 700],
        line: LINE,
        atEnd: false,
        jump: undefined
      })
    ).toBe(2);
  });
});
