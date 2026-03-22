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

## Privacy Practices Form

Recommended answers for the Chrome Web Store privacy form:

### Single Purpose

```text
No Tilt Chess has one clear purpose: help Chess.com players enforce a self-imposed daily defeat limit. The extension detects defeat result cues on Chess.com, counts defeats for the current local day, and blocks Chess.com until the next day once the chosen limit is reached. It does not provide unrelated features, analytics, advertising, messaging, shopping tools, or cross-site functionality.
```

### Permission Justification: `storage`

```text
The extension uses storage only to save the user's daily defeat limit, the current day's defeat count, and the temporary cooldown lock state. These values are required so the cooldown persists across tab closes and browser restarts and automatically expires on the next local day.
```

### Permission Justification: `tabs`

```text
The extension uses the tabs permission only to update Chess.com tabs when cooldown is active. This is required to redirect the current Chess.com tab to the local blocked page after the defeat limit is reached and to enforce the block on newly opened Chess.com tabs during the cooldown period.
```

### Permission Justification: Host Access

```text
The extension is limited to chess.com and its subdomains because it must read the visible post-game page text on Chess.com to detect defeat signals and determine when the user-defined daily defeat limit has been reached. Host access is not requested for any other site and is used only for this single purpose.
```

### Remote Code

Select:

```text
No, I do not use remote code
```

Justification:

```text
All JavaScript, CSS, and assets used by No Tilt Chess are packaged inside the extension bundle. The extension does not load externally hosted scripts or WebAssembly, does not import remote modules, and does not execute fetched code via eval or similar mechanisms.
```

### Data Usage Disclosures

Check these categories:

- `Web history`
- `Website content`

Do not check these categories:

- `Personally identifiable information`
- `Health information`
- `Financial and payment information`
- `Authentication information`
- `Personal communications`
- `Location`
- `User activity`

Rationale:

```text
The extension accesses the current Chess.com tab URL to enforce the cooldown on Chess.com pages and reads visible page text on active Chess.com pages to detect defeat signals. This data is processed locally in the browser only for the extension's core functionality and is not sold, shared with third parties, or sent to a remote server.
```

### Required Certifications

Check all three certifications:

- `I do not sell or transfer user data to third parties outside of the approved use cases`
- `I do not use or transfer user data for purposes unrelated to my item's core functionality`
- `I do not use or transfer user data to determine creditworthiness or for lending purposes`

### Privacy Policy URL

Use a public URL pointing to `PRIVACY_POLICY.md`. If this repository is pushed to `main`, a suitable URL is:

```text
https://github.com/NgrimaldiN/extension-chrome-chess/blob/main/PRIVACY_POLICY.md
```

## Packaging

```bash
npm run check
npm run package:extension
```

The uploadable archive is generated at:

```text
dist/no-tilt-chess-v1.0.0.zip
```
