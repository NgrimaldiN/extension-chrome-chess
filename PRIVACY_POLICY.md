# No Tilt Chess Privacy Policy

Last updated: March 22, 2026

## Overview

No Tilt Chess is a Chrome extension that helps users enforce a daily defeat limit on Chess.com. Once the configured limit is reached, the extension blocks Chess.com until the next local day.

## Data the extension accesses

No Tilt Chess only operates on `chess.com` and its subdomains.

To provide its core functionality, the extension may access:

- visible text from the active Chess.com page in the current tab, in order to detect post-game defeat signals
- the current Chess.com tab URL, in order to redirect the tab to the local cooldown page and optionally return the user to the original Chess.com page after the cooldown expires
- locally stored extension settings and state, including:
  - the configured daily defeat limit
  - the number of defeats counted for the current local day
  - the current cooldown lock state and unlock date

## How data is used

The extension uses this information only to:

- detect likely defeat result screens on Chess.com
- count defeats toward the user's configured daily limit
- block Chess.com after the limit is reached
- display the current status, countdown, and unlock date in the popup and blocked page
- automatically restore access on the next local day

## What the extension does not do

No Tilt Chess does not:

- collect data from sites other than `chess.com`
- require an account
- send user data to the developer or any remote server
- use analytics, advertising, or tracking SDKs
- sell or transfer user data to third parties
- use user data for advertising, profiling, creditworthiness, or lending

## Storage and retention

All extension data is stored locally in the browser using Chrome extension storage.

The extension stores:

- the daily defeat limit until the user changes it or removes the extension
- the current-day defeat counter until the local day changes
- the cooldown lock state until the next local day begins

No Tilt Chess does not maintain a remote database of user activity or page content.

## User control

Users can stop data access by:

- disabling or uninstalling the extension
- clearing the extension's stored data through Chrome's extension tools
- avoiding Chess.com pages while the extension is installed

## Contact

Project page:

- https://github.com/NgrimaldiN/extension-chrome-chess
