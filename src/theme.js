// theme.js
// The docs app ships dark-only: a single palette, no light mode and no toggle.
// The framework's built-in dark palette is used as the baseline, then refined
// here for deeper neutrals and legible secondary text.

import { colors, setTheme } from "flet-box";

// Text and icons placed on a `primary` fill. White only reaches 2.7:1 against
// the teal; this reaches 7.1:1.
export const onPrimary = "#04121a";

const PALETTE = {
  primary: "#00afbc",
  secondary: "#a78bfa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
  background: "#0b1120",
  surface: "#131c2e",
  card: "#131c2e",
  // Content text is white across the app; hierarchy comes from opacity, which
  // stays white instead of drifting to the blue-grey the palette used before.
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

// Applies the palette before the app renders, so every widget and the CSS
// custom properties agree on the same colors from the first paint.
export const applyTheme = () => {
  setTheme("dark");
  Object.assign(colors, PALETTE);
  for (const [key, value] of Object.entries(colors)) {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  }
  document.documentElement.style.colorScheme = "dark";
  return colors;
};
