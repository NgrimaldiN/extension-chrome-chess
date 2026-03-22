import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLossFingerprint,
  shouldReportLossFingerprint,
} from "../src/shared/content-detection.js";

test("buildLossFingerprint normalizes equivalent loss screens to the same value", () => {
  const first = buildLossFingerprint({
    title: "You lost",
    pageText: "Game Review  0-1",
  });
  const second = buildLossFingerprint({
    title: "You  lost",
    pageText: "Game Review\n0-1",
  });

  assert.equal(first, second);
});

test("shouldReportLossFingerprint ignores the same screen twice", () => {
  const fingerprint = buildLossFingerprint({
    title: "You lost",
    pageText: "Game Review 0-1",
  });

  assert.equal(
    shouldReportLossFingerprint({
      fingerprint,
      lastReportedFingerprint: fingerprint,
    }),
    false,
  );
});

test("shouldReportLossFingerprint allows a new loss screen through", () => {
  const first = buildLossFingerprint({
    title: "You lost",
    pageText: "Game Review 0-1",
  });
  const second = buildLossFingerprint({
    title: "You lost",
    pageText: "Game Review 0-1 rating -8",
  });

  assert.equal(
    shouldReportLossFingerprint({
      fingerprint: second,
      lastReportedFingerprint: first,
    }),
    true,
  );
});
