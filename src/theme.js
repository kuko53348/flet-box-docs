// theme.js
// The docs app's brand, and why it is an accent rather than a palette.
//
// `registerPalette` answers what a theme *is*: the page, the ink, the hairlines,
// the gray ladder. This app claims none of that — every surface is the
// framework's own light and dark palette, so an upgrade moves the site the way it
// moves every other app. The one thing it decides is the hue its buttons, icons
// and links wear, and that is exactly what the accent layer owns: `primary`,
// `onPrimary` and `primaryBg`.
//
// So the brand arrives as one call instead of a table of hexes. Three things
// follow from that:
//   - the family is measured before it ships — the label on the fill, the fill as
//     text and as a glyph, its wash under page ink and secondary ink, and the
//     wash's lift off the page, seven numbers per theme, re-measured by the
//     framework's own `tests/regression.test.js` — so nothing here has to
//     re-prove them with a comment;
//   - the reader can change it. The drawer's `ThemePicker` paints another family
//     and stores that choice, and `applyAccentPreference` never overwrites one;
//   - light and dark stay the reader's answer. `runApp` boots `applySystemTheme()`
//     and `watchSystemTheme()`, the AppBar and drawer toggles call `setTheme`, and
//     an app that called `setTheme("dark")` here would erase that on every load.
//
// A brand the twelve families do not carry is registered, not typed:
// `registerAccent` with an id, a label and a `light`/`dark` pair — one hex per
// theme, or a five-stop ramp — beside this call, and the id below points at it.

import { applyAccentPreference } from "flet-box";

// Teal: `#134e4a` on a light page, `#2dd4bf` on a dark one — the two stops the
// engine paints for the family. Call this before `runApp`, like the palette
// registration it replaces: the first screen should not open in the framework's
// own brand and change color a frame later.
export const applyBrand = () => applyAccentPreference("teal");

// The static shell — `<meta theme-color>` in index.html, `manifest.json`,
// `capacitor.config.json` and both `scripts/sync-*-*.mjs` — is painted before any
// module runs, so it cannot read a palette. All five carry the framework dark
// palette's `surface`, `#18181b` (RGB 24, 24, 27), which is the panel the app
// boots into; the engine rewrites `theme-color` to the live `surface` on every
// theme change, so the boot value is only the frame in between. No accent lives in
// the shell: a shell color is a surface, and this app has no surface the
// framework does not already ship.
