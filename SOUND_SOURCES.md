# Sound sources and licensing

Every sound in CozyMix is either a recording with verified provenance or original work made for the project. The recordings in `public/audio` are bundled **unchanged**, except where a note below says the file was converted to MP3; loop crossfades are applied in memory at playback. CozyMix never hotlinks audio and never contacts the original hosts.

| Sound (id) | File or implementation | Source | Creator | License |
| --- | --- | --- | --- | --- |
| Rain (`rain`) | `public/audio/rain-window.mp3` | [Gentle rain on window](https://freesound.org/people/Legnalegna55/sounds/553390/) | Legnalegna55 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Thunder (`thunder`) | `public/audio/thunder.mp3` | [Thunder Clap And Rumble #1](https://freesound.org/people/Kinoton/sounds/397952/) | Kinoton | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Fireplace (`fireplace`) | `public/audio/fireplace.mp3` | [fire_crackling.wav](https://freesound.org/people/ceich93/sounds/263864/) | ceich93 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Café (`cafe`) | `public/audio/coffee-shop.mp3` | [Coffee Shop.wav](https://freesound.org/people/Trainscough5407/sounds/404478/) | Trainscough5407 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Train (`train`) | `public/audio/train.mp3` | [Train interior](https://freesound.org/people/Throndronis/sounds/799526/) | Throndronis | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Nebulizer (`nebulizer`) | `public/audio/nebulizer.wav` | Original sound design, `scripts/generate-nebulizer.mjs` | CozyMix contributors | MIT |
| Wind (`wind`) | `public/audio/wind-pine-forest.mp3` | [Wind in Swedish pine forest at 25 mps](https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg) | W.carter | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Waves (`waves`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |
| Brown noise (`brown`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |
| Pink noise (`pink`) | `src/audio/dsp.ts` | Paul Kellet’s economy pink filter (a public technique), implemented for CozyMix | CozyMix contributors | MIT |

CC0 needs no attribution. CozyMix credits every creator anyway, in the app’s *About* sheet. CC BY-SA 4.0 does require it: the *About* sheet names the creator, links the source page and links the license, and the changes are listed below.

## Provenance of the recordings

The Freesound files are the source-listed high-quality MP3 previews, bundled byte-for-byte. Licenses were checked on each source page: rain and train on 2026-10-07, the others on 2026-10-02.

- **Rain**: `https://cdn.freesound.org/previews/553/553390_10485775-hq.mp3`. 128.5 s, stereo, 2,921,800 bytes. Looped with a 4 s crossfade.
- **Thunder**: `https://cdn.freesound.org/previews/397/397952_2247456-hq.mp3`. About 20.2 s, 452,688 bytes. A single medium-distance strike, processed by its creator with compression and denoising. CozyMix plays it whole, at random intervals of 18–55 s, at slightly varied speeds.
- **Fireplace**: `https://cdn.freesound.org/previews/263/263864_4457609-hq.mp3`. About 60 s. This is a compressed preview of the creator’s WAV and may contain artefacts; a lossless copy could replace it later. 2 s crossfade.
- **Café**: `https://cdn.freesound.org/previews/404/404478_5200244-hq.mp3`. About 60 s. 3 s crossfade.
- **Wind**: from Wikimedia Commons, uploaded on 2024-11-01 as the creator’s own work. Wind at 25 m/s in a pine forest in Tuntorp, Brastad (Lysekil, Sweden), recorded with the internal microphones of a Sony Cyber-shot DSC-RX100 behind a makeshift fibre-fill windshield. License (CC BY-SA 4.0) checked on the file page on 2026-11-17. The original is `https://upload.wikimedia.org/wikipedia/commons/f/f3/Wind_in_Swedish_pine_forest_at_25_mps.ogg`: Ogg Vorbis, 60.5 s, 48 kHz stereo, 1,909,781 bytes, SHA-256 `964e7d4ec810227bf2435197d3da4ad82aaf8ca16c59e4d1e02b41c6cac02ce6`. **Changes:** converted to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 0`, 48 kHz, metadata stripped) because Safari does not reliably decode Ogg Vorbis; nothing else was edited. Looped with a 4 s crossfade at playback. Under share-alike, this MP3 is itself available under CC BY-SA 4.0.
- **Train**: `https://cdn.freesound.org/previews/799/799526_14610131-hq.mp3`. 61.4 s, stereo, 1,366,730 bytes. Room tone of a running train. 3 s crossfade. The *Night train* scene layers it with the separate rain recording; it does not claim to be a recording of rain on a train.

SHA-256 of the bundled files:

```text
rain-window.mp3  5ad07a52d69f7e917455e447f1e56dc39f9530e3cfe561609311e2e1605cb956
thunder.mp3      a977e35d3d7911ffa0900e7e5508c70123994cbc6b072fac7a9c8c2a1339eba8
fireplace.mp3    c9cec454ebee43c20fd185948e42ea8fbde9479af8661043635fe219e1217242
coffee-shop.mp3  34b2417094c48122f167952c29a637bd6e621c81378d0edb02a2634533b5a073
train.mp3        e2f2588783985920c7d42e3bb34f7e50f706edb5f3ae4e75a55061b24dde2362
wind-pine-forest.mp3  6020f7ed15305cd5694b617455a0874e91cf52b63e93d853baa4cf1ac13a5289
nebulizer.wav    2f322b6c5d4b5ed7f6ca9c459fb8c64cb7aa344cccbfd9ce94c5d67d39a777fd
```

## Original and synthesized sounds

- **Nebulizer**: synthesized, not a recording of a real device. `scripts/generate-nebulizer.mjs` deterministically combines 50 Hz motor harmonics, a subtle 25 Hz vibration and filtered airflow with slow drift. The result is a 24 s mono WAV at 48 kHz/16-bit, with DC removed and peaks at 0.45 or below. It is looped with a 1 s crossfade.
- **Waves, brown and pink noise**: rendered in the browser from seeded noise when first switched on (`src/audio/dsp.ts`). No samples, recordings or model output are involved. Their envelopes repeat exactly once per loop, so the loop has no seam.

## Rules for new sounds

1. Record the exact source URL, the creator, the license and version, any required attribution, and every edit.
2. Prefer original recordings, CC0 or public domain. A license that requires attribution (such as CC BY-SA) also needs `licenseUrl` in the credit. Never infer permission from the fact that a file can be downloaded.
3. Add the `credit` to the catalog (`src/lib/catalog.ts`) and a row to this file in the same change.
4. Mechanical sounds should keep their recognisable character, not become generic noise.

The app’s icons, illustrations and styles were made for CozyMix. No third-party images or fonts are included.
