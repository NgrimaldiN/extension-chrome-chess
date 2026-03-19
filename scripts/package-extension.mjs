import { cpSync, mkdirSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const version = manifest.version;

const distRoot = resolve("dist");
const bundleName = "no-tilt-chess";
const bundleRoot = join(distRoot, bundleName);
const zipName = `${bundleName}-v${version}.zip`;
const zipPath = join(distRoot, zipName);

rmSync(bundleRoot, { recursive: true, force: true });
rmSync(zipPath, { force: true });

mkdirSync(join(bundleRoot, "assets", "icons"), { recursive: true });

copyFileSync("manifest.json", join(bundleRoot, "manifest.json"));
cpSync("src", join(bundleRoot, "src"), { recursive: true });

for (const size of [16, 32, 48, 128]) {
  copyFileSync(
    join("assets", "icons", `icon-${size}.png`),
    join(bundleRoot, "assets", "icons", `icon-${size}.png`),
  );
}

execFileSync("zip", ["-qr", zipName, bundleName], {
  cwd: distRoot,
  stdio: "inherit",
});

console.log(`Packaged ${zipPath}`);
