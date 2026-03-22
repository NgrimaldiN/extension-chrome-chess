import { buildLossFingerprint, shouldReportLossFingerprint } from "../shared/content-detection.js";
import { evaluateLossSignals } from "../shared/loss-signals.js";

const ANALYZE_DELAY_MS = 300;
const LOCK_TRANSITION_MS = 2200;

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

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function injectTransitionStyles() {
  if (document.getElementById("no-tilt-transition-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "no-tilt-transition-style";
  style.textContent = `
    #no-tilt-transition {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top right, rgba(105, 146, 62, 0.18), transparent 28%),
        radial-gradient(circle at top left, rgba(78, 120, 55, 0.14), transparent 24%),
        rgba(44, 43, 41, 0.8);
      backdrop-filter: blur(14px);
      animation: no-tilt-fade-in 320ms ease-out both;
    }

    #no-tilt-transition * {
      box-sizing: border-box;
    }

    #no-tilt-transition .nt-card {
      width: min(100%, 448px);
      padding: 26px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Helvetica, Arial, sans-serif;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 28%),
        linear-gradient(180deg, rgba(75, 72, 71, 0.98), rgba(44, 43, 41, 0.98));
      box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.46),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    #no-tilt-transition .nt-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      border-radius: 14px;
      color: #ebf4df;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(67, 80, 50, 0.94);
      border: 1px solid rgba(88, 108, 62, 0.62);
      box-shadow:
        inset 0 -2px 0 rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    #no-tilt-transition .nt-chip::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #95bb55;
      box-shadow: 0 0 0 4px rgba(149, 187, 85, 0.12);
    }

    #no-tilt-transition h2 {
      margin: 16px 0 0;
      font-size: clamp(34px, 5vw, 48px);
      line-height: 0.98;
      letter-spacing: -0.03em;
      font-weight: 800;
    }

    #no-tilt-transition p {
      margin: 14px 0 0;
      color: rgba(255, 255, 255, 0.72);
      font-size: 16px;
      line-height: 1.6;
    }

    #no-tilt-transition .nt-progress {
      margin-top: 20px;
      height: 10px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    #no-tilt-transition .nt-progress-bar {
      height: 100%;
      width: 100%;
      transform-origin: left center;
      background: linear-gradient(90deg, #69923e, #4e7837);
      animation: no-tilt-progress ${LOCK_TRANSITION_MS}ms linear forwards;
    }

    #no-tilt-transition .nt-footnote {
      margin-top: 14px;
      color: rgba(255, 255, 255, 0.48);
      font-size: 13px;
      letter-spacing: 0.03em;
    }

    @keyframes no-tilt-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes no-tilt-progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      #no-tilt-transition,
      #no-tilt-transition .nt-progress-bar {
        animation: none !important;
      }
    }
  `;

  document.documentElement.append(style);
}

async function playLockTransition() {
  if (!document.body) {
    await wait(LOCK_TRANSITION_MS);
    return;
  }

  injectTransitionStyles();

  const existingOverlay = document.getElementById("no-tilt-transition");
  if (existingOverlay) {
    await wait(LOCK_TRANSITION_MS);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "no-tilt-transition";
  overlay.setAttribute("role", "alert");
  overlay.setAttribute("aria-live", "assertive");
  overlay.innerHTML = `
    <section class="nt-card" aria-label="Locking Chess.com for today">
      <div class="nt-chip">Cooldown started</div>
      <h2>Ending today's run...</h2>
      <p>A loss was detected on Chess.com. No Tilt Chess is locking the site for the rest of the day.</p>
      <div class="nt-progress" aria-hidden="true">
        <div class="nt-progress-bar"></div>
      </div>
      <p class="nt-footnote">Redirecting to your cooldown screen.</p>
    </section>
  `;

  document.body.append(overlay);
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  const shouldReduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  await wait(shouldReduceMotion ? 360 : LOCK_TRANSITION_MS);
}

export async function bootstrapContentScript() {
  if (window.__NO_TILT_CHESS_BOOTSTRAPPED__) {
    return;
  }

  window.__NO_TILT_CHESS_BOOTSTRAPPED__ = true;

  let analysisTimer = null;
  let lastReportedFingerprint = "";

  async function enforceBlockIfNeeded() {
    const status = await requestBlockEnforcement();
    return Boolean(status?.shouldBlock);
  }

  async function analyzePage() {
    if (!document.body) {
      return;
    }

    const pageText = document.body.innerText;
    const evaluation = evaluateLossSignals({
      pageText,
      title: document.title,
      playerColor: inferPlayerColor(document),
    });

    if (!evaluation.shouldLock) {
      lastReportedFingerprint = "";
      return;
    }

    const fingerprint = buildLossFingerprint({
      title: document.title,
      pageText,
    });

    if (
      !shouldReportLossFingerprint({
        fingerprint,
        lastReportedFingerprint,
      })
    ) {
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: "LOSS_DETECTED",
      url: window.location.href,
      evaluation,
      deferRedirect: true,
    });

    lastReportedFingerprint = fingerprint;

    if (!response?.shouldBlock) {
      return;
    }

    await playLockTransition();
    await requestBlockEnforcement();
  }

  function scheduleAnalysis() {
    clearTimeout(analysisTimer);
    analysisTimer = window.setTimeout(() => {
      void analyzePage();
    }, ANALYZE_DELAY_MS);
  }

  async function handleRouteChange() {
    lastReportedFingerprint = "";

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
