// theme.js
// The docs app's brand, registered onto the framework's two palettes.
//
// `registerPalette` is the only entry point an app has for its own colors: it
// merges these tokens into the named palette and repaints when that palette is
// the one on screen. It never writes the theme preference, so light or dark is
// still decided by the reader — `runApp` boots `applySystemTheme()` and
// `watchSystemTheme()`, and the AppBar/drawer toggle calls `setTheme`. An app
// that called `setTheme("dark")` here would overwrite that choice on every load.
//
// Only what the brand claims is listed. The alert tints, the deep plates, the
// focus ring and the glass tokens stay framework values, so an upgrade moves
// this app's alerts and ring with every other app instead of keeping a local copy.
//
// Both palettes answer the same token names, and every pair below is measured
// with the WCAG ratio it ships (see the numbers on each line): text is ink on
// the page, `onPrimary` is ink on the `primary` plate.

import { registerPalette } from "flet-box";

// Light: the deep end of the teal, so one value works both ways — 5.90:1 with
// white on it as a plate, and 5.49:1 written as ink on the page. The soft tint
// keeps the page ink at 16.5:1 and the brand ink at 5.2:1.
const light = {
  primary: "#0a6f78",
  onPrimary: "#ffffff",
  primaryBg: "#e6f2f4",
  background: "#f4f7fa",
  surface: "#ffffff",
  card: "#ffffff",
  text: "#0b1120",
  textSecondary: "#475569",
  textDisabled: "#8b98ab",
  border: "#c8d2e0",
  divider: "#e2e8f0",
  gray50: "#f8fafc",
  gray100: "#eef2f7",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0b1120",
  overlay: "rgba(11, 17, 32, 0.55)",
  shadow: "rgba(11, 17, 32, 0.08)",
};

// Dark: the bright teal, which is too light to write words in on a white page
// and is exactly right here — 7.05:1 as ink on this page, and its plate takes
// the page's own near-black ink at 7.10:1. Content text is white and hierarchy
// comes from opacity, so nothing drifts to blue-grey: 0.72 answers 9.95:1 on the
// page and 9.29:1 on the card, and 0.5 still clears AA at 5.4:1.
const dark = {
  primary: "#00afbc",
  onPrimary: "#04121a",
  primaryBg: "#0e2a33",
  background: "#0b1120",
  surface: "#131c2e",
  card: "#131c2e",
  text: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.72)",
  textDisabled: "rgba(255, 255, 255, 0.5)",
  border: "#2e3f58",
  divider: "#223049",
  gray50: "#131c2e",
  gray100: "#1b2740",
  gray200: "#263349",
  gray300: "#3a4c68",
  gray400: "#7286a0",
  gray500: "#9badc4",
  gray600: "#c3d0e0",
  gray700: "#e8edf5",
  gray800: "#f2f6fb",
  gray900: "#ffffff",
  overlay: "rgba(2, 6, 15, 0.72)",
  shadow: "rgba(0, 0, 0, 0.45)",
};

// Registers both palettes. Call this before `runApp`: the boot reads the OS
// preference off `palettes`, so a palette registered after the first render
// would paint the framework's neutrals and only become the brand on the next
// theme change.
export const registerBrand = () => {
  registerPalette("light", light);
  registerPalette("dark", dark);
};

// The static shell — `<meta theme-color>` in index.html, `manifest.json`,
// `capacitor.config.json` and both `scripts/sync-*-*.mjs` — is painted before any
// module runs, so it cannot read a palette. All five carry the dark `surface`
// literal, `#131c2e`, and the engine rewrites `theme-color` to the live `surface`
// on every theme change: the boot color is what the reader sees for a frame, the
// sync is what they see after. Change `dark.surface` and change those five.
