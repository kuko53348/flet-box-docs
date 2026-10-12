// screens/DeveloperScreen.js
// Route "/developer": who builds FletBox and where the source lives.

import { Column, Container, Row, Text, colors } from "flet-box";
import {
  DOCS_REPO_URL,
  GITHUB_PROFILE_URL,
  GITHUB_URL,
  DEVELOPER,
} from "../constants.js";
import {
  banner,
  card,
  openExternal,
  page,
  rowCard,
  section,
} from "../components/ui.js";

// Initials avatar used as the identity card's leading node.
const avatar = (initials) =>
  Container({
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    child: Text({ text: initials, weight: "bold", size: 18, color: "#ffffff" }),
  });

export const DeveloperScreen = () =>
  page([
    card(
      Column({
        gap: 14,
        children: [
          Row({
            gap: 14,
            alignItems: "center",
            children: [
              avatar("ku"),
              Column({
                gap: 3,
                children: [
                  Text({ text: DEVELOPER.handle, weight: "bold", size: 16, color: colors.text }),
                  Text({ text: DEVELOPER.role, size: 12, color: colors.textSecondary }),
                ],
              }),
            ],
          }),
          Text({
            text: DEVELOPER.bio,
            size: 13,
            lineHeight: 1.6,
            color: colors.textSecondary,
          }),
        ],
      }),
    ),

    section({
      title: "Profiles",
      children: [
        rowCard({
          icon: "account_circle",
          title: "GitHub",
          subtitle: `github.com/${DEVELOPER.handle}`,
          trailing: "open_in_new",
          onPress: () => openExternal(GITHUB_PROFILE_URL),
        }),
      ],
    }),

    section({
      title: "Repositories",
      children: [
        rowCard({
          icon: "code",
          title: "flet-box",
          subtitle: "The framework — widgets, rendering engine, CLI and OTA.",
          trailing: "open_in_new",
          onPress: () => openExternal(GITHUB_URL),
        }),
        rowCard({
          icon: "folder",
          title: "flet-box-docs",
          subtitle: "This documentation app, built with FletBox itself.",
          trailing: "open_in_new",
          onPress: () => openExternal(DOCS_REPO_URL),
        }),
      ],
    }),

    banner({
      icon: "favorite",
      title: "Get involved",
      text: "FletBox is open source. Star the repository, report issues and send pull requests — every contribution helps the framework grow.",
    }),

    Text({
      text: `Maintained by ${DEVELOPER.handle}`,
      size: 11.5,
      align: "center",
      color: colors.textDisabled,
    }),
  ]);

export default DeveloperScreen;