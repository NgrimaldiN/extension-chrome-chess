import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBlockedPageUrl,
  isChessUrl,
} from "../src/shared/chess-url.js";

test("isChessUrl accepts chess.com and its subdomains", () => {
  assert.equal(isChessUrl("https://www.chess.com/play"), true);
  assert.equal(isChessUrl("https://support.chess.com/article"), true);
});

test("isChessUrl rejects extension and third-party URLs", () => {
  assert.equal(isChessUrl("chrome-extension://abc123/src/pages/blocked.html"), false);
  assert.equal(isChessUrl("https://lichess.org"), false);
});

test("buildBlockedPageUrl preserves the source page for display", () => {
  const blockedUrl = buildBlockedPageUrl(
    "chrome-extension://abc123/",
    "https://www.chess.com/play/online",
  );

  assert.equal(
    blockedUrl,
    "chrome-extension://abc123/src/pages/blocked.html?from=https%3A%2F%2Fwww.chess.com%2Fplay%2Fonline",
  );
});
