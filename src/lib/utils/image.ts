/**
 * Validates that a string is a valid image src for next/image.
 * Guards against emojis, random strings, or other non-URL values
 * that may be stored in localStorage.
 */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  return src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
}
