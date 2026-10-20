#!/usr/bin/env node
/**
 * @file check-version.mjs
 * @description Fails the build when the version the app *shows* for itself stops
 * matching the version it was built with — the drift that made the site print
 * "Docs app v1.0.0" and "Framework v1.0.2" long after those numbers moved on.
 *
 * The framework version is only a warning: CI checks out flet-box@refactory, so
 * a framework release must never be able to block the docs site from publishing.
 *
 * Usage: node scripts/check-version.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const constants = fs.readFileSync(path.join(root, "src/constants.js"), "utf8");
const shown = (name) => constants.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`))?.[1];

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const frameworkPkg = JSON.parse(
  fs.readFileSync(path.join(root, "node_modules/flet-box/package.json"), "utf8"),
);

let failed = false;

if (shown("APP_VERSION") === pkg.version) {
  console.log(`✅ APP_VERSION = ${pkg.version}`);
} else {
  failed = true;
  console.error(
    `❌ APP_VERSION shows ${shown("APP_VERSION")} but package.json is ${pkg.version}`,
  );
}

if (shown("FRAMEWORK_VERSION") === frameworkPkg.version) {
  console.log(`✅ FRAMEWORK_VERSION = ${frameworkPkg.version}`);
} else {
  console.warn(
    `⚠️  FRAMEWORK_VERSION shows ${shown("FRAMEWORK_VERSION")} but the installed flet-box is ${frameworkPkg.version} — update src/constants.js when convenient.`,
  );
}

if (failed) process.exit(1);
