# Roadmap

What comes after 1.0, in priority order. The first step is to confirm that what already exists works well on real devices. New features come after that.

## 1. Checks that automated tests cannot do

- [ ] Listen to waves and brown noise on headphones. The tests check numbers, not character.
- [ ] Safari on iPhone and Mac: starting audio, the silent switch, and playback with the screen locked. Playwright's WebKit build for Windows has no Web Audio, so those tests are skipped locally.
- [ ] Chrome on Android: installing as an app, offline use, and controls from the notification shade.
- [ ] An hour of continuous playback on a phone: battery, heat, and no dropouts.

## 2. Polish

- [ ] Rename a saved mix.
- [ ] Reorder sounds, or pin favourites to the top.
- [ ] A sleep timer with a custom end time, alongside the fixed durations.
- [ ] Replace the MP3 previews of the fireplace and thunder with lossless versions, if their licenses allow it.

## 3. New sounds

Every new sound needs verified provenance in `SOUND_SOURCES.md` before anything else. Ideas:

- [ ] Morning birdsong
- [ ] A stream
- [ ] Typing and turning pages
- [ ] A fan

## 4. Maybe

- [ ] Export and import saved mixes as a file.

To add a sound, use the `.claude/skills/add-sound` skill or follow *Adding a sound* in [ARCHITECTURE.md](ARCHITECTURE.md).
