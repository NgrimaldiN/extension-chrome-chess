import { formatDateKeyForFrenchCopy } from "../shared/date.js";

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

  document.getElementById("state-chip").textContent = "Session verrouillée";
  document.getElementById("rail-status").textContent = "Verrou actif";
  document.getElementById("status-headline").textContent = "On coupe la session ici.";
  document.getElementById("status-copy").textContent =
    "Une défaite a été détectée aujourd'hui. Le site reviendra automatiquement demain, quand la journée locale changera.";
  document.getElementById("coach-copy").textContent =
    "Le meilleur rematch est souvent celui qu'on ne joue pas à chaud. La série s'arrête ici, la prochaine session repartira propre.";
  document.getElementById("unlock-date").textContent = formatDateKeyForFrenchCopy(
    status.unlockDateKey,
  );
  document.getElementById("unlock-label").textContent =
    `Réouverture le ${formatDateKeyForFrenchCopy(status.unlockDateKey)}`;
  document.getElementById("session-meter").textContent = "0 / 1 restante aujourd'hui";
}

function setInactiveState() {
  document.body.dataset.state = "inactive";

  document.getElementById("state-chip").textContent = "Verrou levé";
  document.getElementById("rail-status").textContent = "Accès disponible";
  document.getElementById("status-headline").textContent = "La session est de nouveau ouverte.";
  document.getElementById("status-copy").textContent =
    "Le verrou quotidien n'est plus actif. Chess.com est à nouveau accessible.";
  document.getElementById("coach-copy").textContent =
    "Tu repars sur un nouveau jour local. Le compteur est revenu à zéro.";
  document.getElementById("unlock-date").textContent = "Déjà disponible";
  document.getElementById("unlock-label").textContent = "Accès rétabli immédiatement";
  document.getElementById("session-meter").textContent = "Accès disponible";
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
