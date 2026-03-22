import { formatDateKeyForEnglishCopy } from "./date.js";
import { DEFAULT_DAILY_DEFEAT_LIMIT, normalizeDailyDefeatLimit } from "./daily-limit.js";

function hasActiveLock(status) {
  return Boolean(status?.isLocked && status.unlockDateKey);
}

function getDailyDefeatLimit(status) {
  return normalizeDailyDefeatLimit(status?.dailyDefeatLimit ?? DEFAULT_DAILY_DEFEAT_LIMIT);
}

function getTodayDefeatCount(status) {
  const count = Number.parseInt(status?.todayDefeatCount ?? 0, 10);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return count;
}

function formatDefeatWord(count) {
  return count === 1 ? "defeat" : "defeats";
}

function formatDefeatUsage(count, limit) {
  return `${count} of ${limit} ${formatDefeatWord(limit)} used`;
}

function shortenSourceUrl(sourceUrl) {
  if (!sourceUrl) {
    return "chess.com";
  }

  try {
    const parsedUrl = new URL(sourceUrl);
    const safePath = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
    return `${parsedUrl.hostname}${safePath}`;
  } catch {
    return "chess.com";
  }
}

export function buildPopupViewModel(status) {
  const dailyDefeatLimit = getDailyDefeatLimit(status);
  const todayDefeatCount = getTodayDefeatCount(status);

  if (!hasActiveLock(status)) {
    return {
      bodyState: "active",
      chipLabel: "Monitoring",
      title: "Ready for the next game",
      copy: `No Tilt Chess will lock Chess.com once you reach ${dailyDefeatLimit} ${formatDefeatWord(dailyDefeatLimit)} today.`,
      statusValue: formatDefeatUsage(todayDefeatCount, dailyDefeatLimit),
      unlockValue: "Not locked",
      accentLabel: "Daily defeat limit",
    };
  }

  return {
    bodyState: "locked",
    chipLabel: "Locked",
    title: "Daily cooldown is active",
    copy: "Today's defeat limit was reached. Chess.com stays blocked until the next local day.",
    statusValue: formatDefeatUsage(Math.max(todayDefeatCount, dailyDefeatLimit), dailyDefeatLimit),
    unlockValue: formatDateKeyForEnglishCopy(status.unlockDateKey),
    accentLabel: "Limit reached",
  };
}

export function buildBlockedPageViewModel({ status, sourceUrl }) {
  const sourceLabel = shortenSourceUrl(sourceUrl);

  if (!hasActiveLock(status)) {
    return {
      bodyState: "inactive",
      chipLabel: "Ready again",
      railStatus: "Access restored",
      headline: "The board is live again.",
      copy: "The daily lock has expired. Chess.com is available again.",
      coachCopy: "Fresh day, fresh session. Your defeat counter is back at zero.",
      unlockDate: "Available now",
      unlockLabel: "No active lock",
      sessionMeter: "No lock set",
      sourceLabel,
    };
  }

  const unlockDate = formatDateKeyForEnglishCopy(status.unlockDateKey);

  return {
    bodyState: "locked",
    chipLabel: "Locked for today",
    railStatus: "Daily limit reached",
    headline: "Tilt protection is on.",
    copy: "Today's defeat limit was reached on Chess.com. Step away now and come back tomorrow with a clean slate.",
    coachCopy: "Use the cooldown. Immediate rematches usually cost more than they win back.",
    unlockDate,
    unlockLabel: `Back on ${unlockDate}`,
    sessionMeter: "Daily limit reached",
    sourceLabel,
  };
}
