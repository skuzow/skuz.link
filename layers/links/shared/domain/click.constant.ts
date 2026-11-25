const DAY_MS: number = 24 * 60 * 60 * 1000;

export const CLICKS_PAGE_SIZE: number = 50;

export const CLICK_RANGES = ['24h', '7d', '30d', '12m'] as const;

export const CLICK_RANGE_DEFAULT =
  '30d' satisfies (typeof CLICK_RANGES)[number];

// a range ends now and starts this long before; 12 months are 365 days
export const CLICK_RANGE_MS: Readonly<
  Record<(typeof CLICK_RANGES)[number], number>
> = {
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
  '12m': 365 * DAY_MS
};

// every text a Click keeps is cut to this, so a forged header can't bloat a row
export const CLICK_TEXT_MAX: number = 128;

// what the client reader reads when it doesn't know a browser, system or device
export const CLICK_OTHER: string = 'Other';
