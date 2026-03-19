import { buildBlockedPageViewModel } from "../shared/ui-state.js";

function applyViewModel(viewModel) {
  document.body.dataset.state = viewModel.bodyState;

  document.getElementById("state-chip").textContent = viewModel.chipLabel;
  document.getElementById("rail-status").textContent = viewModel.railStatus;
  document.getElementById("status-headline").textContent = viewModel.headline;
  document.getElementById("status-copy").textContent = viewModel.copy;
  document.getElementById("coach-copy").textContent = viewModel.coachCopy;
  document.getElementById("unlock-date").textContent = viewModel.unlockDate;
  document.getElementById("unlock-label").textContent = viewModel.unlockLabel;
  document.getElementById("session-meter").textContent = viewModel.sessionMeter;
  document.getElementById("source-url").textContent = viewModel.sourceLabel;
}

async function render() {
  const params = new URLSearchParams(window.location.search);
  const sourceUrl = params.get("from") ?? "";
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

  applyViewModel(buildBlockedPageViewModel({ status, sourceUrl }));
}

void render();
