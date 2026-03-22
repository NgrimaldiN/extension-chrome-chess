import { buildBlockedPageUrl, isChessUrl } from "../shared/chess-url.js";
import { formatDateKeyForEnglishCopy } from "../shared/date.js";
import {
  DEFAULT_DAILY_DEFEAT_LIMIT,
  MAX_DAILY_DEFEAT_LIMIT,
  getCurrentDailyProgress,
  normalizeDailyDefeatLimit,
  recordDetectedLoss,
} from "../shared/daily-limit.js";
import { createDailyLock, getUnlockDateKey, isLockActive } from "../shared/lock-state.js";

const LOCK_STORAGE_KEY = "dailyLock";
const DAILY_PROGRESS_STORAGE_KEY = "dailyProgress";
const SETTINGS_STORAGE_KEY = "settings";

async function readStoredLock() {
  const stored = await chrome.storage.local.get(LOCK_STORAGE_KEY);

  return stored[LOCK_STORAGE_KEY] ?? null;
}

async function readStoredProgress() {
  const stored = await chrome.storage.local.get(DAILY_PROGRESS_STORAGE_KEY);

  return stored[DAILY_PROGRESS_STORAGE_KEY] ?? null;
}

async function readStoredSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);

  return stored[SETTINGS_STORAGE_KEY] ?? null;
}

async function clearStoredLock() {
  await chrome.storage.local.remove(LOCK_STORAGE_KEY);
}

async function clearStoredProgress() {
  await chrome.storage.local.remove(DAILY_PROGRESS_STORAGE_KEY);
}

async function writeStoredProgress(progress) {
  await chrome.storage.local.set({ [DAILY_PROGRESS_STORAGE_KEY]: progress });
}

function normalizeSettings(settings) {
  return {
    dailyDefeatLimit: normalizeDailyDefeatLimit(settings?.dailyDefeatLimit),
  };
}

async function writeStoredSettings(settings) {
  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: normalizeSettings(settings),
  });
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

async function readCurrentProgress(now = new Date()) {
  const storedProgress = await readStoredProgress();
  const currentProgress = getCurrentDailyProgress(storedProgress, now);

  if (storedProgress && storedProgress.dateKey !== currentProgress.dateKey) {
    await clearStoredProgress();
  }

  return currentProgress;
}

async function readSettings() {
  return normalizeSettings(await readStoredSettings());
}

async function readRuntimeState(now = new Date()) {
  const [lockState, progress, settings] = await Promise.all([
    readActiveLock(now),
    readCurrentProgress(now),
    readSettings(),
  ]);

  return {
    lockState,
    progress,
    settings,
  };
}

function getBlockedPageUrl(sourceUrl = "") {
  return buildBlockedPageUrl(chrome.runtime.getURL("/"), sourceUrl);
}

function serializeRuntimeState({ lockState, progress, settings }) {
  const normalizedSettings = normalizeSettings(settings);
  const normalizedProgress = getCurrentDailyProgress(progress);
  const dailyDefeatLimit = normalizedSettings.dailyDefeatLimit;
  const todayDefeatCount = normalizedProgress.defeatCount;
  const minimumEditableDailyDefeatLimit = Math.min(
    MAX_DAILY_DEFEAT_LIMIT,
    Math.max(DEFAULT_DAILY_DEFEAT_LIMIT, todayDefeatCount + 1),
  );

  if (!lockState) {
    return {
      isLocked: false,
      lockState: null,
      unlockDateKey: null,
      unlockDateLabel: null,
      todayDefeatCount,
      dailyDefeatLimit,
      remainingDefeats: Math.max(0, dailyDefeatLimit - todayDefeatCount),
      canEditDailyDefeatLimit: true,
      minimumEditableDailyDefeatLimit,
    };
  }

  const unlockDateKey = getUnlockDateKey(lockState);

  return {
    isLocked: true,
    lockState,
    unlockDateKey,
    unlockDateLabel: unlockDateKey
      ? formatDateKeyForEnglishCopy(unlockDateKey)
      : null,
    todayDefeatCount: Math.max(todayDefeatCount, dailyDefeatLimit),
    dailyDefeatLimit,
    remainingDefeats: 0,
    canEditDailyDefeatLimit: false,
    minimumEditableDailyDefeatLimit: dailyDefeatLimit,
  };
}

async function resolveBlockStatus(url = "") {
  const runtimeState = await readRuntimeState();
  const { lockState } = runtimeState;

  if (!lockState || !isChessUrl(url)) {
    return {
      shouldBlock: false,
      blockedUrl: null,
      ...serializeRuntimeState(runtimeState),
    };
  }

  return {
    shouldBlock: true,
    blockedUrl: getBlockedPageUrl(url),
    ...serializeRuntimeState(runtimeState),
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
        const runtimeState = await readRuntimeState();
        let { lockState } = runtimeState;

        if (lockState) {
          const response = {
            shouldBlock: true,
            blockedUrl: getBlockedPageUrl(message.url),
            ...serializeRuntimeState(runtimeState),
          };

          if (sender.tab?.id && !message.deferRedirect) {
            await chrome.tabs.update(sender.tab.id, {
              url: response.blockedUrl,
            });
          }

          sendResponse(response);
          return;
        }

        const lossOutcome = recordDetectedLoss({
          progress: runtimeState.progress,
          dailyDefeatLimit: runtimeState.settings.dailyDefeatLimit,
        });

        await writeStoredProgress(lossOutcome.progress);

        if (lossOutcome.reachedLimit) {
          lockState = createDailyLock();
          await chrome.storage.local.set({ [LOCK_STORAGE_KEY]: lockState });
        }

        const response = {
          shouldBlock: Boolean(lossOutcome.reachedLimit),
          blockedUrl: lossOutcome.reachedLimit ? getBlockedPageUrl(message.url) : null,
          ...serializeRuntimeState({
            lockState,
            progress: lossOutcome.progress,
            settings: runtimeState.settings,
          }),
        };

        if (sender.tab?.id && response.shouldBlock && !message.deferRedirect) {
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

      case "ENFORCE_BLOCK_IF_NEEDED": {
        if (sender.tab?.id) {
          sendResponse(await redirectTabIfNeeded(sender.tab.id, message.url));
          return;
        }

        sendResponse(await resolveBlockStatus(message.url));
        return;
      }

      case "GET_LOCK_STATUS": {
        sendResponse(serializeRuntimeState(await readRuntimeState()));
        return;
      }

      case "SET_DAILY_DEFEAT_LIMIT": {
        const runtimeState = await readRuntimeState();

        if (runtimeState.lockState) {
          sendResponse({
            ok: false,
            error: "cooldown-active",
            ...serializeRuntimeState(runtimeState),
          });
          return;
        }

        const requestedLimit = normalizeDailyDefeatLimit(message.dailyDefeatLimit);
        const minimumEditableDailyDefeatLimit = Math.min(
          MAX_DAILY_DEFEAT_LIMIT,
          Math.max(DEFAULT_DAILY_DEFEAT_LIMIT, runtimeState.progress.defeatCount + 1),
        );

        if (requestedLimit < minimumEditableDailyDefeatLimit) {
          sendResponse({
            ok: false,
            error: "limit-too-low",
            ...serializeRuntimeState(runtimeState),
          });
          return;
        }

        const settings = {
          dailyDefeatLimit: requestedLimit,
        };

        await writeStoredSettings(settings);

        sendResponse({
          ok: true,
          ...serializeRuntimeState({
            ...runtimeState,
            settings,
          }),
        });
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
