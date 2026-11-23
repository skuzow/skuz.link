export const UNKNOWN_COUNTRY: string = 'XX';

// Cloudflare sends XX when it can't place a request and T1 for Tor
const UNPLACED_COUNTRIES: ReadonlySet<string> = new Set([
  UNKNOWN_COUNTRY,
  'T1'
]);

// XX, T1 and a Click with no country at all read as one Unknown
export const toCountryKey = (country: string | null): string =>
  !country || UNPLACED_COUNTRIES.has(country) ? UNKNOWN_COUNTRY : country;
