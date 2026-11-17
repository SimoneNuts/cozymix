/**
 * The mix: which sounds are on, how loud each one is, and the overall volume.
 * Every function returns a new object; nothing is mutated.
 *
 * Pure module: no React, no DOM, relative imports only.
 */
import { scenes, sounds, type Scene, type SoundId } from "./catalog.ts";

export type Track = { on: boolean; volume: number };
export type Tracks = Record<SoundId, Track>;
export type Mix = { master: number; tracks: Tracks };

export const DEFAULT_MASTER = 0.8;

/** Rounds to whole percent and keeps values in 0..1, so mixes compare cleanly. */
export function clampLevel(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

export function emptyTracks(): Tracks {
  return Object.fromEntries(
    sounds.map((sound) => [sound.id, { on: false, volume: sound.defaultVolume }]),
  ) as Tracks;
}

export function emptyMix(): Mix {
  return { master: DEFAULT_MASTER, tracks: emptyTracks() };
}

function withTrack(mix: Mix, id: SoundId, track: Track): Mix {
  return { ...mix, tracks: { ...mix.tracks, [id]: track } };
}

export function toggle(mix: Mix, id: SoundId): Mix {
  const track = mix.tracks[id];
  return withTrack(mix, id, {
    on: !track.on,
    // Turning on a sound whose slider sits at zero would be silent.
    volume: !track.on && track.volume === 0 ? 0.5 : track.volume,
  });
}

/** Moving a slider is a clear wish to hear that sound: above zero turns it on. */
export function setVolume(mix: Mix, id: SoundId, volume: number): Mix {
  const level = clampLevel(volume);
  return withTrack(mix, id, { on: level > 0, volume: level });
}

export function setMaster(mix: Mix, master: number): Mix {
  return { ...mix, master: clampLevel(master) };
}

/** Turns everything off but remembers each slider position. */
export function clearAll(mix: Mix): Mix {
  const tracks = { ...mix.tracks };
  for (const id of Object.keys(tracks) as SoundId[]) tracks[id] = { ...tracks[id], on: false };
  return { ...mix, tracks };
}

export function fromLevels(levels: Partial<Record<SoundId, number>>, base: Mix): Mix {
  const tracks = { ...base.tracks };
  for (const id of Object.keys(tracks) as SoundId[]) {
    const level = levels[id];
    tracks[id] =
      level === undefined
        ? { ...tracks[id], on: false }
        : { on: level > 0, volume: clampLevel(level) };
  }
  return { ...base, tracks };
}

export function sceneMix(scene: Scene, base: Mix): Mix {
  return fromLevels(scene.levels, base);
}

/** The sounds that are on, in catalog order. */
export function activeIds(mix: Mix): SoundId[] {
  return sounds.filter((sound) => mix.tracks[sound.id].on).map((sound) => sound.id);
}

export function levelsOf(mix: Mix): Partial<Record<SoundId, number>> {
  return Object.fromEntries(activeIds(mix).map((id) => [id, mix.tracks[id].volume]));
}

/** True when the same sounds are on at the same levels. Master is ignored. */
export function sameSound(a: Partial<Record<SoundId, number>>, b: Partial<Record<SoundId, number>>) {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key as SoundId] === b[key as SoundId])
  );
}

export function matchingScene(mix: Mix): Scene | undefined {
  const levels = levelsOf(mix);
  if (Object.keys(levels).length === 0) return undefined;
  return scenes.find((scene) =>
    sameSound(
      levels,
      Object.fromEntries(Object.entries(scene.levels).map(([id, v]) => [id, clampLevel(v)])),
    ),
  );
}
