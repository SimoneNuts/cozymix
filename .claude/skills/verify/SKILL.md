---
name: verify
description: Run CozyMix's full verification (lint, types, unit tests, production build, Playwright with real audio) and report the results faithfully. Use before committing, after any behavioural or visual change, or when asked to "check everything".
---

# Verify CozyMix

Run these in order and stop at the first failure: fix it, or report it exactly.

```bash
npm run lint
npm run typecheck
npm test                      # Node tests: models and DSP
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/cozymix npm run build   # same build as GitHub Pages
npx playwright test --project=chromium
npx playwright test --project=firefox --project=webkit   # may need to run outside the sandbox
```

On Windows:

- If the browsers live in the repo, prefix the Playwright commands with `PLAYWRIGHT_BROWSERS_PATH=artifacts/browsers`.
- Port 3100 must be free. Stop any leftover `node scripts/serve.mjs 3100` first.
- Playwright serves `out/` at the base path the build recorded, so tests always match the last build.

## Reading the results

- **WebKit on Windows has no Web Audio.** About 14 of the 17 tests skip there with "this browser build has no Web Audio". That is expected, not a pass of the audio flows. Say so in the report.
- The offline test and the Share test run in Chromium only, and skip elsewhere by design.
- A failing axe test prints the element and the colours. Fix the token in `src/styles/tokens.css`, and check both themes.
- `expectAudible` reads the engine's real output level. If it fails, the audio graph or a gesture path broke. Do not lower the threshold to make it pass.

## Visual check

After a visual change, take screenshots at 320, 390 and 1440 px, in both colour schemes and with the `it-IT` locale. Look for horizontal overflow and console errors.

## Report

List each step with pass, fail or skip counts. Name anything that was not verified: real devices, real Safari, and listening by ear.
