import { formatDateKeyForEnglishCopy } from "../shared/date.js";

function shortenUrl(url) {
  if (!url) {
    return "chess.com";
  }

  try {
    const parsedUrl = new URL(url);
    const safePath = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
    return `${parsedUrl.hostname}${safePath}`;
  } catch {
    return "chess.com";
  }
}

function setLockedState(status) {
  document.body.dataset.state = "locked";

  document.getElementById("state-chip").textContent = "Session locked";
  document.getElementById("rail-status").textContent = "Lock active";
  document.getElementById("status-headline").textContent = "We stop the session here.";
  document.getElementById("status-copy").textContent =
    "A loss was detected today. The site will reopen automatically tomorrow when the local day changes.";
  document.getElementById("coach-copy").textContent =
    "The best rematch is often the one you skip while tilted. The streak ends here, and the next session starts clean.";
  document.getElementById("unlock-date").textContent = formatDateKeyForEnglishCopy(
    status.unlockDateKey,
  );
  document.getElementById("unlock-label").textContent =
    `Unlocks on ${formatDateKeyForEnglishCopy(status.unlockDateKey)}`;
  document.getElementById("session-meter").textContent = "0 / 1 games left today";
}

function setInactiveState() {
  document.body.dataset.state = "inactive";

  document.getElementById("state-chip").textContent = "Lock cleared";
  document.getElementById("rail-status").textContent = "Access available";
  document.getElementById("status-headline").textContent = "The session is open again.";
  document.getElementById("status-copy").textContent =
    "The daily lock is no longer active. Chess.com is available again.";
  document.getElementById("coach-copy").textContent =
    "You are starting a new local day. The counter is back to zero.";
  document.getElementById("unlock-date").textContent = "Available now";
  document.getElementById("unlock-label").textContent = "Access restored immediately";
  document.getElementById("session-meter").textContent = "Access available";
}

async function render() {
  const params = new URLSearchParams(window.location.search);
  const sourceUrl = params.get("from") ?? "";
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

  document.getElementById("source-url").textContent = shortenUrl(sourceUrl);

  if (!status?.isLocked || !status.unlockDateKey) {
    setInactiveState();
    return;
  }

  setLockedState(status);
}

void render();
