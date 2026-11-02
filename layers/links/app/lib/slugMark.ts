const HUES: string[] = [
  'lime',
  'coral',
  'mint',
  'bone',
  'violet',
  'pink',
  'blue',
  'gold'
];

export interface SlugMark {
  hue: string;
  cells: [number, number][];
}

export const slugMark = (slug: string): SlugMark => {
  let hash = 0x811c9dc5;
  for (const char of slug.toLowerCase())
    hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0x5bd1e995);
  hash ^= hash >>> 15;
  hash >>>= 0;

  const bits = hash >>> 3;
  const cells: [number, number][] = [];
  for (let row = 0; row < 5; row++)
    for (let column = 0; column < 3; column++)
      // the centre cell is always on, so no mark comes out blank
      if ((bits >>> (row * 3 + column)) & 1 || (column === 2 && row === 2)) {
        cells.push([column, row]);
        if (column < 2) cells.push([4 - column, row]);
      }

  return { hue: `hue-${HUES[hash % HUES.length]}`, cells };
};

export const linkHueStyle = (slug: string) => ({
  '--link-hue': `var(--${slugMark(slug).hue})`
});
