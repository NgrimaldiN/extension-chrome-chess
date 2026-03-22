import test from "node:test";
import assert from "node:assert/strict";

import {
  addDaysToDateKey,
  formatCountdownUntilDateKey,
  formatDateKeyForEnglishCopy,
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

test("formatDateKeyForEnglishCopy produces an English label", () => {
  assert.equal(
    formatDateKeyForEnglishCopy("2026-03-20"),
    "March 20, 2026",
  );
});

test("formatCountdownUntilDateKey returns the remaining local time until unlock", () => {
  assert.equal(
    formatCountdownUntilDateKey("2026-03-20", new Date(2026, 2, 19, 22, 5, 9)),
    "01:54:51",
  );
});

test("formatCountdownUntilDateKey floors at zero once the unlock day starts", () => {
  assert.equal(
    formatCountdownUntilDateKey("2026-03-20", new Date(2026, 2, 20, 0, 0, 0)),
    "00:00:00",
  );
});
