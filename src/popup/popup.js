import { formatDateKeyForEnglishCopy } from "../shared/date.js";

function setActiveState() {
  document.body.dataset.state = "active";

  document.getElementById("status-chip").textContent = "Active";
  document.getElementById("status-title").textContent = "Watching for losses";
  document.getElementById("status-copy").textContent =
    "The extension watches Chess.com and locks access after a single loss in the current day.";
  document.getElementById("status-value").textContent = "Active";
  document.getElementById("unlock-value").textContent = "Immediate";
}

function setLockedState(status) {
  document.body.dataset.state = "locked";

  document.getElementById("status-chip").textContent = "Locked";
  document.getElementById("status-title").textContent = "Access locked";
  document.getElementById("status-copy").textContent =
    "A loss has already been detected today. Chess.com will reopen automatically tomorrow.";
  document.getElementById("status-value").textContent = "Lock active";
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
