const DAY_MS: number = 24 * 60 * 60 * 1000;

export const CLICKS_PAGE_SIZE: number = 50;

// a range ends now and starts this long before
export const CLICKS_RANGE_MS: number = 30 * DAY_MS;

// every text a Click keeps is cut to this, so a forged header can't bloat a row
export const CLICK_TEXT_MAX: number = 128;

// what the client reader reads when it doesn't know a browser, system or device
export const CLICK_OTHER: string = 'Other';
