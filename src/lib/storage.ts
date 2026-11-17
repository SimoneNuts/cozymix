/**
 * What CozyMix keeps on the device, and how it is read back.
 * Parsers never throw: anything unreadable becomes the default.
 *
 * Keys are versioned. If a format changes, add a new key and read the old one.
 * Pure module: no React, no DOM, relative imports only.
 */
import { isSoundId, type SoundId } from "./catalog.ts";
import { clampLevel, emptyMix, fromLevels, type Mix } from "./mix.ts";

export const KEYS = {
  mix: "cozymix.mix.v2",
  saved: "cozymix.saved.v2",
  locale: "cozymix.locale",
} as const;

export type SavedMix = {
  id: string;
  name: string;
  levels: Partial<Record<SoundId, number>>;
};

export const MAX_SAVED = 24;
export const MAX_NAME = 40;

function parseLevels(value: unknown): Partial<Record<SoundId, number>> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const levels: Partial<Record<SoundId, number>> = {};
  for (const [id, level] of Object.entries(value)) {
    if (isSoundId(id) && typeof level === "number" && Number.isFinite(level)) {
      levels[id] = clampLevel(level);
    }
  }
  return levels;
}

function readJson(raw: string | null): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Stored mix: { master, tracks: { id: { on, volume } } }.
 * Sounds the catalog no longer has are dropped; new sounds get their defaults.
 */
export function parseMix(raw: string | null): Mix {
  const mix = emptyMix();
  const data = readJson(raw) as { master?: unknown; tracks?: unknown } | undefined;
  if (!data || typeof data !== "object") return mix;
  if (typeof data.master === "number") mix.master = clampLevel(data.master);
  if (data.tracks && typeof data.tracks === "object") {
    for (const [id, track] of Object.entries(data.tracks as Record<string, unknown>)) {
      if (!isSoundId(id) || !track || typeof track !== "object") continue;
      const { on, volume } = track as { on?: unknown; volume?: unknown };
      if (typeof volume === "number") mix.tracks[id].volume = clampLevel(volume);
      if (typeof on === "boolean") mix.tracks[id].on = on;
    }
  }
  return mix;
}

export function serializeMix(mix: Mix): string {
  return JSON.stringify(mix);
}

export function parseSaved(raw: string | null): SavedMix[] {
  const data = readJson(raw);
  if (!Array.isArray(data)) return [];
  const result: SavedMix[] = [];
  const seen = new Set<string>();
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const { id, name, levels } = entry as Record<string, unknown>;
    const parsed = parseLevels(levels);
    if (typeof id !== "string" || seen.has(id) || typeof name !== "string" || !parsed) continue;
    const clean = cleanName(name);
    if (!clean || Object.keys(parsed).length === 0) continue;
    seen.add(id);
    result.push({ id, name: clean, levels: parsed });
    if (result.length === MAX_SAVED) break;
  }
  return result;
}

export function serializeSaved(saved: readonly SavedMix[]): string {
  return JSON.stringify(saved);
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
}

export type NameProblem = "empty" | "taken" | "full";

/** Why a name can't be saved, or undefined when it can. */
export function nameProblem(name: string, saved: readonly SavedMix[]): NameProblem | undefined {
  const clean = cleanName(name);
  if (!clean) return "empty";
  if (saved.some((entry) => entry.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) {
    return "taken";
  }
  if (saved.length >= MAX_SAVED) return "full";
  return undefined;
}

export function savedToMix(saved: SavedMix, base: Mix): Mix {
  return fromLevels(saved.levels, base);
}
