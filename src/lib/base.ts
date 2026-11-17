/**
 * Where the app lives on its host. Empty at the root of a domain, or a prefix
 * such as "/cozymix" on GitHub Pages. Set NEXT_PUBLIC_BASE_PATH at build time.
 *
 * Next.js prefixes its own pages and scripts; files in `public/` need this.
 * Pure module: no React, no DOM.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/audio/rain.mp3" → "/cozymix/audio/rain.mp3" */
export function asset(path: string): string {
  return BASE_PATH + path;
}
