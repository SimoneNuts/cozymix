/**
 * Share links carry the mix in the URL fragment, so nothing reaches a server:
 *   https://example.com/#mix=rain.65,wind.15
 * Each entry is a sound id and a volume in whole percent.
 *
 * Pure module: no React, no DOM, relative imports only.
 */
import { isSoundId, sounds, type SoundId } from "./catalog.ts";

const PREFIX = "#mix=";

export function encodeShare(levels: Partial<Record<SoundId, number>>): string {
  const parts = sounds
    .filter((sound) => (levels[sound.id] ?? 0) > 0)
    .map((sound) => `${sound.id}.${Math.round((levels[sound.id] ?? 0) * 100)}`);
  return parts.length ? PREFIX + parts.join(",") : "";
}

export type SharedMix = {
  levels: Partial<Record<SoundId, number>>;
  /** Entries this version of CozyMix does not know. */
  skipped: number;
};

/** Reads a location hash. Returns undefined when it holds no usable mix. */
export function decodeShare(hash: string): SharedMix | undefined {
  if (!hash.startsWith(PREFIX)) return undefined;
  const levels: Partial<Record<SoundId, number>> = {};
  let skipped = 0;
  for (const part of hash.slice(PREFIX.length).split(",")) {
    const match = /^([a-z-]+)\.(\d{1,3})$/.exec(decodeURIComponent(part));
    if (!match || !isSoundId(match[1]) || levels[match[1]] !== undefined) {
      if (part) skipped++;
      continue;
    }
    const percent = Math.min(100, Number(match[2]));
    if (percent > 0) levels[match[1]] = percent / 100;
  }
  return Object.keys(levels).length ? { levels, skipped } : undefined;
}
