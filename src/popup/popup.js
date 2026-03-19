import { formatDateKeyForEnglishCopy } from "../shared/date.js";

function setActiveState() {
  document.body.dataset.state = "active";

  document.getElementById("status-chip").textContent = "Ready";
  document.getElementById("status-title").textContent = "Ready for the next game";
  document.getElementById("status-copy").textContent =
    "If Chess.com shows a loss today, No Tilt Chess will lock the site until tomorrow.";
  document.getElementById("status-value").textContent = "Watching";
  document.getElementById("unlock-value").textContent = "If needed";
}

function setLockedState(status) {
  document.body.dataset.state = "locked";

  document.getElementById("status-chip").textContent = "Locked";
  document.getElementById("status-title").textContent = "Locked for today";
  document.getElementById("status-copy").textContent =
    "A loss was detected today. Chess.com will reopen automatically tomorrow.";
  document.getElementById("status-value").textContent = "Daily lock active";
  document.getElementById("unlock-value").textContent = formatDateKeyForEnglishCopy(
    status.unlockDateKey,
  );
}

async function renderPopup() {
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

  if (!status?.isLocked || !status.unlockDateKey) {
    setActiveState();
    return;
  }

  setLockedState(status);
}

void renderPopup();
