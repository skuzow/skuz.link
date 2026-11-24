import { WORLD_GRID } from '#layers/links/app/constants/world-grid.constant';

// each dot is a square 0.75 of its 1 × 1 cell
const dot = (col: number, row: number) => `M${col} ${row}h.75v.75h-.75z`;

// one path per country: its dots, in the grid's cells
export const COUNTRY_DOTS: Readonly<Record<string, string>> = (() => {
  const paths: Record<string, string[]> = {};

  WORLD_GRID.grid.forEach((line, row) => {
    let col = 0;

    for (const run of line.split(',')) {
      const [value = '0', length = '1'] = run.split('.');
      const index = Number.parseInt(value, 36);
      const count = Number.parseInt(length, 36);
      const code = index ? WORLD_GRID.codes[index - 1] : undefined;

      for (let end = col + count; col < end; col++) {
        if (code) (paths[code] ??= []).push(dot(col, row));
      }
    }
  });

  return Object.fromEntries(
    Object.entries(paths).map(([code, dots]) => [code, dots.join('')])
  );
})();

export const MAP_VIEW_BOX = `0 0 ${WORLD_GRID.cols} ${WORLD_GRID.rows}`;

// the fill-opacity of steps 1 to 4
const STEP_OPACITIES = [0.32, 0.55, 0.78, 1] as const;
const STEPS = STEP_OPACITIES.length;

export const mapStepOpacity = (step: number): number | undefined =>
  STEP_OPACITIES[step - 1];

// the step a country with n Clicks lights at, 0 for none, on a log scale so
// a few large countries don't wash out the rest
export const mapStep = (clicks: number, max: number): number =>
  clicks > 0
    ? Math.max(1, Math.ceil((STEPS * Math.log1p(clicks)) / Math.log1p(max)))
    : 0;

// the fewest Clicks that reach a step, by the same rule the map lights with
const lowerBound = (step: number, max: number): number => {
  let low = 1;
  let high = max;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (mapStep(middle, max) >= step) high = middle;
    else low = middle + 1;
  }

  return low;
};

// the steps some count up to max lights, each with its lower bound
export const mapLegend = (max: number): { step: number; from: number }[] =>
  Array.from({ length: STEPS }, (_, index) => index + 1)
    .map((step) => ({ step, from: max ? lowerBound(step, max) : 0 }))
    .filter(({ step, from }) => from && mapStep(from, max) === step);
