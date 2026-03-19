import test from "node:test";
import assert from "node:assert/strict";

import {
  addDaysToDateKey,
  formatDateKeyForFrenchCopy,
  toLocalDateKey,
} from "../src/shared/date.js";

test("toLocalDateKey returns a zero-padded local date key", () => {
  const date = new Date(2026, 2, 19, 8, 5, 0);

  assert.equal(toLocalDateKey(date), "2026-03-19");
});

test("addDaysToDateKey advances across month boundaries", () => {
  assert.equal(addDaysToDateKey("2026-03-31", 1), "2026-04-01");
});

test("formatDateKeyForFrenchCopy produces a friendly label", () => {
  assert.equal(
    formatDateKeyForFrenchCopy("2026-03-20"),
    "20 mars 2026",
  );
});
