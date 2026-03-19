import { buildBlockedPageUrl, isChessUrl } from "../shared/chess-url.js";
import { formatDateKeyForFrenchCopy } from "../shared/date.js";
import { createDailyLock, getUnlockDateKey, isLockActive } from "../shared/lock-state.js";

const LOCK_STORAGE_KEY = "dailyLock";

async function readStoredLock() {
  const stored = await chrome.storage.local.get(LOCK_STORAGE_KEY);

  return stored[LOCK_STORAGE_KEY] ?? null;
}

async function clearStoredLock() {
  await chrome.storage.local.remove(LOCK_STORAGE_KEY);
}

async function readActiveLock(now = new Date()) {
  const lockState = await readStoredLock();

  if (!isLockActive(lockState, now)) {
    if (lockState) {
      await clearStoredLock();
    }

    return null;
  }

  return lockState;
}

function getBlockedPageUrl(sourceUrl = "") {
  return buildBlockedPageUrl(chrome.runtime.getURL("/"), sourceUrl);
}

function serializeLockStatus(lockState) {
  if (!lockState) {
    return {
      isLocked: false,
      lockState: null,
      unlockDateKey: null,
      unlockDateLabel: null,
    };
  }

  const unlockDateKey = getUnlockDateKey(lockState);

  return {
    isLocked: true,
    lockState,
    unlockDateKey,
    unlockDateLabel: unlockDateKey
      ? formatDateKeyForFrenchCopy(unlockDateKey)
      : null,
  };
}

async function resolveBlockStatus(url = "") {
  const lockState = await readActiveLock();

  if (!lockState || !isChessUrl(url)) {
    return {
      shouldBlock: false,
      blockedUrl: null,
      ...serializeLockStatus(lockState),
    };
  }

  return {
    shouldBlock: true,
    blockedUrl: getBlockedPageUrl(url),
    ...serializeLockStatus(lockState),
  };
}

async function redirectTabIfNeeded(tabId, url) {
  const status = await resolveBlockStatus(url);

  if (!status.shouldBlock) {
    return status;
  }

  await chrome.tabs.update(tabId, { url: status.blockedUrl });

  return status;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void (async () => {
    switch (message?.type) {
      case "LOSS_DETECTED": {
        let lockState = await readActiveLock();

        if (!lockState) {
          lockState = createDailyLock();
          await chrome.storage.local.set({ [LOCK_STORAGE_KEY]: lockState });
        }

        const response = {
          shouldBlock: true,
          blockedUrl: getBlockedPageUrl(message.url),
          ...serializeLockStatus(lockState),
        };

        if (sender.tab?.id) {
          await chrome.tabs.update(sender.tab.id, {
            url: response.blockedUrl,
          });
        }

        sendResponse(response);
        return;
      }

      case "SHOULD_BLOCK": {
        sendResponse(await resolveBlockStatus(message.url));
        return;
      }

      case "GET_LOCK_STATUS": {
        sendResponse(serializeLockStatus(await readActiveLock()));
        return;
      }

      default:
        sendResponse({ ok: false, error: "unknown-message" });
    }
  })().catch((error) => {
    console.error("[No Tilt Chess] service worker failure", error);
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url ?? tab.url;

  if (!targetUrl || !isChessUrl(targetUrl)) {
    return;
  }

  void redirectTabIfNeeded(tabId, targetUrl).catch((error) => {
    console.error("[No Tilt Chess] redirect failure", error);
  });
});
