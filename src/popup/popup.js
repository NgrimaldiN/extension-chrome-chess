import { buildPopupViewModel } from "../shared/ui-state.js";

const DAILY_DEFEAT_LIMIT_SELECT_ID = "daily-defeat-limit";
const LIMIT_NOTE_ID = "limit-note";
const MAX_DAILY_DEFEAT_LIMIT = 10;

function applyViewModel(viewModel) {
  document.body.dataset.state = viewModel.bodyState;

  document.getElementById("status-chip").textContent = viewModel.chipLabel;
  document.getElementById("hero-accent").textContent = viewModel.accentLabel;
  document.getElementById("status-title").textContent = viewModel.title;
  document.getElementById("status-copy").textContent = viewModel.copy;
  document.getElementById("status-value").textContent = viewModel.statusValue;
  document.getElementById("unlock-value").textContent = viewModel.unlockValue;
}

function formatDefeatOptionLabel(value) {
  return value === 1 ? "1 defeat" : `${value} defeats`;
}

function buildEditableLimitNote(status) {
  const todayDefeatCount = status?.todayDefeatCount ?? 0;
  const minimumEditableDailyDefeatLimit =
    status?.minimumEditableDailyDefeatLimit ?? 1;

  if (todayDefeatCount > 0) {
    return `You've already used ${todayDefeatCount} defeat${todayDefeatCount === 1 ? "" : "s"} today, so the limit cannot go below ${minimumEditableDailyDefeatLimit} until tomorrow.`;
  }

  return "You can change this anytime before cooldown starts.";
}

function applyLimitControl(status) {
  const select = document.getElementById(DAILY_DEFEAT_LIMIT_SELECT_ID);
  const note = document.getElementById(LIMIT_NOTE_ID);
  const minimumEditableDailyDefeatLimit =
    status?.minimumEditableDailyDefeatLimit ?? 1;
  const dailyDefeatLimit = Math.max(
    minimumEditableDailyDefeatLimit,
    status?.dailyDefeatLimit ?? 1,
  );

  select.replaceChildren();

  for (
    let optionValue = minimumEditableDailyDefeatLimit;
    optionValue <= MAX_DAILY_DEFEAT_LIMIT;
    optionValue += 1
  ) {
    const option = document.createElement("option");
    option.value = String(optionValue);
    option.textContent = formatDefeatOptionLabel(optionValue);
    select.append(option);
  }

  select.value = String(dailyDefeatLimit);
  select.disabled = !status?.canEditDailyDefeatLimit;
  note.textContent = status?.canEditDailyDefeatLimit
    ? buildEditableLimitNote(status)
    : "This setting unlocks again tomorrow because cooldown is active.";
}

async function renderPopup() {
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });
  applyViewModel(buildPopupViewModel(status));
  applyLimitControl(status);
}

document.getElementById(DAILY_DEFEAT_LIMIT_SELECT_ID).addEventListener("change", async (event) => {
  const response = await chrome.runtime.sendMessage({
    type: "SET_DAILY_DEFEAT_LIMIT",
    dailyDefeatLimit: Number(event.currentTarget.value),
  });

  applyViewModel(buildPopupViewModel(response));
  applyLimitControl(response);
});

void renderPopup();
