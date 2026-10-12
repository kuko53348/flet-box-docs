// screens/HomeScreen.js
// Landing route "/": uniform banner, category shortcuts and quick links.

import { Button, Container, Icon, Row, Text, colors, goTo } from "flet-box";
import { ALL_DOCS, CATEGORIES } from "../database/catalog.js";
import { APP_VERSION, FRAMEWORK_VERSION, GITHUB_URL } from "../constants.js";
import {
  intro,
  openExternal,
  page,
  rowCard,
  section,
} from "../components/ui.js";

const openCategory = (id) => goTo(`/docs?id=${encodeURIComponent(id)}`);

export const HomeScreen = () =>
  page([
    intro(
      `Vanilla-JS UI framework with a Flet-like declarative API · v${FRAMEWORK_VERSION} · zero dependencies. Build for web, Android and iOS with no build step.`,
    ),

    Row({
      wrap: "wrap",
      gap: 10,
      children: [
        Button({
          text: "Get started",
          icon: "rocket_launch",
          bgColor: colors.primary,
          color: "#ffffff",
          padding: "10px 18px",
          onPress: () => openCategory("start"),
        }),
        Button({
          text: "GitHub",
          icon: "code",
          variant: "outlined",
          color: colors.primary,
          padding: "10px 18px",
          onPress: () => openExternal(GITHUB_URL),
        }),
      ],
    }),

    section({
      title: "Browse by category",
      subtitle: `${CATEGORIES.length} categories · ${ALL_DOCS.length} documents`,
      children: [
        Row({
          wrap: "wrap",
          gap: 8,
          children: CATEGORIES.map((cat) =>
            Container({
              cursor: "pointer",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: `${colors.primary}14`,
              border: `1px solid ${colors.primary}55`,
              onClick: () => openCategory(cat.id),
              child: Row({
                gap: 8,
                alignItems: "center",
                children: [
                  Icon({ name: cat.icon, size: 16, color: colors.primary }),
                  Text({
                    text: cat.title,
                    size: 12.5,
                    weight: "600",
                    color: colors.text,
                  }),
                ],
              }),
            }),
          ),
        }),
      ],
    }),

    section({
      title: "Quick links",
      children: [
        rowCard({
          icon: "menu_book",
          title: "Documentation",
          subtitle: "Browse every widget, guide and service in this app.",
          onPress: () => goTo("/docs"),
        }),
        rowCard({
          icon: "info",
          title: "About FletBox",
          subtitle: "What the framework is, why it exists and what it includes.",
          onPress: () => goTo("/about"),
        }),
        rowCard({
          icon: "code",
          title: "Developer",
          subtitle: "The people behind the project and where the source lives.",
          onPress: () => goTo("/developer"),
        }),
        rowCard({
          icon: "campaign",
          title: "AdMob demo",
          subtitle: "Test ads on Android: banner, interstitial and rewarded.",
          onPress: () => goTo("/admob"),
        }),
      ],
    }),

    Text({
      text: `Made with FletBox · Docs app v${APP_VERSION}`,
      size: 11.5,
      align: "center",
      color: colors.textDisabled,
    }),
  ]);

export default HomeScreen;