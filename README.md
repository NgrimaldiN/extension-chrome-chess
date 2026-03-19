# No Tilt Chess

Chrome extension that locks Chess.com for the rest of the local day after a detected loss.

## Project goals

- detect a likely loss on Chess.com from the live DOM
- persist a local-day lock in extension storage
- redirect future Chess.com visits to a local block page until tomorrow
- keep the core logic testable outside the browser

## Planned structure

- `src/shared/`: pure helpers and loss heuristics
- `src/background/`: service worker logic
- `src/content/`: DOM observer and lock gatekeeper
- `src/pages/`: block page
- `src/popup/`: extension popup
- `tests/`: Node test suite

## Local commands

```bash
npm test
```

## Loading the extension

Once implementation is complete:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this folder
