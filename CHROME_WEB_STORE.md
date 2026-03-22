# Chrome Web Store Listing Pack

## Recommended Listing Language

English

Reason: the extension UI, package title, and package description are currently in English, and the repo does not yet define Chrome `_locales`.

## Title

No Tilt Chess

## Short Description

Set a daily defeat limit on Chess.com and lock the site until tomorrow once you reach it.

## Store Description

No Tilt Chess helps you stop tilt before one bad session turns into a worse one.

Choose how many defeats you want to allow yourself in a day. Once that limit is reached on Chess.com, the extension blocks the site for the rest of your local day and redirects future visits to a cooldown screen with a live countdown. Access returns automatically the next day.

What it does:

- lets you choose your daily defeat limit from the extension popup
- tracks defeats for the current local day
- blocks Chess.com once your limit is reached
- keeps the lock active across tab closes and browser restarts
- unlocks automatically the next day

How detection works:

- direct visible loss messages such as “You lost” or equivalent French post-game text
- negative rating changes shown on the result screen
- post-game review and analysis context
- final scores when the player color can be inferred from the page

Privacy:

- no account required
- no analytics
- no remote server
- no full-history scan
- data stays local in your browser

No Tilt Chess is designed for players who want a firm boundary after a rough result, without needing to rely on willpower in the moment.

## Recommended Category

Productivity

## Privacy Notes

- `storage`: saves your daily progress, settings, and cooldown state locally
- `tabs`: redirects Chess.com tabs to the cooldown screen when the limit is reached
- `*://chess.com/*` and `*://*.chess.com/*`: limits observation and blocking to Chess.com only

## Packaging

```bash
npm run check
npm run package:extension
```

The uploadable archive is generated at:

```text
dist/no-tilt-chess-v1.0.0.zip
```
