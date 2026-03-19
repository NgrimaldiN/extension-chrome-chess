import { formatDateKeyForFrenchCopy } from "../shared/date.js";

async function renderPopup() {
  const status = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATUS" });

  const statusTitle = document.getElementById("status-title");
  const statusCopy = document.getElementById("status-copy");
  const statusValue = document.getElementById("status-value");
  const unlockValue = document.getElementById("unlock-value");

  if (!status?.isLocked || !status.unlockDateKey) {
    statusTitle.textContent = "Surveillance active";
    statusCopy.textContent =
      "L'extension surveille Chess.com et verrouille l'accès apres une defaite dans la journee.";
    statusValue.textContent = "Actif";
    unlockValue.textContent = "Immediat";
    return;
  }

  statusTitle.textContent = "Acces bloque";
  statusCopy.textContent =
    "Une defaite a deja ete detectee aujourd'hui. Le site redeviendra disponible automatiquement demain.";
  statusValue.textContent = "Bloque";
  unlockValue.textContent = formatDateKeyForFrenchCopy(status.unlockDateKey);
}

void renderPopup();
