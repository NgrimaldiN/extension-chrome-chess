import { formatDateKeyForEnglishCopy } from "./date.js";

function hasActiveLock(status) {
  return Boolean(status?.isLocked && status.unlockDateKey);
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
  if (!hasActiveLock(status)) {
    return {
      bodyState: "active",
      chipLabel: "Monitoring",
      title: "Ready for the next game",
      copy: "If Chess.com shows a loss today, No Tilt Chess will lock the site until tomorrow.",
      statusValue: "Watching for losses",
      unlockValue: "Not locked",
      accentLabel: "Loss cooldown",
    };
  }

  return {
    bodyState: "locked",
    chipLabel: "Locked",
    title: "Daily cooldown is active",
    copy: "A loss was detected today. Chess.com stays blocked until the next local day.",
    statusValue: "Cooldown running",
    unlockValue: formatDateKeyForEnglishCopy(status.unlockDateKey),
    accentLabel: "Loss detected",
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
      coachCopy: "Fresh day, fresh session. The counter is back at zero.",
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
    railStatus: "Daily cooldown active",
    headline: "Tilt protection is on.",
    copy: "A loss was detected on Chess.com. Step away now and come back tomorrow with a clean slate.",
    coachCopy: "Use the cooldown. Immediate rematches usually cost more than they win back.",
    unlockDate,
    unlockLabel: `Back on ${unlockDate}`,
    sessionMeter: "Daily limit reached",
    sourceLabel,
  };
}
