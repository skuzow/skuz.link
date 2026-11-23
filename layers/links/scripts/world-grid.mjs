// Builds the dot grid that the Statistics map draws, from Natural Earth 110m
// (the world-atlas package), and writes it to app/constants/world-grid.constant.ts.
// Run it by hand with `pnpm links:world-grid` and commit both files: the app's
// build never runs it, and nothing it imports ships.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoBounds, geoCentroid, geoContains } from 'd3-geo';
import countries from 'i18n-iso-countries';
import { format, resolveConfig } from 'prettier';
import { feature } from 'topojson-client';

const OUTPUT = fileURLToPath(
  new URL('../app/constants/world-grid.constant.ts', import.meta.url)
);

// 144 × 56 cells of 2.5°, from 84°N to 56°S: Antarctica falls below the grid
const STEP = 2.5;
const TOP = 84;
const LEFT = -180;
const COLS = 144;
const ROWS = 56;

// Cloudflare can send these codes, but nobody lives there, so they get no dot
const NO_DOT = {
  AQ: 'Antarctica',
  BV: 'Bouvet Island',
  GS: 'South Georgia and the South Sandwich Islands',
  HM: 'Heard Island and McDonald Islands',
  UM: 'United States Minor Outlying Islands'
};

// 110m shapes with no ISO numeric id
const UNCODED = {
  Kosovo: 'XK', // as Cloudflare reports it
  'N. Cyprus': 'CY',
  Somaliland: 'SO'
};

// 110m draws these parts inside another country's shape, but Cloudflare
// reports them under their own codes
const PARTS = {
  FR: ([lon]) => (lon < -30 ? 'GF' : 'FR'), // French Guiana
  NO: ([, lat]) => (lat > 74 ? 'SJ' : 'NO') // Svalbard
};

// [longitude, latitude] of places that 110m leaves out
const PLACES = {
  AD: [1.52, 42.51],
  AG: [-61.85, 17.12],
  AI: [-63.06, 18.22],
  AS: [-170.7, -14.28],
  AW: [-69.97, 12.52],
  AX: [19.94, 60.1],
  BB: [-59.61, 13.1],
  BH: [50.55, 26.07],
  BL: [-62.83, 17.9],
  BM: [-64.78, 32.3],
  BQ: [-68.27, 12.15],
  CC: [96.83, -12.19],
  CK: [-159.78, -21.23],
  CV: [-23.51, 14.93],
  CW: [-68.98, 12.17],
  CX: [105.62, -10.49],
  DM: [-61.39, 15.3],
  FM: [158.16, 6.92],
  FO: [-6.77, 62.01],
  GD: [-61.75, 12.06],
  GG: [-2.54, 49.45],
  GI: [-5.35, 36.14],
  GP: [-61.58, 16.25],
  GU: [144.79, 13.44],
  HK: [114.17, 22.32],
  IM: [-4.55, 54.24],
  IO: [72.41, -7.31],
  JE: [-2.13, 49.21],
  KI: [173.03, 1.45],
  KM: [43.26, -11.7],
  KN: [-62.72, 17.3],
  KY: [-81.38, 19.3],
  LC: [-60.98, 13.91],
  LI: [9.55, 47.14],
  MC: [7.42, 43.73],
  MF: [-63.08, 18.07],
  MH: [171.38, 7.09],
  MO: [113.55, 22.2],
  MP: [145.75, 15.18],
  MQ: [-61.02, 14.64],
  MS: [-62.19, 16.74],
  MT: [14.51, 35.9],
  MU: [57.5, -20.16],
  MV: [73.51, 4.18],
  NF: [167.95, -29.04],
  NR: [166.93, -0.53],
  NU: [-169.87, -19.05],
  PF: [-149.57, -17.54],
  PM: [-56.18, 46.78],
  PN: [-130.1, -25.07],
  PW: [134.62, 7.5],
  RE: [55.54, -21.12],
  SC: [55.45, -4.62],
  SG: [103.82, 1.35],
  SH: [-5.71, -15.97],
  SM: [12.46, 43.94],
  ST: [6.73, 0.34],
  SX: [-63.05, 18.04],
  TC: [-71.8, 21.69],
  TK: [-171.85, -9.2],
  TO: [-175.2, -21.14],
  TV: [179.2, -8.52],
  VA: [12.45, 41.9],
  VC: [-61.23, 13.16],
  VG: [-64.62, 18.43],
  VI: [-64.93, 18.34],
  WF: [-176.17, -13.28],
  WS: [-171.76, -13.83],
  YT: [45.23, -12.78]
};

// a dot pushed out of a crowded cell moves at most this many cells
const MAX_NUDGE = 4;

const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const cellCentre = (row, col) => [
  LEFT + (col + 0.5) * STEP,
  TOP - (row + 0.5) * STEP
];

const cellUnder = ([lon, lat]) => [
  Math.floor((TOP - lat) / STEP),
  ((Math.floor((lon - LEFT) / STEP) % COLS) + COLS) % COLS
];

const inBounds = ([[west, south], [east, north]], [lon, lat]) =>
  lat >= south &&
  lat <= north &&
  // a shape that crosses the antimeridian has its west edge east of its east edge
  (west <= east ? lon >= west && lon <= east : lon >= west || lon <= east);

// one entry per polygon, each under the code Cloudflare reports for it
async function readShapes() {
  const topology = JSON.parse(
    await readFile(
      fileURLToPath(import.meta.resolve('world-atlas/countries-110m.json')),
      'utf8'
    )
  );
  const { features } = feature(topology, topology.objects.countries);
  const shapes = [];

  for (const country of features) {
    const name = country.properties.name;
    const code = country.id
      ? countries.numericToAlpha2(country.id)
      : UNCODED[name];
    if (!code) throw new Error(`No country code for ${name} in 110m`);
    if (code in NO_DOT) continue;

    const polygons =
      country.geometry.type === 'MultiPolygon'
        ? country.geometry.coordinates
        : [country.geometry.coordinates];

    for (const coordinates of polygons) {
      const polygon = { type: 'Polygon', coordinates };
      const part = PARTS[code]?.(geoCentroid(polygon)) ?? code;
      shapes.push({ code: part, polygon, bounds: geoBounds(polygon) });
    }
  }

  return shapes.sort((a, b) => byCode(a.code, b.code));
}

function buildCells(shapes) {
  const cells = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++) {
      const centre = cellCentre(row, col);
      const shape = shapes.find(
        ({ polygon, bounds }) =>
          inBounds(bounds, centre) && geoContains(polygon, centre)
      );
      if (shape) cells[row][col] = shape.code;
    }

  return cells;
}

const countCells = (cells) => {
  const counts = new Map();
  for (const code of cells.flat())
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  return counts;
};

// a point takes the cell under it, or the nearest free one when another
// point holds it, so that every point keeps a dot of its own
function placePoints(cells, points) {
  const counts = countCells(cells);
  const taken = new Set();

  for (const [code, point] of points) {
    const [row, col] = cellUnder(point);
    const candidates = [];

    for (let dr = -MAX_NUDGE; dr <= MAX_NUDGE; dr++)
      for (let dc = -MAX_NUDGE; dc <= MAX_NUDGE; dc++) {
        const r = row + dr;
        const c = (col + dc + COLS) % COLS;
        if (r < 0 || r >= ROWS || taken.has(`${r},${c}`)) continue;

        // never take the last cell of a country
        const owner = cells[r][c];
        if (owner && counts.get(owner) === 1) continue;

        candidates.push({ r, c, owner, distance: dr * dr + dc * dc });
      }

    // nearest first; at the same distance, sea before land, then top-left first
    candidates.sort(
      (a, b) =>
        a.distance - b.distance ||
        Number(Boolean(a.owner)) - Number(Boolean(b.owner)) ||
        a.r - b.r ||
        a.c - b.c
    );

    const cell = candidates[0];
    if (!cell) throw new Error(`No free cell near ${code}`);

    if (cell.owner) counts.set(cell.owner, counts.get(cell.owner) - 1);
    cells[cell.r][cell.c] = code;
    taken.add(`${cell.r},${cell.c}`);
  }
}

// a country too small to hold a cell centre gets the cell under its centroid
function smallCountryPoints(cells, shapes) {
  const counts = countCells(cells);
  const codes = [...new Set(shapes.map(({ code }) => code))].filter(
    (code) => !counts.has(code)
  );

  return codes.map((code) => [
    code,
    geoCentroid({
      type: 'GeometryCollection',
      geometries: shapes
        .filter((shape) => shape.code === code)
        .map(({ polygon }) => polygon)
    })
  ]);
}

// fails when 110m already draws a place, so that it never gets a second dot
function checkPlacesAreMissing(shapes) {
  const drawn = Object.keys(PLACES).filter((code) =>
    shapes.some((shape) => shape.code === code)
  );

  if (drawn.length)
    throw new Error(`110m draws ${drawn.join(', ')}, so drop them from PLACES`);
}

// fails, naming them, when a code that Cloudflare can send has no dot
function checkEveryCode(cells) {
  const placed = countCells(cells);
  const missing = Object.keys(countries.getAlpha2Codes())
    .filter((code) => !placed.has(code) && !(code in NO_DOT))
    .sort(byCode);

  if (missing.length)
    throw new Error(
      `No dot for ${missing.join(', ')}. Add them to PLACES, or to NO_DOT if nobody lives there.`
    );
}

// rows of base-36 `value.run` tokens, where 0 is sea and n is codes[n - 1]
function encode(cells) {
  const codes = [...countCells(cells).keys()].sort(byCode);
  const values = new Map(codes.map((code, index) => [code, index + 1]));

  const grid = cells.map((row) => {
    const runs = [];
    for (const code of row) {
      const value = code ? values.get(code) : 0;
      const last = runs.at(-1);
      if (last?.value === value) last.length++;
      else runs.push({ value, length: 1 });
    }
    return runs
      .map(({ value, length }) =>
        length > 1
          ? `${value.toString(36)}.${length.toString(36)}`
          : value.toString(36)
      )
      .join(',');
  });

  return { codes, grid };
}

async function writeModule({ codes, grid }) {
  const source = `// Generated by layers/links/scripts/world-grid.mjs from Natural Earth 110m.
// Rebuild it with \`pnpm links:world-grid\`, never by hand.

export interface WorldGrid {
  /** degrees per cell */
  step: number;
  /** latitude of the top edge */
  top: number;
  /** longitude of the left edge */
  left: number;
  cols: number;
  rows: number;
  /** ISO 3166-1 alpha-2 codes, as Cloudflare reports them */
  codes: string[];
  /**
   * One string per row, top to bottom: comma-separated runs from the left,
   * each a base-36 value, then a dot and the base-36 length when it is over 1.
   * Value 0 is sea and value n is \`codes[n - 1]\`.
   */
  grid: string[];
}

export const WORLD_GRID: WorldGrid = ${JSON.stringify({
    step: STEP,
    top: TOP,
    left: LEFT,
    cols: COLS,
    rows: ROWS,
    codes,
    grid
  })};
`;

  await writeFile(
    OUTPUT,
    await format(source, {
      ...(await resolveConfig(OUTPUT)),
      filepath: OUTPUT
    })
  );
}

const shapes = await readShapes();

checkPlacesAreMissing(shapes);

const cells = buildCells(shapes);
const points = [
  ...smallCountryPoints(cells, shapes),
  ...Object.entries(PLACES)
].sort(([a], [b]) => byCode(a, b));

placePoints(cells, points);
checkEveryCode(cells);
await writeModule(encode(cells));
