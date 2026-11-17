/**
 * The sound catalog. Every pad, scene, share link and offline file comes from
 * this list, so adding a sound here is enough for it to appear everywhere.
 *
 * Pure module: no React, no DOM, relative imports only (Node tests import it).
 */

export type SoundId =
  | "rain"
  | "thunder"
  | "wind"
  | "waves"
  | "stream"
  | "fireplace"
  | "cafe"
  | "train"
  | "nebulizer"
  | "brown";

export type Generator = "brown";

export type Credit = {
  author: string;
  license: "CC0 1.0" | "CC BY 3.0" | "CC BY-SA 4.0" | "MIT";
  url?: string;
  /** Link to the license text, for licenses that require one. */
  licenseUrl?: string;
};

type Common = {
  id: SoundId;
  /** Hue (0–360) used for the pad tint and the ambient glow. */
  hue: number;
  defaultVolume: number;
  credit: Credit;
};

/** A recording that loops forever, with a crossfade baked into the seam. */
export type LoopSound = Common & {
  kind: "loop";
  file: string;
  crossfade: number;
};

/** A recording played now and then, at random intervals. */
export type EventSound = Common & {
  kind: "event";
  file: string;
  everySeconds: readonly [min: number, max: number];
};

/** A sound synthesized in the browser. No file to download. */
export type GeneratedSound = Common & {
  kind: "generated";
  generator: Generator;
};

export type Sound = LoopSound | EventSound | GeneratedSound;

const freesound = (author: string, id: number): Credit => ({
  author,
  license: "CC0 1.0",
  url: `https://freesound.org/people/${author}/sounds/${id}/`,
});
const original: Credit = { author: "CozyMix", license: "MIT" };

export const sounds: readonly Sound[] = [
  {
    id: "rain",
    kind: "loop",
    file: "/audio/rain-window.mp3",
    crossfade: 4,
    hue: 212,
    defaultVolume: 0.6,
    credit: freesound("Legnalegna55", 553390),
  },
  {
    id: "thunder",
    kind: "event",
    file: "/audio/thunder.mp3",
    everySeconds: [18, 55],
    hue: 262,
    defaultVolume: 0.35,
    credit: freesound("Kinoton", 397952),
  },
  {
    id: "wind",
    kind: "loop",
    file: "/audio/wind-pine-forest.mp3",
    crossfade: 4,
    hue: 176,
    defaultVolume: 0.35,
    credit: {
      author: "W.carter",
      license: "CC BY-SA 4.0",
      url: "https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  },
  {
    id: "waves",
    kind: "loop",
    file: "/audio/waves-shore.mp3",
    crossfade: 4,
    hue: 194,
    defaultVolume: 0.5,
    credit: {
      author: "Luftrum",
      license: "CC BY 3.0",
      url: "https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    },
  },
  {
    id: "stream",
    kind: "loop",
    file: "/audio/stream.mp3",
    crossfade: 3,
    hue: 105,
    defaultVolume: 0.6,
    credit: {
      author: "FractalStudios",
      license: "CC0 1.0",
      url: "https://commons.wikimedia.org/wiki/File:363120_fractalstudios_water-trickle.wav",
    },
  },
  {
    id: "fireplace",
    kind: "loop",
    file: "/audio/fireplace.mp3",
    crossfade: 2,
    hue: 22,
    defaultVolume: 0.5,
    credit: freesound("ceich93", 263864),
  },
  {
    id: "cafe",
    kind: "loop",
    file: "/audio/coffee-shop.mp3",
    crossfade: 3,
    hue: 34,
    defaultVolume: 0.4,
    credit: freesound("Trainscough5407", 404478),
  },
  {
    id: "train",
    kind: "loop",
    file: "/audio/train.mp3",
    crossfade: 3,
    hue: 232,
    defaultVolume: 0.45,
    credit: freesound("Throndronis", 799526),
  },
  {
    id: "nebulizer",
    kind: "loop",
    file: "/audio/nebulizer.wav",
    crossfade: 1,
    hue: 150,
    defaultVolume: 0.4,
    credit: original,
  },
  {
    id: "brown",
    kind: "generated",
    generator: "brown",
    hue: 30,
    defaultVolume: 0.35,
    credit: original,
  },
];

export const soundIds: readonly SoundId[] = sounds.map((sound) => sound.id);

const byId = new Map<string, Sound>(sounds.map((sound) => [sound.id, sound]));

export function findSound(id: string): Sound | undefined {
  return byId.get(id);
}

export function isSoundId(id: string): id is SoundId {
  return byId.has(id);
}

/** Files to keep for offline use. Generated sounds need none. */
export const audioFiles: readonly string[] = sounds.flatMap((sound) =>
  sound.kind === "generated" ? [] : [sound.file],
);

export type SceneId =
  | "rainy-window"
  | "storm"
  | "cabin"
  | "cafe"
  | "night-train"
  | "seaside"
  | "focus"
  | "nebulizer";

export type Scene = {
  id: SceneId;
  /** Sound volumes from 0 to 1. Sounds not listed are off. */
  levels: Partial<Record<SoundId, number>>;
};

export const scenes: readonly Scene[] = [
  { id: "rainy-window", levels: { rain: 0.65, wind: 0.15 } },
  { id: "storm", levels: { rain: 0.7, thunder: 0.45, wind: 0.3 } },
  { id: "cabin", levels: { fireplace: 0.6, rain: 0.3, wind: 0.15 } },
  { id: "cafe", levels: { cafe: 0.55, rain: 0.25 } },
  { id: "night-train", levels: { train: 0.6, rain: 0.3 } },
  { id: "seaside", levels: { waves: 0.65, wind: 0.2 } },
  { id: "focus", levels: { brown: 0.5, rain: 0.2 } },
  { id: "nebulizer", levels: { nebulizer: 0.55, rain: 0.2 } },
];
