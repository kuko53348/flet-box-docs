// components/ui.js
// Uniform design kit shared by every screen. Screens are composed from the same
// primitives (page → banner → section → card/rowCard) so spacing, radii,
// typography and accent color stay identical across the whole app.

import {
  Column,
  Container,
  Icon,
  Row,
  Text,
  colors,
} from "flet-box";

// Open a URL in the system browser on native (Capacitor) or a new tab on web.
export const openExternal = (url) => {
  const target =
    typeof globalThis.Capacitor?.isNativePlatform === "function" &&
    globalThis.Capacitor.isNativePlatform()
      ? "_system"
      : "_blank";
  window.open(url, target, "noopener,noreferrer");
};

// An icon inside a tinted rounded chip.
export const iconChip = (name, color = colors.primary, size = 40) =>
  Container({
    width: size,
    height: size,
    borderRadius: size / 3,
    backgroundColor: `${color}1f`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    child: Icon({ name, color, size: Math.round(size * 0.55) }),
  });

// Uniform page wrapper: identical padding and vertical rhythm everywhere.
export const page = (children) =>
  Column({
    width: "100%",
    gap: 20,
    padding: "20px 16px 40px 16px",
    children,
  });

// Muted paragraph used as the uniform page intro (replaces the old top banner).
export const intro = (text) =>
  Text({
    text,
    size: 13.5,
    color: colors.textSecondary,
    lineHeight: 1.6,
  });

// Standard accent banner used as the header of every screen.
export const banner = ({ icon, iconNode, title, text, actions } = {}) =>
  Container({
    width: "100%",
    padding: 20,
    gap: 14,
    borderRadius: 18,
    backgroundColor: `${colors.primary}12`,
    border: `1px solid ${colors.primary}40`,
    children: [
      Row({
        gap: 14,
        alignItems: "center",
        children: [
          iconNode || iconChip(icon, colors.primary, 46),
          Column({
            flex: 1,
            gap: 3,
            children: [
              Text({ text: title, weight: "bold", size: 19, color: colors.text }),
              text
                ? Text({
                    text,
                    size: 12.5,
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  })
                : null,
            ].filter(Boolean),
          }),
        ],
      }),
      actions ? Row({ wrap: "wrap", gap: 10, children: actions }) : null,
    ].filter(Boolean),
  });

export const sectionTitle = (text, subtitle) =>
  Column({
    gap: 4,
    children: [
      Text({ text, weight: "bold", size: 18, color: colors.text }),
      subtitle
        ? Text({
            text: subtitle,
            size: 13,
            color: colors.textSecondary,
            lineHeight: 1.5,
          })
        : null,
    ].filter(Boolean),
  });

// A titled block: heading + uniformly spaced content.
export const section = ({ title, subtitle, children } = {}) =>
  Column({
    gap: 12,
    children: [
      title ? sectionTitle(title, subtitle) : null,
      Column({ gap: 10, children }),
    ].filter(Boolean),
  });

// Uniform surface card.
export const card = (children, { padding = 16, gap = 12, onClick, alignItems } = {}) =>
  Container({
    width: "100%",
    padding,
    gap,
    alignItems,
    borderRadius: 16,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    cursor: onClick ? "pointer" : undefined,
    onClick,
    children,
  });

// Tappable list row used across every list (docs, quick links, links).
export const rowCard = ({ icon, title, subtitle, onPress, trailing = "chevron_right" } = {}) =>
  card(
    Row({
      gap: 12,
      alignItems: "center",
      children: [
        iconChip(icon, colors.primary, 38),
        Column({
          flex: 1,
          gap: 2,
          children: [
            Text({ text: title, weight: "bold", size: 14.5, color: colors.text }),
            subtitle
              ? Text({
                  text: subtitle,
                  size: 11.5,
                  color: colors.textSecondary,
                  lineHeight: 1.4,
                })
              : null,
          ].filter(Boolean),
        }),
        trailing
          ? Icon({ name: trailing, color: colors.textSecondary, size: 20 })
          : null,
      ].filter(Boolean),
    }),
    { padding: "12px 14px", onClick: onPress },
  );

// Small accent pill (tech tags, counts).
export const tag = (text) =>
  Container({
    padding: "8px 14px",
    borderRadius: 999,
    backgroundColor: `${colors.primary}14`,
    border: `1px solid ${colors.primary}44`,
    child: Text({ text, size: 12.5, weight: "600", color: colors.primary }),
  });

// Compact back link, styled to match the rest of the kit.
export const breadcrumbBack = (label, onPress) =>
  Container({
    alignSelf: "flex-start",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: 12,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    onClick: onPress,
    child: Row({
      gap: 6,
      alignItems: "center",
      children: [
        Icon({ name: "arrow_back", size: 16, color: colors.primary }),
        Text({ text: label, size: 12.5, color: colors.primary, weight: "600" }),
      ],
    }),
  });