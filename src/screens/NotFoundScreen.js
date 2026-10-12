// screens/NotFoundScreen.js
// Wildcard route "*": shown when a path has no match.

import { Button, Column, Text, colors, goTo } from "flet-box";
import { card, iconChip, page } from "../components/ui.js";
import { onPrimary } from "../theme.js";

export const NotFoundScreen = () =>
  page([
    card(
      Column({
        width: "100%",
        gap: 16,
        alignItems: "center",
        children: [
          iconChip("explore_off", colors.primary, 84),
          Text({
            text: "Page not found",
            weight: "bold",
            size: 20,
            color: colors.text,
          }),
          Text({
            text: "The page you are looking for does not exist or has moved.",
            size: 13,
            align: "center",
            color: colors.textSecondary,
            lineHeight: 1.5,
          }),
          Button({
            text: "Back to home",
            icon: "home",
            bgColor: colors.primary,
            color: onPrimary,
            padding: "11px 20px",
            onPress: () => goTo("/"),
          }),
        ],
      }),
      { alignItems: "center", padding: 24 },
    ),
  ]);

export default NotFoundScreen;