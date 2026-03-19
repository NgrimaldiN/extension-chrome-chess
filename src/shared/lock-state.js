import { addDaysToDateKey, toLocalDateKey } from "./date.js";

export function createDailyLock({
  now = new Date(),
  reason = "loss-detected",
} = {}) {
  return {
    lockedOnDate: toLocalDateKey(now),
    detectedAt: now.toISOString(),
    reason,
  };
}

export function isLockActive(lockState, now = new Date()) {
  if (!lockState?.lockedOnDate) {
    return false;
  }

  return lockState.lockedOnDate === toLocalDateKey(now);
}

export function getUnlockDateKey(lockState) {
  if (!lockState?.lockedOnDate) {
    return null;
  }

  return addDaysToDateKey(lockState.lockedOnDate, 1);
}
