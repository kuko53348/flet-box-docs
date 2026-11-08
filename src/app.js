// app.js
// Application shell: a Scaffold in router mode wires the AppBar, Drawer and
// BottomNavigation around every screen. Navigation is driven entirely by the
// Router, so browser back/forward (and the Android hardware back button) work
// out of the box.

import {
  runApp,
  Button,
  Container,
  Drawer,
  DrawerItem,
  Icon,
  Scaffold,
  AppBar,
  BottomNavigation,
  Row,
  Text,
  ThemePicker,
  Tooltip,
  colors,
  getCurrentPath,
  getTheme,
  goTo,
  listAccents,
  toggleTheme,
  useQueryParams,
} from "flet-box";

import { applyBrand } from "./theme.js";
import { getCategory } from "./database/catalog.js";
import {
  APP_VERSION,
  DEVELOPER,
  FRAMEWORK_VERSION,
  GITHUB_URL,
} from "./constants.js";
import { openExternal } from "./components/ui.js";
import { bindDocLinks, docLabel } from "./lib/docs.js";

import { HomeScreen } from "./screens/HomeScreen.js";
import { DocsScreen } from "./screens/DocsScreen.js";
import { DocViewerScreen } from "./screens/DocViewerScreen.js";
import { AboutScreen } from "./screens/AboutScreen.js";
import { DeveloperScreen } from "./screens/DeveloperScreen.js";
import { AdMobDemoScreen } from "./screens/AdMobDemoScreen.js";
import { NotFoundScreen } from "./screens/NotFoundScreen.js";

// Register the delegated markdown-link handler once.
bindDocLinks();

// ---------- Routes ----------
// The documentation index lives at /documentation, not /docs: a root-level
// docs/ folder holds the markdown, so a /docs route would resolve to that
// directory and 404 on refresh or deep link instead of reaching the SPA.
const ROUTES = {
  "/": HomeScreen,
  "/documentation": DocsScreen,
  "/doc": DocViewerScreen,
  "/about": AboutScreen,
  "/developer": DeveloperScreen,
  "/admob": AdMobDemoScreen,
  "*": NotFoundScreen,
};

const ROUTE_TITLES = {
  "/": "FletBox Docs",
  "/about": "About",
  "/developer": "Developer",
  "/admob": "AdMob Demo",
};

const resolveTitle = () => {
  const path = getCurrentPath();

  if (path === "/documentation") {
    const { id } = useQueryParams();
    const category = id ? getCategory(id) : null;
    return category ? category.title : "Documentation";
  }
  if (path === "/doc") {
    const { name, path: docPath } = useQueryParams();
    return name || (docPath ? docLabel(docPath) : "Document");
  }
  return ROUTE_TITLES[path] || "FletBox Docs";
};

// ---------- AppBar ----------
// Nested screens (a document, a doc category, the AdMob demo) show a back
// arrow in the top bar instead of the drawer's menu button. The AppBar is
// rebuilt on every navigation, so this stays in sync with the route.
const backTarget = () => {
  const path = getCurrentPath();
  if (path === "/doc") {
    const { cat } = useQueryParams();
    return cat ? `/documentation?id=${encodeURIComponent(cat)}` : "/documentation";
  }
  if (path === "/documentation" && useQueryParams().id) return "/documentation";
  if (path === "/admob") return "/";
  return null;
};

// The theme button is rebuilt with the AppBar on every navigation, so its glyph
// and its tooltip always name the theme the reader would get, not the one they
// are already in.
const themeAction = () =>
  Tooltip({
    text: getTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
    child: Icon({
      name: getTheme() === "dark" ? "light_mode" : "dark_mode",
      size: 22,
      height: 40,
      width: 40,
      color: colors.text,
      cursor: "pointer",
      "aria-label": getTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
      onClick: toggleTheme,
    }),
  });

const appBar = () => {
  const back = backTarget();
  return AppBar({
    title: resolveTitle(),
    titleColor: colors.text,
    backgroundColor: colors.surface,
    iconColor: colors.text,
    elevation: 1,
    ...(back
      ? { showBackButton: true, onBackPress: () => goTo(back) }
      : {
          leading: Icon({
            name: "menu",
            size: 24,
            color: colors.text,
            cursor: "pointer",
          }),
        }),
    actions: [
      themeAction(),
      Icon({
        name: "code",
        size: 22,
        height: 40,
        width: 40,
        color: colors.textSecondary,
        cursor: "pointer",
        "aria-label": "View FletBox on GitHub",
        onclick: () => openExternal(GITHUB_URL),
      }),
    ],
  });
};

// ---------- Bottom navigation ----------
const bottomBar = () =>
  Container({
    width: "100%",
    backgroundColor: colors.surface,
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    child: BottomNavigation({
      items: [
        { icon: "home", label: "Home", route: "/" },
        { icon: "menu_book", label: "Docs", route: "/documentation" },
        { icon: "info", label: "About", route: "/about" },
        { icon: "code", label: "Developer", route: "/developer" },
      ],
      backgroundColor: colors.surface,
      selectedColor: colors.primary,
      unselectedColor: colors.textSecondary,
      iconSize: 22,
      height: 62,
      elevation: 1,
    }),
  });

// ---------- Drawer ----------
// The Drawer is appended to <body> (not to the scaffold subtree), so the
// scaffold cannot dispose it for us. Keep the latest instance in a module
// variable and tear it down fully before building a new one on re-render.
let activeDrawer = null;

const teardownDrawer = (drawer) => {
  if (!drawer) return;
  const el = drawer.element;
  el?.querySelectorAll?.("*").forEach((node) => {
    if (typeof node._cleanup === "function") node._cleanup();
  });
  drawer.destroy();
};

// The panel is painted from the palette, so its header, its items and its
// footer all move together when the theme changes. `Drawer` already clears the
// notch and the home indicator with the panel's own safe-area padding, so these
// paddings are the design's own breathing room and add no `env()` of their own.
const drawerHeader = () =>
  Container({
    width: "100%",
    padding: "24px 16px 16px 16px",
    gap: 12,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    children: [
      Row({
        gap: 12,
        alignItems: "center",
        children: [
          Container({
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.primaryBg,
            alignItems: "center",
            justifyContent: "center",
            child: Icon({ name: "auto_awesome", size: 22, color: colors.primary }),
          }),
          Text({ text: "FletBox", weight: "bold", size: 18, color: colors.text }),
        ],
      }),
      Text({
        text: "Documentation & guides",
        size: 12,
        color: colors.textSecondary,
      }),
      Text({
        text: `Framework v${FRAMEWORK_VERSION}`,
        size: 12,
        color: colors.textSecondary,
      }),
    ],
  });

const drawerBody = () => [
  DrawerItem({ icon: "home", label: "Home", route: "/" }),
  DrawerItem({
    icon: "menu_book",
    label: "Documentation",
    route: "/documentation",
  }),
  DrawerItem({ icon: "info", label: "About", route: "/about" }),
  DrawerItem({ icon: "code", label: "Developer", route: "/developer" }),
];

const drawerFooter = () =>
  Container({
    width: "100%",
    padding: "12px 16px 16px 16px",
    gap: 8,
    borderTop: `1px solid ${colors.border}`,
    children: [
      Button({
        text: "View on GitHub",
        icon: "code",
        variant: "outlined",
        fullWidth: true,
        padding: "8px 16px",
        onPress: () => openExternal(GITHUB_URL),
      }),
      Button({
        text: getTheme() === "dark" ? "Light theme" : "Dark theme",
        icon: getTheme() === "dark" ? "light_mode" : "dark_mode",
        variant: "outlined",
        fullWidth: true,
        padding: "8px 16px",
        onPress: toggleTheme,
      }),
      // Five families, not twelve: this is a documentation site, so the choice is
      // "which brand do you want to read these pages in", and a row of twelve
      // squares in a 300px drawer is a color chart. The picker repaints live and
      // stores the answer itself, so it does not wait for anything to be saved.
      Text({
        text: "Accent color",
        size: 12,
        align: "center",
        color: colors.textSecondary,
      }),
      ThemePicker({
        label: "Accent color",
        accents: listAccents().filter((family) =>
          ["teal", "neutral", "blue", "rose", "orange"].includes(family.id),
        ),
        size: 40,
        justifyContent: "center",
      }),
      Text({
        text: `Docs app v${APP_VERSION} · by ${DEVELOPER.handle}`,
        size: 12,
        align: "center",
        color: colors.textSecondary,
      }),
    ],
  });

const buildDrawer = () => {
  teardownDrawer(activeDrawer);
  activeDrawer = Drawer({
    header: drawerHeader(),
    body: drawerBody(),
    footer: drawerFooter(),
    width: 300,
    bgColor: colors.surface,
    elevation: 4,
  });
  return activeDrawer;
};

// ---------- Root ----------
const App = () =>
  Container({
    width: "100%",
    height: "100vh",
    backgroundColor: colors.background,
    child: Scaffold({
      routes: ROUTES,
      appBar,
      bottomBar,
      drawer: buildDrawer(),
      backgroundColor: colors.background,
      closeDrawerOnNavigate: true,
    }),
  });

// Paint the brand before the first render: `runApp` reads the OS preference off the
// palettes and applies whatever accent is active, so a brand registered after boot
// would only appear on the next theme change. It is a preference, not a storage
// write — a reader who has already picked a family in the drawer keeps theirs.
applyBrand();
runApp(App, "root");