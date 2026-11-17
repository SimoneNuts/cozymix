---
name: add-sound
description: Add a new sound to CozyMix (a licensed recording, an occasional event, or a sound synthesized in the browser), with licensing records, translations, an icon, offline caching and tests. Use when asked to add, replace or synthesize an ambient sound.
---

# Add a sound

## 1. Licensing comes first

For a recording, open the source page yourself. Record:

- the exact source URL and download URL;
- the creator;
- the license and its version;
- the attribution the license requires;
- duration and byte size;
- any edits.

Only CC0, public domain, original work, or an explicit license that allows redistribution is acceptable. A download button is not permission. If provenance cannot be verified, stop and say so.

Add a row and a provenance note to `SOUND_SOURCES.md`, plus the file's SHA-256.

## 2. The sound itself

- **A recording that loops:** put the unchanged file in `public/audio/`. Use `kind: "loop"` with a `crossfade` in seconds: 1–4, longer for textured ambience.
- **An occasional sound** (like thunder): use `kind: "event"` with `everySeconds: [min, max]`.
- **Synthesized:** add a case to `makeVoice()` and an entry to `LOOP_SECONDS` in `src/audio/dsp.ts`, and add the name to the `Generator` type. Every modulation period must divide the loop length, or the loop will audibly jump.

## 3. Wire it up

Then wire the sound in. TypeScript reports each place you miss.

1. `src/lib/catalog.ts`: add the id to `SoundId`, and an entry to `sounds` with `hue`, `defaultVolume` and `credit`. Pick a hue that differs from its neighbours.
2. `src/lib/i18n.ts`: add `sounds.<id>` with a `name` and a short `hint`, in English and Italian. Keep the hint under about 25 characters so it fits a 320 px pad.
3. `src/ui/icons.tsx`: add a 24 px line icon under the same id, stroke only, in the style of the others.
4. `src/lib/catalog.ts`: update `AUDIO_MEGABYTES` if the total size of `public/audio` changes. A unit test fails if it is off. Nothing goes in `public/sw.js`: recordings are kept offline when played or downloaded.
5. Optionally, add it to a scene in `scenes`.
6. Check the grids: a Playwright test fails if a row of pads is not full at some width. The pads use 2, 3 and 5 columns (see *Grids* in ARCHITECTURE.md); with a new count, change the column counts in `src/styles/app.css` too. The same goes for scenes, which use 3 columns on wide screens.

## 4. Verify

- `npm test`: checks that the file exists, the scenes are valid, the strings match, and (for generators) levels, DC and loop seams.
- Run the `verify` skill.
- Listen with headphones for at least two full loops, and say in your report that you could not listen if you did not.
- Add a line to `CHANGELOG.md`.
