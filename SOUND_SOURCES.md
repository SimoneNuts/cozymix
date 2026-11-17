# Sound sources and licensing

Every sound in CozyMix is either a recording with verified provenance or original work made for the project. The recordings in `public/audio` are bundled **unchanged**, except where a note below says the file was converted to MP3; loop crossfades are applied in memory at playback. CozyMix never hotlinks audio and never contacts the original hosts.

| Sound (id) | File or implementation | Source | Creator | License |
| --- | --- | --- | --- | --- |
| Rain (`rain`) | `public/audio/rain-window.mp3` | [Gentle rain on window](https://freesound.org/people/Legnalegna55/sounds/553390/) | Legnalegna55 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Thunder (`thunder`) | `public/audio/thunder.mp3` | [Thunder Clap And Rumble #1](https://freesound.org/people/Kinoton/sounds/397952/) | Kinoton | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Stream (`stream`) | `public/audio/stream.mp3` | [363120 fractalstudios water-trickle.wav](https://commons.wikimedia.org/wiki/File:363120_fractalstudios_water-trickle.wav), originally [Freesound #363120](https://freesound.org/people/FractalStudios/sounds/363120/) | FractalStudios | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Birdsong (`birds`) | `public/audio/birds-dawn.mp3` | [Dawn Chorus 2020-05-06 0500.mp3](https://commons.wikimedia.org/wiki/File:Dawn_Chorus_2020-05-06_0500.mp3) | Robert EA Harvey | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Cricket (`crickets`) | `public/audio/cricket-night.mp3` | [Ringing cricket winding down.ogg](https://commons.wikimedia.org/wiki/File:Ringing_cricket_winding_down.ogg) | Jidanni | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Fireplace (`fireplace`) | `public/audio/fireplace.mp3` | [fire_crackling.wav](https://freesound.org/people/ceich93/sounds/263864/) | ceich93 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Café (`cafe`) | `public/audio/coffee-shop.mp3` | [Coffee Shop.wav](https://freesound.org/people/Trainscough5407/sounds/404478/) | Trainscough5407 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Train (`train`) | `public/audio/train.mp3` | [Train interior](https://freesound.org/people/Throndronis/sounds/799526/) | Throndronis | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Nebulizer (`nebulizer`) | `public/audio/nebulizer.mp3` | Original sound design, `scripts/generate-nebulizer.mjs` | CozyMix contributors | MIT |
| Fan (`fan`) | `public/audio/fan-mine.mp3` | [WWS Ventilationfan.ogg](https://commons.wikimedia.org/wiki/File:WWS_Ventilationfan.ogg) | Work With Sounds / Technical Museum of Slovenia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Paper mill (`mill`) | `public/audio/fan-paper-mill.mp3` | [WWS Vacuumfan.ogg](https://commons.wikimedia.org/wiki/File:WWS_Vacuumfan.ogg) | Work With Sounds / Torsten Nilsson | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Cooker hood (`hood`) | `public/audio/cooker-hood.mp3` | [WWS Cookerhood.ogg](https://commons.wikimedia.org/wiki/File:WWS_Cookerhood.ogg) | Work With Sounds / La Fonderie | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Wind (`wind`) | `public/audio/wind-pine-forest.mp3` | [Wind in Swedish pine forest at 25 mps](https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg) | W.carter | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Waves (`waves`) | `public/audio/waves-shore.mp3` | [Oceanwavescrushing.ogg](https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg), originally [Freesound #48412](https://freesound.org/people/Luftrum/sounds/48412/) | Luftrum | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Brown noise (`brown`) | `src/audio/dsp.ts` | Original synthesis in the browser | CozyMix contributors | MIT |

CC0 needs no attribution. CozyMix credits every creator anyway, in the app’s *About* sheet. CC BY 3.0, CC BY 4.0 and CC BY-SA 4.0 do require it: the *About* sheet names the creator, links the source page and links the license, marks edited recordings as *modified*, and links this file, where the changes are listed below.

## Provenance of the recordings

The Freesound files are the source-listed high-quality MP3 previews, bundled byte-for-byte. Licenses were checked on each source page: rain and train on 2026-10-07, the others on 2026-10-02.

- **Rain**: `https://cdn.freesound.org/previews/553/553390_10485775-hq.mp3`. 128.5 s, stereo, 2,921,800 bytes. Looped with a 4 s crossfade.
- **Thunder**: `https://cdn.freesound.org/previews/397/397952_2247456-hq.mp3`. About 20.2 s, 452,688 bytes. A single medium-distance strike, processed by its creator with compression and denoising. CozyMix plays it whole, at random intervals of 18–55 s, at slightly varied speeds.
- **Fireplace**: `https://cdn.freesound.org/previews/263/263864_4457609-hq.mp3`. About 60 s. This is a compressed preview of the creator’s WAV and may contain artefacts; a lossless copy could replace it later. 2 s crossfade.
- **Café**: `https://cdn.freesound.org/previews/404/404478_5200244-hq.mp3`. About 60 s. 3 s crossfade.
- **Wind**: from Wikimedia Commons, uploaded on 2024-11-01 as the creator’s own work. Wind at 25 m/s in a pine forest in Tuntorp, Brastad (Lysekil, Sweden), recorded with the internal microphones of a Sony Cyber-shot DSC-RX100 behind a makeshift fibre-fill windshield. License (CC BY-SA 4.0) checked on the file page on 2026-11-17. The original is `https://upload.wikimedia.org/wikipedia/commons/f/f3/Wind_in_Swedish_pine_forest_at_25_mps.ogg`: Ogg Vorbis, 60.5 s, 48 kHz stereo, 1,909,781 bytes, SHA-256 `964e7d4ec810227bf2435197d3da4ad82aaf8ca16c59e4d1e02b41c6cac02ce6`. **Changes:** converted to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 0`, 48 kHz, metadata stripped) because Safari does not reliably decode Ogg Vorbis; nothing else was edited. Looped with a 4 s crossfade at playback. Under share-alike, this MP3 is itself available under CC BY-SA 4.0.
- **Stream**: from Wikimedia Commons, where Victorgrigas uploaded it on 2022-05-13 from Freesound #363120. A small burn trickling through a wooded area, recorded on a Zoom H1 on 2016-10-19. License (CC0 1.0) checked on the Commons file page on 2026-11-17; the Freesound page could not be opened from the build environment, so the license is as recorded on Commons. The original is `https://upload.wikimedia.org/wikipedia/commons/a/a6/363120_fractalstudios_water-trickle.wav`: 16-bit PCM WAV, 32.9 s, 44.1 kHz stereo, 5,833,216 bytes, SHA-256 `a431777f2d840f74fcc8a01c0a4c8f0f648095d83ad2c29f9fc9488999e39672`. **Changes:** converted to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 0`, metadata stripped) to keep the offline download small. Looped with a 3 s crossfade at playback.
- **Waves**: from Wikimedia Commons, uploaded on 2011-11-15 from Freesound #48412. A close-field recording of medium waves on the shore of Kalundborg Fjord at Røsnæs (Denmark), with water cascading through small stones as it pulls back, and a very distant vessel. Recorded on 2008-02-16 at 2 m with the built-in microphones of a Zoom H2. License (CC BY 3.0) checked on the Commons file page on 2026-11-17. The original is `https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg`: Ogg Vorbis, 120.0 s, 44.1 kHz stereo, 2,849,514 bytes, SHA-256 `2a56648817264b6caa30426baa2245a03041b1febe9faa7b9235d7cc539aa9ca`. **Changes:** converted to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 2`, metadata stripped) because Safari does not reliably decode Ogg Vorbis; nothing else was edited. Looped with a 4 s crossfade at playback.
- **Fan, paper mill and cooker hood**: from Wikimedia Commons, where the Work With Sounds project (workwithsounds.eu, a European archive of industrial sounds) uploaded them with Wikimedia Sverige under CC BY 4.0. Licenses checked on each file page on 2026-11-17. The three changes are the same for all of them: **trimmed** to the part where the machine runs steadily, because the originals fade in and out and a loop would dip each time; **lowered** in level so they sit with the other sounds at the same slider position; **converted** to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 2`, metadata stripped). Each is looped with a 3 s crossfade at playback.
  - **Fan**: a 7.5 kW, ø 600 mm ventilation fan made by Tevel (Zagorje, Slovenia, 1997), supplying air to blind galleries of the Trbovlje-Hrastnik coal mine. Recorded by the Technical Museum of Slovenia on 2015-07-20. Original `https://upload.wikimedia.org/wikipedia/commons/d/db/WWS_Ventilationfan.ogg`: Ogg Vorbis, 73.0 s, 48 kHz stereo, 854,930 bytes, SHA-256 `02e12351aac5300df5b6b668ac6e9e0baf690632532f1673464d10c8d9a802b1`. Kept 8.0–66.0 s, −13 dB.
  - **Paper mill**: a combined vacuum fan and form roller (Schmid ventilatoren, machine AB 8360) that controls moisture in paper pulp at the Braviken paper mill in Norrköping, Sweden. Recorded by Torsten Nilsson on 2014-10-09. Original `https://upload.wikimedia.org/wikipedia/commons/1/11/WWS_Vacuumfan.ogg`: Ogg Vorbis, 91.0 s, 44.1 kHz stereo, 1,202,266 bytes, SHA-256 `12705e5f6ac20e202d5e7dc0f52ba58fa9137ab399364a93f98b059db66e262d`. Kept 2.5–88.5 s, −10 dB.
  - **Cooker hood**: the extraction fan of the J. Vandervaeren chip shop near the Atomium in Brussels. Recorded by La Fonderie on 2015-01-10. Original `https://upload.wikimedia.org/wikipedia/commons/0/08/WWS_Cookerhood.ogg`: Ogg Vorbis, 32.8 s, 44.1 kHz stereo, 399,067 bytes, SHA-256 `f59b5d94f8ce74ead835fdfd56a74e577e06fd4b6452181f9971a8328fd1eb08`. Kept 2.0–30.5 s, −13 dB.
- **Birdsong**: from Wikimedia Commons, uploaded on 2020-05-06 as the creator’s own work. A 38-minute dawn chorus recorded at 05:00 on 2020-05-06 in Bourne, Lincolnshire (England), with a Roland R-07, during the first Covid lockdown. License (CC BY-SA 4.0) checked on the file page on 2026-11-17. The original on Commons is a 71.72 MB MP3 (`https://upload.wikimedia.org/wikipedia/commons/9/9a/Dawn_Chorus_2020-05-06_0500.mp3`); the copy used here is a 96 kb/s, 48 kHz stereo MP3 of the same 38:46 recording (27,916,460 bytes, SHA-256 `86af3097b8f78f4849c6573dd03f9036a9ab5e24b2bfbbe4007ead935b2232c9`), as supplied by the project owner from that page. **Changes:** a two-minute **excerpt**, 5:00–7:00 of that copy, cut without re-encoding (FFmpeg `-c:a copy`, metadata stripped). That stretch was chosen because it has the most birds and none of the three passing cars the creator mentions (measured as bursts of energy below 250 Hz at about 1:10–1:40, 11:00–11:20 and 16:40–17:00). Looped with a 4 s crossfade at playback. Under share-alike, this excerpt is itself available under CC BY-SA 4.0.
- **Cricket**: from Wikimedia Commons, uploaded on 2021-09-05 as the creator’s own work. A cricket whose call “sounds like a spring”, recorded at 9:30 PM in the hills of central Taiwan. License (CC BY-SA 4.0) checked on the file page on 2026-11-17. The original is `https://upload.wikimedia.org/wikipedia/commons/3/39/Ringing_cricket_winding_down.ogg`: Ogg Vorbis, 55.8 s, 48 kHz stereo, 560,149 bytes, SHA-256 `7dd56a044d06415aa9d1f33d633fedfbd63b1f0bb8427c55eb2de49c043700c3`. **Changes:** **trimmed** to 14.0 s–end, which leaves out two one-second low thumps at about 8 s and 13 s (most likely the phone being handled); **converted** to MP3 (FFmpeg 6.1.1, libmp3lame `-q:a 2`, metadata stripped). Looped with a 2 s crossfade at playback. Under share-alike, this file is itself available under CC BY-SA 4.0.
- **Train**: `https://cdn.freesound.org/previews/799/799526_14610131-hq.mp3`. 61.4 s, stereo, 1,366,730 bytes. Room tone of a running train. 3 s crossfade. The *Night train* scene layers it with the separate rain recording; it does not claim to be a recording of rain on a train.

SHA-256 of the bundled files:

```text
rain-window.mp3  5ad07a52d69f7e917455e447f1e56dc39f9530e3cfe561609311e2e1605cb956
thunder.mp3      a977e35d3d7911ffa0900e7e5508c70123994cbc6b072fac7a9c8c2a1339eba8
fireplace.mp3    c9cec454ebee43c20fd185948e42ea8fbde9479af8661043635fe219e1217242
coffee-shop.mp3  34b2417094c48122f167952c29a637bd6e621c81378d0edb02a2634533b5a073
train.mp3        e2f2588783985920c7d42e3bb34f7e50f706edb5f3ae4e75a55061b24dde2362
wind-pine-forest.mp3  6020f7ed15305cd5694b617455a0874e91cf52b63e93d853baa4cf1ac13a5289
stream.mp3       7228e0e019cd65490b48a7d95ebe495217db67d20089d17bb7208c6a7193ea19
birds-dawn.mp3   6b1268ee5864209506d1be82b74290dc594c8dc79901645547f367a80bc7f22b
cricket-night.mp3  7897f33f3244a860491c40560254f9fe1dd3b762d7e0cbdafd75e771d74a66a9
fan-mine.mp3     f9f06ab465b2df075678433f307a370ef9d28274d87a02e9cafacca966e8ee9b
fan-paper-mill.mp3  1c0bb1b7146b97205fa6e0534fed25fb553f15fd225184c83c11ca6df926ca52
cooker-hood.mp3  c5f3ed5243e2592b2a81c33994c9942f7e510eaaff68f48c09ed93028dfaaf4a
waves-shore.mp3  130e820f40b64e2b5fd688252d6fa7e7783585b32299ede3288bfbf4790001d2
nebulizer.mp3    20f861fc2e67b6cf0d12b8de7d91fbbf6dc6036592b51339ea5db57b8a280b39
```

## Original and synthesized sounds

- **Nebulizer**: synthesized, not a recording of a real device. `scripts/generate-nebulizer.mjs` deterministically combines 50 Hz motor harmonics, a subtle 25 Hz vibration and filtered airflow with slow drift. It renders 24 s of mono at 48 kHz/16-bit, with DC removed and peaks at 0.45 or below, and converts it to MP3 with FFmpeg (libmp3lame `-q:a 2`): 0.27 MB instead of a 2.3 MB WAV. The script reproduces the file byte for byte. It is looped with a 1 s crossfade.
- **Brown noise**: rendered in the browser from seeded noise when first switched on (`src/audio/dsp.ts`). No samples, recordings or model output are involved. Its slow drift repeats exactly once per loop, so the loop has no seam.

## Rules for new sounds

1. Record the exact source URL, the creator, the license and version, any required attribution, and every edit.
2. Prefer original recordings, CC0 or public domain. A license that requires attribution (such as CC BY or CC BY-SA) also needs `licenseUrl` in the credit. Never infer permission from the fact that a file can be downloaded.
3. Add the `credit` to the catalog (`src/lib/catalog.ts`) and a row to this file in the same change.
4. Mechanical sounds should keep their recognisable character, not become generic noise.

The app’s icons, illustrations and styles were made for CozyMix. No third-party images or fonts are included.
