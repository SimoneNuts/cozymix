# Sound sources and licensing

Every sound in CozyMix is either a recording with verified provenance or original work made for the project. The recordings in `public/audio` are bundled **unchanged**; loop crossfades are applied in memory at playback. CozyMix never hotlinks audio and never contacts the original hosts.

| Sound (id) | File or implementation | Source | Creator | License |
| --- | --- | --- | --- | --- |
| Rain (`rain`) | `public/audio/rain-window.mp3` | [Gentle rain on window](https://freesound.org/people/Legnalegna55/sounds/553390/) | Legnalegna55 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Thunder (`thunder`) | `public/audio/thunder.mp3` | [Thunder Clap And Rumble #1](https://freesound.org/people/Kinoton/sounds/397952/) | Kinoton | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Fireplace (`fireplace`) | `public/audio/fireplace.mp3` | [fire_crackling.wav](https://freesound.org/people/ceich93/sounds/263864/) | ceich93 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Café (`cafe`) | `public/audio/coffee-shop.mp3` | [Coffee Shop.wav](https://freesound.org/people/Trainscough5407/sounds/404478/) | Trainscough5407 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Train (`train`) | `public/audio/train.mp3` | [Train interior](https://freesound.org/people/Throndronis/sounds/799526/) | Throndronis | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Nebulizer (`nebulizer`) | `public/audio/nebulizer.wav` | Original sound design, `scripts/generate-nebulizer.mjs` | CozyMix contributors | MIT |
| Wind (`wind`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |
| Waves (`waves`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |
| Brown noise (`brown`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |
| Pink noise (`pink`) | `src/audio/dsp.ts` | Paul Kellet’s economy pink filter (a public technique), implemented for CozyMix | CozyMix contributors | MIT |

CC0 needs no attribution. CozyMix credits every creator anyway, in the app’s *About* sheet.

## Provenance of the recordings

All files are the source-listed high-quality MP3 previews, downloaded from Freesound and bundled byte-for-byte. Licenses were checked on each source page: rain and train on 2026-10-07, the others on 2026-10-02.

- **Rain**: `https://cdn.freesound.org/previews/553/553390_10485775-hq.mp3`. 128.5 s, stereo, 2,921,800 bytes. Looped with a 4 s crossfade.
- **Thunder**: `https://cdn.freesound.org/previews/397/397952_2247456-hq.mp3`. About 20.2 s, 452,688 bytes. A single medium-distance strike, processed by its creator with compression and denoising. CozyMix plays it whole, at random intervals of 18–55 s, at slightly varied speeds.
- **Fireplace**: `https://cdn.freesound.org/previews/263/263864_4457609-hq.mp3`. About 60 s. This is a compressed preview of the creator’s WAV and may contain artefacts; a lossless copy could replace it later. 2 s crossfade.
- **Café**: `https://cdn.freesound.org/previews/404/404478_5200244-hq.mp3`. About 60 s. 3 s crossfade.
- **Train**: `https://cdn.freesound.org/previews/799/799526_14610131-hq.mp3`. 61.4 s, stereo, 1,366,730 bytes. Room tone of a running train. 3 s crossfade. The *Night train* scene layers it with the separate rain recording; it does not claim to be a recording of rain on a train.

SHA-256 of the bundled files:

```text
rain-window.mp3  5ad07a52d69f7e917455e447f1e56dc39f9530e3cfe561609311e2e1605cb956
thunder.mp3      a977e35d3d7911ffa0900e7e5508c70123994cbc6b072fac7a9c8c2a1339eba8
fireplace.mp3    c9cec454ebee43c20fd185948e42ea8fbde9479af8661043635fe219e1217242
coffee-shop.mp3  34b2417094c48122f167952c29a637bd6e621c81378d0edb02a2634533b5a073
train.mp3        e2f2588783985920c7d42e3bb34f7e50f706edb5f3ae4e75a55061b24dde2362
nebulizer.wav    2f322b6c5d4b5ed7f6ca9c459fb8c64cb7aa344cccbfd9ce94c5d67d39a777fd
```

## Original and synthesized sounds

- **Nebulizer**: synthesized, not a recording of a real device. `scripts/generate-nebulizer.mjs` deterministically combines 50 Hz motor harmonics, a subtle 25 Hz vibration and filtered airflow with slow drift. The result is a 24 s mono WAV at 48 kHz/16-bit, with DC removed and peaks at 0.45 or below. It is looped with a 1 s crossfade.
- **Wind, waves, brown and pink noise**: rendered in the browser from seeded noise when first switched on (`src/audio/dsp.ts`). No samples, recordings or model output are involved. Their envelopes repeat exactly once per loop, so the loop has no seam.

## Rules for new sounds

1. Record the exact source URL, the creator, the license and version, any required attribution, and every edit.
2. Prefer original recordings, CC0 or public domain. Never infer permission from the fact that a file can be downloaded.
3. Add the `credit` to the catalog (`src/lib/catalog.ts`) and a row to this file in the same change.
4. Mechanical sounds should keep their recognisable character, not become generic noise.

The app’s icons, illustrations and styles were made for CozyMix. No third-party images or fonts are included.
