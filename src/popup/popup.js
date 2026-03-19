import { buildPopupViewModel } from "../shared/ui-state.js";

function applyViewModel(viewModel) {
  document.body.dataset.state = viewModel.bodyState;

  document.getElementById("status-chip").textContent = viewModel.chipLabel;
  document.getElementById("hero-accent").textContent = viewModel.accentLabel;
  document.getElementById("status-title").textContent = viewModel.title;
  document.getElementById("status-copy").textContent = viewModel.copy;
  document.getElementById("status-value").textContent = viewModel.statusValue;
  document.getElementById("unlock-value").textContent = viewModel.unlockValue;
}

async function renderPopup() {
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });
  applyViewModel(buildPopupViewModel(status));
}

void renderPopup();
