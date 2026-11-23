const isOnGoogle = (image: string) => {
  // not URL.canParse, which older Safari lacks and would throw while rendering
  let hostname: string;
  try {
    ({ hostname } = new URL(image));
  } catch {
    return false;
  }
  return (
    hostname === 'googleusercontent.com' ||
    hostname.endsWith('.googleusercontent.com')
  );
};

// Google gives a 96px picture by default, which blurs at Settings' 88px
// Avatar on a 2x screen, so ask it for twice that
export function avatarSource(image: string): string;
export function avatarSource(
  image: string | null | undefined
): string | null | undefined;
export function avatarSource(image: string | null | undefined) {
  return image && isOnGoogle(image)
    ? image.replace(/=s\d+-c$/, '=s192-c')
    : image;
}
