# Chrome Web Store Release Notes

## Extension Name

No Tilt Chess

## Short Description

Block Chess.com for the rest of the day after a detected loss.

## Store Description

No Tilt Chess helps you end a bad session before tilt takes over.

Once the extension detects a loss on Chess.com, it locks the site for the rest of your local day and redirects future visits to a dedicated lock screen. The next day, access returns automatically.

The extension watches for visible post-game signals such as direct loss text, negative rating changes, and review or analysis panels. It does not read your full Chess history or send your games anywhere.

## Category

Productivity

## Permissions Justification

- `storage`: saves the local-day lock state so the block survives tab closes and browser restarts
- `tabs`: redirects the current Chess.com tab to the lock screen after a detected loss
- `*://chess.com/*` and `*://*.chess.com/*`: limits observation and blocking to Chess.com only

## Privacy

- No account required
- No analytics
- No remote server
- No browsing outside Chess.com
- Lock state is stored locally in `chrome.storage.local`

## Packaging

```bash
npm run check
npm run package:extension
```

The uploadable archive is generated at:

```text
dist/no-tilt-chess-v1.0.0.zip
```

## Publish Checklist

1. Run `npm run check`
2. Run `npm run package:extension`
3. Upload the generated zip to the Chrome Web Store Developer Dashboard
4. Use the short description above
5. Paste the store description above
6. Confirm the privacy answers match the section above
7. Upload the `128x128` icon from `assets/icons/icon-128.png`
