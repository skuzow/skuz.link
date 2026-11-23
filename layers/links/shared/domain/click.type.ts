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
