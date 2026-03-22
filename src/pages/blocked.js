import { formatCountdownUntilDateKey } from "../shared/date.js";
import { buildBlockedPageViewModel } from "../shared/ui-state.js";

let countdownTimerId = null;
let currentSourceUrl = "";
let unlockCheckInFlight = false;

function stopCountdown() {
  if (countdownTimerId !== null) {
    window.clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
}

function startCountdown(unlockDateKey) {
  const countdownValue = document.getElementById("countdown-value");

  const renderCountdown = () => {
    const countdownText = formatCountdownUntilDateKey(unlockDateKey);
    countdownValue.textContent = countdownText;

    if (countdownText === "00:00:00") {
      stopCountdown();
      void refreshAfterUnlock();
    }
  };

  renderCountdown();
  countdownTimerId = window.setInterval(renderCountdown, 1000);
}

async function refreshAfterUnlock() {
  if (unlockCheckInFlight) {
    return;
  }

  unlockCheckInFlight = true;

  try {
    const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

    if (status?.isLocked && status.unlockDateKey) {
      applyViewModel(buildBlockedPageViewModel({ status, sourceUrl: currentSourceUrl }));
      startCountdown(status.unlockDateKey);
      return;
    }

    if (currentSourceUrl) {
      window.location.replace(currentSourceUrl);
      return;
    }

    applyViewModel(buildBlockedPageViewModel({ status, sourceUrl: currentSourceUrl }));
    document.getElementById("countdown-value").textContent = "00:00:00";
  } finally {
    unlockCheckInFlight = false;
  }
}

function applyViewModel(viewModel) {
  document.body.dataset.state = viewModel.bodyState;

  document.getElementById("state-chip").textContent = viewModel.chipLabel;
  document.getElementById("countdown-label").textContent =
    viewModel.bodyState === "locked" ? "Unlocks in" : "Available now";
  document.getElementById("rail-status").textContent = viewModel.railStatus;
  document.getElementById("status-headline").textContent = viewModel.headline;
  document.getElementById("status-copy").textContent = viewModel.copy;
  document.getElementById("coach-copy").textContent = viewModel.coachCopy;
  document.getElementById("unlock-date").textContent = viewModel.unlockDate;
  document.getElementById("unlock-label").textContent = viewModel.unlockLabel;
  document.getElementById("source-url").textContent = viewModel.sourceLabel;
}

async function render() {
  const params = new URLSearchParams(window.location.search);
  currentSourceUrl = params.get("from") ?? "";
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });
  stopCountdown();

  applyViewModel(buildBlockedPageViewModel({ status, sourceUrl: currentSourceUrl }));

  if (status?.isLocked && status.unlockDateKey) {
    startCountdown(status.unlockDateKey);
    return;
  }

  document.getElementById("countdown-value").textContent = "00:00:00";
}

void render();
