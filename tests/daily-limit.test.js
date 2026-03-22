import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_DAILY_DEFEAT_LIMIT,
  getCurrentDailyProgress,
  normalizeDailyDefeatLimit,
  recordDetectedLoss,
} from "../src/shared/daily-limit.js";

test("normalizeDailyDefeatLimit falls back to the default for invalid values", () => {
  assert.equal(normalizeDailyDefeatLimit(undefined), DEFAULT_DAILY_DEFEAT_LIMIT);
  assert.equal(normalizeDailyDefeatLimit("wat"), DEFAULT_DAILY_DEFEAT_LIMIT);
  assert.equal(normalizeDailyDefeatLimit(0), DEFAULT_DAILY_DEFEAT_LIMIT);
});

test("getCurrentDailyProgress resets stale progress on a new day", () => {
  assert.deepEqual(
    getCurrentDailyProgress(
      {
        dateKey: "2026-03-19",
        defeatCount: 2,
      },
      new Date(2026, 2, 20, 9, 30, 0),
    ),
    {
      dateKey: "2026-03-20",
      defeatCount: 0,
    },
  );
});

test("recordDetectedLoss increments today's defeats without locking before the limit", () => {
  assert.deepEqual(
    recordDetectedLoss({
      progress: {
        dateKey: "2026-03-19",
        defeatCount: 0,
      },
      dailyDefeatLimit: 2,
      now: new Date(2026, 2, 19, 18, 0, 0),
    }),
    {
      progress: {
        dateKey: "2026-03-19",
        defeatCount: 1,
      },
      defeatCount: 1,
      dailyDefeatLimit: 2,
      reachedLimit: false,
      remainingDefeats: 1,
    },
  );
});

test("recordDetectedLoss reaches the limit on the configured defeat count", () => {
  assert.deepEqual(
    recordDetectedLoss({
      progress: {
        dateKey: "2026-03-19",
        defeatCount: 1,
      },
      dailyDefeatLimit: 2,
      now: new Date(2026, 2, 19, 21, 0, 0),
    }),
    {
      progress: {
        dateKey: "2026-03-19",
        defeatCount: 2,
      },
      defeatCount: 2,
      dailyDefeatLimit: 2,
      reachedLimit: true,
      remainingDefeats: 0,
    },
  );
});
