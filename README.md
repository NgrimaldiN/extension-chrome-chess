# No Tilt Chess

Chrome extension that locks Chess.com for the rest of the local day after a detected loss.

## What it does

- watches Chess.com pages with a DOM observer
- scores several defeat signals instead of trusting one brittle selector
- stores the lock in `chrome.storage.local` for the current local day
- redirects any new Chess.com visit to an internal block page until the next day
- shows the current status from the extension popup

## Detection strategy

The extension looks for combinations such as:

- direct defeat phrases like `You lost` or `Vous avez perdu`
- winner headlines like `Black won` or `Les Noirs ont gagne`
- negative rating changes like `(-8)` near rating labels
- post-game UI hints like `Game Review`, `Analysis`, or localized review panels
- final scores when the local player color can be inferred

## Release assets

- `assets/icons/`: Chrome-ready icons
- `CHROME_WEB_STORE.md`: ready-to-paste store copy, privacy notes, and publish checklist
- `npm run package:extension`: builds a clean upload zip in `dist/`

## Project structure

- `manifest.json`: Chrome MV3 manifest
- `src/shared/`: pure helpers and loss heuristics
- `src/background/`: service worker and lock state authority
- `src/content/`: gatekeeper plus live loss observer for Chess.com
- `src/pages/`: local block page shown after a loss
- `src/popup/`: popup status UI
- `tests/`: Node test suite
- `scripts/lint.mjs`: lightweight syntax and manifest validator

## Local commands

```bash
npm run lint
npm test
npm run check
npm run package:extension
```

## Loading the extension

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click Load unpacked
4. Select this folder

## Manual verification

1. Load the extension in Chrome.
2. Open Chess.com while unlocked and confirm the popup says `Watching for losses`.
3. Finish a game with a visible defeat result or a negative rating delta.
4. Confirm the current tab is redirected to the block page.
5. Try opening another Chess.com page and confirm it redirects immediately.
6. Wait until the next local day or clear `chrome.storage.local` from the extension devtools to test unlock.
