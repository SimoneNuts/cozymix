<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CozyMix agent guide

CozyMix is a local-first ambient sound mixer. It is a single static Next.js page whose app renders in the browser, built on the Web Audio API. Read [ARCHITECTURE.md](ARCHITECTURE.md) before structural changes. Everything in the repository (code, comments, docs, commit messages) is in English. Only the app's Italian dictionary in `lib/i18n.ts` is in Italian.

## Commands

| Goal | Command |
| --- | --- |
| Dev server | `npm run dev` (no service worker in development) |
| Fast checks | `npm run lint && npm run typecheck && npm test` |
| Build | `npm run build` (static export to `out/`; set `NEXT_PUBLIC_BASE_PATH=/cozymix` to match GitHub Pages) |
| Preview | `npm run preview` (serves `out/` at its base path) |
| Browser tests | `npm run build`, then `npx playwright test --project=chromium` (port 3100 must be free) |

On Windows, set `PLAYWRIGHT_BROWSERS_PATH=artifacts/browsers` if the browsers live there. In Git Bash, prefix base-path builds with `MSYS_NO_PATHCONV=1`. Firefox and WebKit may need to run outside the sandbox. The `verify` skill runs everything in order.

## Invariants

1. **No autoplay.** Only gesture handlers in `ui/store.tsx` call `engine.unlock()`. Effects, timers and module code never start audio. Restored mixes and shared links open paused.
2. **One engine.** Use `getEngine()`. Never construct `AudioEngine` or an `AudioContext` anywhere else.
3. **`src/lib/*` and `src/audio/dsp.ts` stay pure.** No React, no DOM and no `@/` imports. Import with relative `.ts` paths, because Node tests load them directly.
4. **Storage keys are versioned** (`cozymix.mix.v2`, `cozymix.saved.v2`). A format change needs a new key plus a reader for the old one. Parsers must never throw.
5. **Every string is translated.** Add it to `en` and `it` in `lib/i18n.ts`; the types enforce parity. Models return codes such as `NameProblem`; components turn them into words.
6. **Licensing.** No recording lands without verified provenance in `SOUND_SOURCES.md` and a `credit` in the catalog. Never infer permission from a download link.
7. **Accessible names are test contracts.** Tests find things by role and English name: the sound name ("Rain"), "Rain volume", "Play"/"Pause", "Overall volume", "Sleep timer", "Save", "Share", "Turn everything off", "Undo", "Load ‹name›", "Delete ‹name›", "About and settings", "Download all sounds (… MB)", and the scene names. They also use these hooks: `.pad[data-sound][data-state]`, `.pad-toggle`, `.play`, `.pill`, `.dock-status`, `#mix-title`, `.toast`, `.offline-status`, `.offline-sounds` and `.banner`. Rename one and you must update `tests/e2e` in the same change.
8. **Paths work under a base path.** The site is published at `/cozymix/`. Anything in `public/` is referenced through `asset()` from `lib/base.ts`, never as a bare `"/..."`. There is no server, so there are no route handlers, headers, rewrites or cookies.
9. **Touch and motion.** Interactive targets are at least 44 px (a test checks this at 320 px). Every animation stops under `prefers-reduced-motion`.

## Conventions

- Components get state and actions from `useStore()` and text from `useLocale().t`. Do not drill the mix through props.
- Styles are plain CSS. Colours are tokens in `styles/tokens.css`, and both themes must pass axe contrast. Write mobile-first `min-width` queries. Grid tracks use `minmax(0, 1fr)`.
- Use no runtime dependencies beyond Next and React without a strong reason. There is no UI, state or CSS framework, by design.
- Every behaviour change gets a test: a Node test for `lib/` and `dsp.ts`, Playwright for flows. Tests that need sound go through `openApp()` from `tests/e2e/helpers.ts`, which skips them in browsers without Web Audio.
- Pushing to `main` publishes the site once every check passes. Use pull requests for anything not ready to publish.
- Keep `CHANGELOG.md` current, and tick `ROADMAP.md` items when you finish them.
