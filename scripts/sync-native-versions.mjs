#!/usr/bin/env node
/**
 * @file sync-native-versions.mjs
 * @description Single-sources the native shell versions from package.json.
 *
 * The web bundle self-describes through `www/config.json`, but the Android and
 * iOS shells kept the numbers Capacitor scaffolded (`versionName "1.0"`,
 * `versionCode 1`). Once an app ships, those two fields are what the stores and
 * the OTA `minNativeVersion` gate compare against, so a stale value means a
 * release that looks like it downgraded the app on the device.
 *
 * Run it from the native sync scripts (see package.json) — it rewrites the two
 * project files in place and is idempotent.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);

const parts = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
if (!parts) {
  throw new Error(`package.json version "${version}" is not MAJOR.MINOR.PATCH`);
}
const [major, minor, patch] = parts.slice(1).map(Number);
// Monotonic for the odometer scheme (minor/patch 0-9) and still readable in
// the store consoles: 1.0.3 -> 10003, 1.2.7 -> 10207.
const buildCode = major * 10000 + minor * 100 + patch;

/**
 * Applies `rule` to a project file and reports what happened.
 *
 * @param {string} label   Human-readable file name for the log.
 * @param {string} file    Path inside the project.
 * @param {Array<[RegExp, string]>} rules  Ordered [pattern, replacement] pairs.
 */
const rewrite = async (label, file, rules) => {
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    throw new Error(
      `Missing ${label}. Run \`npm run android:init\` / \`npm run ios:init\` first.`,
    );
  }
  let out = source;
  for (const [pattern, replacement] of rules) {
    if (!pattern.test(out)) {
      throw new Error(`${label}: no field matching ${pattern} — the file layout changed.`);
    }
    out = out.replace(pattern, replacement);
  }
  if (out === source) {
    console.log(`= ${label} already at ${version} (${buildCode})`);
    return;
  }
  await writeFile(file, out);
  console.log(`✅ ${label} → ${version} (build ${buildCode})`);
};

await rewrite("android/app/build.gradle", path.join(projectRoot, "android/app/build.gradle"), [
  [/^([ \t]*)versionCode\s+\d+\s*$/m, `$1versionCode ${buildCode}`],
  [/^([ \t]*)versionName\s+"[^"]*"\s*$/m, `$1versionName "${version}"`],
]);

await rewrite("ios App.xcodeproj", path.join(projectRoot, "ios/App/App.xcodeproj/project.pbxproj"), [
  [/^([ \t]*)CURRENT_PROJECT_VERSION = \d+;$/gm, `$1CURRENT_PROJECT_VERSION = ${buildCode};`],
  [/^([ \t]*)MARKETING_VERSION = [\d.]+;$/gm, `$1MARKETING_VERSION = ${version};`],
]);
