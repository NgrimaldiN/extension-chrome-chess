import { formatDateKeyForFrenchCopy } from "../shared/date.js";

function shortenUrl(url) {
  if (!url) {
    return "chess.com";
  }

  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname}${parsedUrl.pathname}`;
  } catch {
    return "chess.com";
  }
}

async function render() {
  const params = new URLSearchParams(window.location.search);
  const sourceUrl = params.get("from") ?? "";
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

  const statusCopy = document.getElementById("status-copy");
  const unlockDate = document.getElementById("unlock-date");
  const source = document.getElementById("source-url");

  source.textContent = shortenUrl(sourceUrl);

  if (!status?.isLocked || !status.unlockDateKey) {
    statusCopy.textContent = "Le verrou quotidien n'est plus actif.";
    unlockDate.textContent = "Déjà disponible";
    return;
  }

  statusCopy.textContent =
    "Une défaite a été détectée aujourd'hui. Le site se rouvrira automatiquement demain.";
  unlockDate.textContent = formatDateKeyForFrenchCopy(status.unlockDateKey);
}

void render();
