import { formatDateKeyForFrenchCopy } from "../shared/date.js";

function setActiveState() {
  document.body.dataset.state = "active";

  document.getElementById("status-chip").textContent = "Actif";
  document.getElementById("status-title").textContent = "Surveillance active";
  document.getElementById("status-copy").textContent =
    "L'extension surveille Chess.com et verrouille l'accès après une seule défaite dans la journée.";
  document.getElementById("status-value").textContent = "Actif";
  document.getElementById("unlock-value").textContent = "Immédiat";
}

function setLockedState(status) {
  document.body.dataset.state = "locked";

  document.getElementById("status-chip").textContent = "Bloqué";
  document.getElementById("status-title").textContent = "Accès verrouillé";
  document.getElementById("status-copy").textContent =
    "Une défaite a déjà été détectée aujourd'hui. Chess.com reviendra automatiquement demain.";
  document.getElementById("status-value").textContent = "Verrou actif";
  document.getElementById("unlock-value").textContent = formatDateKeyForFrenchCopy(
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
