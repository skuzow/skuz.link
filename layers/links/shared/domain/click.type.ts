import type { z } from 'zod';
import type { ClickRangeSchema, ClicksQuerySchema } from './click.schema';

// what a Click keeps: never an IP address or the full user agent (ADR-0007)
export interface Click {
  id: number;
  createdAt: Date;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  bot: boolean;
  botName: string | null;
}

// what the Redirect learns about a Click, before the Link it belongs to
export type ClickDetails = Omit<Click, 'id'>;

// what the user agent says about the client, before it is dropped
export type ClickClient = Pick<
  Click,
  'browser' | 'os' | 'device' | 'bot' | 'botName'
>;

export type ClickRange = z.infer<typeof ClickRangeSchema>;

export type ClicksQuery = z.infer<typeof ClicksQuerySchema>;

// where the next page of a Click list starts: the last Click shown, by time
// and id
export type ClickCursor = Pick<Click, 'createdAt' | 'id'>;

// a page of a Link's Clicks, newest first; cursor is null on the last page
export interface ClicksPage {
  clicks: Click[];
  cursor: string | null;
}

// XX stands for every Click with no known country
export interface CountryClicks {
  country: string;
  clicks: number;
}

// what a Link's Statistics show for a range
export interface LinkStatistics {
  rangeClicks: number;
  // the Link's Click count, which ignores the range: "Lifetime Clicks"
  clickCount: number;
  // leaves out Unknown
  countries: number;
  // the most common Referrer host, never Direct; null with no Referrer at all
  topReferrer: string | null;
  // most Clicks first, then by code, and Unknown last
  countryClicks: CountryClicks[];
}
