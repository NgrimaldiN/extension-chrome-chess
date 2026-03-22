import { toLocalDateKey } from "./date.js";

export const DEFAULT_DAILY_DEFEAT_LIMIT = 1;
export const MAX_DAILY_DEFEAT_LIMIT = 10;

function normalizeDefeatCount(value) {
  const parsedValue = Number.parseInt(value ?? 0, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

export function normalizeDailyDefeatLimit(value) {
  const parsedValue = Number.parseInt(value ?? DEFAULT_DAILY_DEFEAT_LIMIT, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < DEFAULT_DAILY_DEFEAT_LIMIT) {
    return DEFAULT_DAILY_DEFEAT_LIMIT;
  }

  return Math.min(parsedValue, MAX_DAILY_DEFEAT_LIMIT);
}

export function getCurrentDailyProgress(progress, now = new Date()) {
  const dateKey = toLocalDateKey(now);

  if (progress?.dateKey !== dateKey) {
    return {
      dateKey,
      defeatCount: 0,
    };
  }

  return {
    dateKey,
    defeatCount: normalizeDefeatCount(progress.defeatCount),
  };
}

export function recordDetectedLoss({
  progress,
  dailyDefeatLimit = DEFAULT_DAILY_DEFEAT_LIMIT,
  now = new Date(),
} = {}) {
  const currentProgress = getCurrentDailyProgress(progress, now);
  const nextDefeatCount = currentProgress.defeatCount + 1;
  const normalizedLimit = normalizeDailyDefeatLimit(dailyDefeatLimit);

  return {
    progress: {
      dateKey: currentProgress.dateKey,
      defeatCount: nextDefeatCount,
    },
    defeatCount: nextDefeatCount,
    dailyDefeatLimit: normalizedLimit,
    reachedLimit: nextDefeatCount >= normalizedLimit,
    remainingDefeats: Math.max(0, normalizedLimit - nextDefeatCount),
  };
}
