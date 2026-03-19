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

  document.getElementById("state-chip").textContent = "Locked for today";
  document.getElementById("rail-status").textContent = "Daily lock active";
  document.getElementById("status-headline").textContent = "Today's session is over.";
  document.getElementById("status-copy").textContent =
    "A loss was detected on Chess.com. Take the reset now and come back tomorrow with a clean slate.";
  document.getElementById("coach-copy").textContent =
    "Use the cooldown. Quick rematches usually cost more than they give back.";
  document.getElementById("unlock-date").textContent = formatDateKeyForEnglishCopy(
    status.unlockDateKey,
  );
  document.getElementById("unlock-label").textContent =
    `Back on ${formatDateKeyForEnglishCopy(status.unlockDateKey)}`;
  document.getElementById("session-meter").textContent = "Daily limit reached";
}

function setInactiveState() {
  document.body.dataset.state = "inactive";

  document.getElementById("state-chip").textContent = "Ready again";
  document.getElementById("rail-status").textContent = "Access restored";
  document.getElementById("status-headline").textContent = "The board is live again.";
  document.getElementById("status-copy").textContent =
    "The daily lock has expired. Chess.com is available again.";
  document.getElementById("coach-copy").textContent =
    "Fresh day, fresh session. The counter is back at zero.";
  document.getElementById("unlock-date").textContent = "Available now";
  document.getElementById("unlock-label").textContent = "No active lock";
  document.getElementById("session-meter").textContent = "No lock set";
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
