import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const filesToCheck = [
  "src/background/service-worker.js",
  "src/content/entry.js",
  "src/content/bootstrap.js",
  "src/pages/blocked.js",
  "src/popup/popup.js",
  "src/shared/chess-url.js",
  "src/shared/date.js",
  "src/shared/lock-state.js",
  "src/shared/loss-signals.js",
  "tests/chess-url.test.js",
  "tests/date.test.js",
  "tests/lock-state.test.js",
  "tests/loss-signals.test.js",
];

JSON.parse(readFileSync("manifest.json", "utf8"));

for (const file of filesToCheck) {
  execFileSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
}

console.log(`Linted ${filesToCheck.length} JavaScript files and manifest.json`);
