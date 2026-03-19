import test from "node:test";
import assert from "node:assert/strict";

import {
  createDailyLock,
  getUnlockDateKey,
  isLockActive,
} from "../src/shared/lock-state.js";

test("createDailyLock stores the current local date and default reason", () => {
  const now = new Date(2026, 2, 19, 23, 10, 0);

  assert.deepEqual(createDailyLock({ now }), {
    lockedOnDate: "2026-03-19",
    detectedAt: now.toISOString(),
    reason: "loss-detected",
  });
});

test("isLockActive stays true on the same day", () => {
  const lock = createDailyLock({
    now: new Date(2026, 2, 19, 14, 0, 0),
  });

  assert.equal(isLockActive(lock, new Date(2026, 2, 19, 23, 59, 59)), true);
});

test("isLockActive expires on the next local day", () => {
  const lock = createDailyLock({
    now: new Date(2026, 2, 19, 23, 59, 59),
  });

  assert.equal(isLockActive(lock, new Date(2026, 2, 20, 0, 0, 0)), false);
});

test("getUnlockDateKey points to the next day after the loss", () => {
  const lock = createDailyLock({
    now: new Date(2026, 11, 31, 12, 0, 0),
  });

  assert.equal(getUnlockDateKey(lock), "2027-01-01");
});
