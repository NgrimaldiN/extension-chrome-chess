import test from "node:test";
import assert from "node:assert/strict";

import { evaluateLossSignals } from "../src/shared/loss-signals.js";

test("locks immediately on a direct self-loss message", () => {
  const result = evaluateLossSignals({
    pageText: "You lost by checkmate. Game Review",
  });

  assert.equal(result.shouldLock, true);
  assert.ok(result.reasons.includes("direct-loss-text"));
});

test("locks on the French post-game combination shown in the UI screenshot", () => {
  const result = evaluateLossSignals({
    pageText: `
      Les Noirs ont gagne par echec et mat
      Bilan de la partie
      Votre nouveau classement Blitz est de 1646 (-8)
    `,
  });

  assert.equal(result.shouldLock, true);
  assert.ok(result.reasons.includes("winner-headline"));
  assert.ok(result.reasons.includes("negative-rating-delta"));
  assert.ok(result.reasons.includes("post-game-context"));
});

test("does not lock on a winner headline alone", () => {
  const result = evaluateLossSignals({
    pageText: "Black won by checkmate",
  });

  assert.equal(result.shouldLock, false);
});

test("does not lock on a bare score when the player color is unknown", () => {
  const result = evaluateLossSignals({
    pageText: "0-1",
  });

  assert.equal(result.shouldLock, false);
});

test("locks on a score that clearly means the local player lost", () => {
  const result = evaluateLossSignals({
    pageText: "0-1 Game Review",
    playerColor: "white",
  });

  assert.equal(result.shouldLock, true);
  assert.ok(result.reasons.includes("loss-score"));
});

test("does not lock on a draw screen", () => {
  const result = evaluateLossSignals({
    pageText: "1/2-1/2 Game Review",
  });

  assert.equal(result.shouldLock, false);
});

test("locks on an English negative rating delta after a game", () => {
  const result = evaluateLossSignals({
    pageText: "Game Review. Your new blitz rating is 1688 (-7)",
  });

  assert.equal(result.shouldLock, true);
  assert.ok(result.reasons.includes("negative-rating-delta"));
});

test("does not lock when the result screen shows a positive rating change", () => {
  const result = evaluateLossSignals({
    pageText: `
      Black won by checkmate
      Game Review
      Your new blitz rating is 1710 (+8)
    `,
  });

  assert.equal(result.shouldLock, false);
});
