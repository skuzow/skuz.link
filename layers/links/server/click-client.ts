import type { ClickClient } from '#layers/links/shared/domain/click.type';
import { getPattern, isbot } from 'isbot';
import {
  CLICK_OTHER,
  CLICK_TEXT_MAX
} from '#layers/links/shared/domain/click.constant';

// isbot's pattern, global so matchAll finds every match, leftmost first
const BOT_PATTERN = new RegExp(getPattern().source, `${getPattern().flags}g`);

// a user agent's parts: products like `Discordbot/2.0`, comments and URLs
const UA_PART = /[^\s;(),]+/g;

// a URL, a mail address or a library named after http, like `http.rb`, is
// never a Bot's name, though isbot matches them
const NOT_A_NAME = /:\/\/|@|^\+|^https?\b/i;

// a product with its version, such as `Iframely/1.3.1`, but not `Mozilla/5.0`,
// which browsers and Bots both send
const PRODUCT = /^(?!Mozilla\/)[A-Za-z][\w.-]*\//;

const toName = (part: string): string | null =>
  part.split('/')[0]?.slice(0, CLICK_TEXT_MAX) || null;

// the first product token that holds one of isbot's matches, without its
// version: `Slackbot-LinkExpanding`, `Discordbot`, `curl`; when isbot matches
// only a URL or http, the first product that names itself, like `Iframely`
const readBotName = (userAgent: string): string | null => {
  const parts = [...userAgent.matchAll(UA_PART)]
    .map((part) => ({
      text: part[0],
      start: part.index,
      end: part.index + part[0].length
    }))
    .filter(({ text }) => !NOT_A_NAME.test(text));

  for (const match of userAgent.matchAll(BOT_PATTERN)) {
    const part = parts.find(
      ({ start, end }) => start <= match.index && match.index < end
    );
    const name = part && toName(part.text);
    if (name) return name;
  }

  const product = parts.find(({ text }) => PRODUCT.test(text));
  return product ? toName(product.text) : null;
};

// first match wins, so a browser built on Chrome comes before Chrome, and
// Chrome before Safari, whose token Chrome also sends
const BROWSER_RULES: [RegExp, string][] = [
  [/\bEdg(?:e|A|iOS)?\//, 'Edge'],
  [/\bOPR\/|\bOPT\/|\bOPiOS\/|\bOpera\b/, 'Opera'],
  [/\bSamsungBrowser\//, 'Samsung Internet'],
  [/\b(?:Firefox|FxiOS)\//, 'Firefox'],
  [/\b(?:Chrome|CriOS)\//, 'Chrome'],
  [/\bVersion\/[\d.]+.*\bSafari\//, 'Safari']
];

// an iPad that asks for the desktop site sends a Mac's user agent, so it
// reads as macOS
const OS_RULES: [RegExp, string][] = [
  [/\biPad\b/, 'iPadOS'],
  [/\b(?:iPhone|iPod)\b/, 'iOS'],
  [/\bAndroid\b/, 'Android'],
  [/\bCrOS\b/, 'ChromeOS'],
  [/\bWindows\b/, 'Windows'],
  [/\bMac(?:intosh| OS X)\b/, 'macOS'],
  [/\bLinux\b/, 'Linux']
];

const DESKTOP_OSES: ReadonlySet<string> = new Set([
  'Windows',
  'macOS',
  'Linux',
  'ChromeOS'
]);

const readDevice = (userAgent: string, os: string): string => {
  if (os === 'iPadOS' || /\bTablet\b/.test(userAgent)) return 'Tablet';
  if (os === 'iOS' || /\bMobile\b/.test(userAgent)) return 'Mobile';
  // an Android without "Mobile" is a tablet
  if (os === 'Android') return 'Tablet';
  if (DESKTOP_OSES.has(os)) return 'Desktop';
  return CLICK_OTHER;
};

const firstMatch = (userAgent: string, rules: [RegExp, string][]): string =>
  rules.find(([pattern]) => pattern.test(userAgent))?.[1] ?? CLICK_OTHER;

// read from the user agent, which is then dropped (ADR-0007); a request with
// no user agent is a Bot without a name, because browsers always send one
export const readClickClient = (userAgent: string | undefined): ClickClient => {
  if (!userAgent || isbot(userAgent)) {
    return {
      browser: null,
      os: null,
      device: null,
      bot: true,
      botName: userAgent ? readBotName(userAgent) : null
    };
  }

  const os = firstMatch(userAgent, OS_RULES);

  return {
    browser: firstMatch(userAgent, BROWSER_RULES),
    os,
    device: readDevice(userAgent, os),
    bot: false,
    botName: null
  };
};
