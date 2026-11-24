import type { ClickCursor } from './click.type';

// a ClickCursor is opaque to the client: base64url of "time-id"

const CURSOR_PATTERN = /^(\d{1,15})-(\d{1,15})$/;

const toBase64Url = (value: string): string =>
  btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

const fromBase64Url = (value: string): string | null => {
  if (!/^[\w-]+$/.test(value)) return null;

  try {
    return atob(value.replaceAll('-', '+').replaceAll('_', '/'));
  } catch {
    return null;
  }
};

export const encodeClickCursor = ({ createdAt, id }: ClickCursor): string =>
  toBase64Url(`${createdAt.getTime()}-${id}`);

// null for anything encodeClickCursor didn't make
export const decodeClickCursor = (value: string): ClickCursor | null => {
  const match = fromBase64Url(value)?.match(CURSOR_PATTERN);
  if (!match) return null;

  return { createdAt: new Date(Number(match[1])), id: Number(match[2]) };
};
