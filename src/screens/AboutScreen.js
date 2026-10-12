// screens/AboutScreen.js
// Route "/about": what FletBox is, its highlights and project links.

import { Row, Text, colors } from "flet-box";
import {
  APP_VERSION,
  DOCS_REPO_URL,
  DOCS_SITE_URL,
  FRAMEWORK_VERSION,
  GITHUB_URL,
} from "../constants.js";
import {
  intro,
  openExternal,
  page,
  rowCard,
  section,
  tag,
} from "../components/ui.js";

const HIGHLIGHTS = [
  ["block", "Zero runtime dependencies", "Ships as plain ESM — no framework, no polyfills, no lock-in."],
  ["functions", "Flet-like declarative API", "Compose UI from Widget({ … }) calls that map straight to the DOM."],
  ["sync", "Reactive state & router", "useState stores and a push-state Router keep views in sync."],
  ["layers", "One rendering engine", "WidgetFactory is the single source of truth for every widget."],
  ["cloud_sync", "OTA web updates", "Ship app changes without an app-store release, with safe fallback."],
  ["phone_iphone", "Android & iOS", "Capacitor packaging turns the same app into native builds."],
];

const TECH = ["Vanilla JS", "Web APIs", "ESM", "Capacitor", "esbuild", "Node ≥ 18"];

export const AboutScreen = () =>
  page([
    intro(
      `Framework version ${FRAMEWORK_VERSION}. A lightweight UI framework for building cross-platform apps with a declarative, Flet-inspired API in plain JavaScript.`,
    ),

    section({
      title: "Highlights",
      children: HIGHLIGHTS.map(([icon, title, text]) =>
        rowCard({ icon, title, subtitle: text, trailing: null }),
      ),
    }),

    section({
      title: "Built with",
      children: [
        Row({
          wrap: "wrap",
          gap: 8,
          children: TECH.map(tag),
        }),
      ],
    }),

    section({
      title: "Project & links",
      children: [
        rowCard({
          icon: "code",
          title: "GitHub repository",
          subtitle: "kuko53348/flet-box · framework source",
          trailing: "open_in_new",
          onPress: () => openExternal(GITHUB_URL),
        }),
        rowCard({
          icon: "language",
          title: "Documentation site",
          subtitle: "kuko53348.github.io/flet-box-docs",
          trailing: "open_in_new",
          onPress: () => openExternal(DOCS_SITE_URL),
        }),
        rowCard({
          icon: "folder",
          title: "Docs app repository",
          subtitle: "kuko53348/flet-box-docs",
          trailing: "open_in_new",
          onPress: () => openExternal(DOCS_REPO_URL),
        }),
      ],
    }),

    Text({
      text: `Docs app v${APP_VERSION} · Built with FletBox`,
      size: 11.5,
      align: "center",
      color: colors.textDisabled,
    }),
  ]);

export default AboutScreen;