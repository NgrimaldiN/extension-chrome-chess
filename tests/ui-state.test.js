import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBlockedPageViewModel,
  buildPopupViewModel,
} from "../src/shared/ui-state.js";

test("buildPopupViewModel shows ready state when there is no active lock", () => {
  assert.deepEqual(buildPopupViewModel(null), {
    bodyState: "active",
    chipLabel: "Monitoring",
    title: "Ready for the next game",
    copy: "If Chess.com shows a loss today, No Tilt Chess will lock the site until tomorrow.",
    statusValue: "Watching for losses",
    unlockValue: "Not locked",
    accentLabel: "Loss cooldown",
  });
});

test("buildPopupViewModel shows lock timing when the day is locked", () => {
  assert.deepEqual(
    buildPopupViewModel({
      isLocked: true,
      unlockDateKey: "2026-03-20",
    }),
    {
      bodyState: "locked",
      chipLabel: "Locked",
      title: "Daily cooldown is active",
      copy: "A loss was detected today. Chess.com stays blocked until the next local day.",
      statusValue: "Cooldown running",
      unlockValue: "March 20, 2026",
      accentLabel: "Loss detected",
    },
  );
});

test("buildBlockedPageViewModel shows unlocked state and shortens the source url", () => {
  assert.deepEqual(
    buildBlockedPageViewModel({
      status: {
        isLocked: false,
      },
      sourceUrl: "https://www.chess.com/play/online",
    }),
    {
      bodyState: "inactive",
      chipLabel: "Ready again",
      railStatus: "Access restored",
      headline: "The board is live again.",
      copy: "The daily lock has expired. Chess.com is available again.",
      coachCopy: "Fresh day, fresh session. The counter is back at zero.",
      unlockDate: "Available now",
      unlockLabel: "No active lock",
      sessionMeter: "No lock set",
      sourceLabel: "www.chess.com/play/online",
    },
  );
});

test("buildBlockedPageViewModel shows locked state copy and formatted unlock date", () => {
  assert.deepEqual(
    buildBlockedPageViewModel({
      status: {
        isLocked: true,
        unlockDateKey: "2026-03-20",
      },
      sourceUrl: "",
    }),
    {
      bodyState: "locked",
      chipLabel: "Locked for today",
      railStatus: "Daily cooldown active",
      headline: "Tilt protection is on.",
      copy: "A loss was detected on Chess.com. Step away now and come back tomorrow with a clean slate.",
      coachCopy: "Use the cooldown. Immediate rematches usually cost more than they win back.",
      unlockDate: "March 20, 2026",
      unlockLabel: "Back on March 20, 2026",
      sessionMeter: "Daily limit reached",
      sourceLabel: "chess.com",
    },
  );
});
