import { evaluateLossSignals } from "../shared/loss-signals.js";

const ANALYZE_DELAY_MS = 300;

function inferPlayerColor(root) {
  if (
    root.querySelector(
      "[data-board-orientation='black'], .orientation-black, .board.flipped, .board.board-flipped",
    )
  ) {
    return "black";
  }

  if (
    root.querySelector(
      "[data-board-orientation='white'], .orientation-white, .board:not(.flipped)",
    )
  ) {
    return "white";
  }

  return "unknown";
}

async function requestBlockEnforcement() {
  return chrome.runtime.sendMessage({
    type: "ENFORCE_BLOCK_IF_NEEDED",
    url: window.location.href,
  });
}

function installNavigationHooks(onRouteChange) {
  const { pushState, replaceState } = window.history;

  window.history.pushState = function patchedPushState(...args) {
    const result = pushState.apply(this, args);
    void onRouteChange();
    return result;
  };

  window.history.replaceState = function patchedReplaceState(...args) {
    const result = replaceState.apply(this, args);
    void onRouteChange();
    return result;
  };

  window.addEventListener("popstate", () => {
    void onRouteChange();
  });
}

export async function bootstrapContentScript() {
  if (window.__NO_TILT_CHESS_BOOTSTRAPPED__) {
    return;
  }

  window.__NO_TILT_CHESS_BOOTSTRAPPED__ = true;

  let analysisTimer = null;
  let lossReported = false;

  async function enforceBlockIfNeeded() {
    const status = await requestBlockEnforcement();
    return Boolean(status?.shouldBlock);
  }

  async function analyzePage() {
    if (lossReported || !document.body) {
      return;
    }

    const evaluation = evaluateLossSignals({
      pageText: document.body.innerText,
      title: document.title,
      playerColor: inferPlayerColor(document),
    });

    if (!evaluation.shouldLock) {
      return;
    }

    lossReported = true;

    await chrome.runtime.sendMessage({
      type: "LOSS_DETECTED",
      url: window.location.href,
      evaluation,
    });
  }

  function scheduleAnalysis() {
    if (lossReported) {
      return;
    }

    clearTimeout(analysisTimer);
    analysisTimer = window.setTimeout(() => {
      void analyzePage();
    }, ANALYZE_DELAY_MS);
  }

  async function handleRouteChange() {
    if (await enforceBlockIfNeeded()) {
      return;
    }

    scheduleAnalysis();
  }

  if (await enforceBlockIfNeeded()) {
    return;
  }

  installNavigationHooks(handleRouteChange);

  const observer = new MutationObserver(() => {
    scheduleAnalysis();
  });

  const rootNode = document.documentElement ?? document;

  observer.observe(rootNode, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener("pageshow", () => {
    void handleRouteChange();
  });

  scheduleAnalysis();
}
