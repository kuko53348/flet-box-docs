// constants.js
// Central place for the URLs and versions shown throughout the app.
//
// FRAMEWORK_VERSION is the published `flet-box` release this site's docs
// describe; APP_VERSION is this site's own version and must match
// package.json, which is what stamps the bundle and the release tag.
// Both are literals because the dev server loads these modules straight from
// disk with an import map — nothing reads package.json at runtime.

export const FRAMEWORK_VERSION = "1.1.1";
export const APP_VERSION = "1.0.4";

export const GITHUB_URL = "https://github.com/kuko53348/flet-box";
export const GITHUB_PROFILE_URL = "https://github.com/kuko53348";
export const DOCS_REPO_URL = "https://github.com/kuko53348/flet-box-docs";
export const DOCS_SITE_URL = "https://kuko53348.github.io/flet-box-docs/";

export const DEVELOPER = {
  handle: "kuko53348",
  role: "Creator & lead developer of FletBox",
  bio: "Independent developer building FletBox as a zero-dependency, vanilla-JS alternative to Flet — designed to ship real apps on web, Android and iOS.",
};