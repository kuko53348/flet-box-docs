// app.js
// Application shell: a Scaffold in router mode wires the AppBar, Drawer and
// BottomNavigation around every screen. Navigation is driven entirely by the
// Router, so browser back/forward (and the Android hardware back button) work
// out of the box.

import {
  runApp,
  Button,
  Column,
  Container,
  Drawer,
  DrawerItem,
  Icon,
  Scaffold,
  AppBar,
  BottomNavigation,
  Row,
  Text,
  colors,
  getCurrentPath,
  goTo,
  useQueryParams,
} from "flet-box";

import { applyTheme } from "./theme.js";
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
      Icon({
        name: "code",
        size: 22,
        color: colors.textSecondary,
        cursor: "pointer",
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
// Deep teal for the drawer's accent surfaces: `colors.primary` is too bright
// for white text (2.3:1), and this keeps the same identity at 5.9:1.
const DRAWER_ACCENT = "#0a6f78";

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

const drawerHeader = () =>
  Container({
    width: "100%",
    padding: "calc(20px + env(safe-area-inset-top, 0px)) 20px 20px 20px",
    backgroundColor: DRAWER_ACCENT,
    child: Column({
      gap: 10,
      children: [
        Row({
          gap: 10,
          alignItems: "center",
          children: [
            Container({
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              child: Icon({ name: "auto_awesome", size: 22, color: "#ffffff" }),
            }),
            Text({ text: "FletBox", weight: "bold", size: 20, color: "#ffffff" }),
          ],
        }),
        Text({
          text: "Documentation & guides",
          size: 12,
          color: "rgba(255, 255, 255, 0.78)",
        }),
        Text({
          text: `Framework v${FRAMEWORK_VERSION}`,
          size: 11,
          color: "rgba(255, 255, 255, 0.62)",
        }),
      ],
    }),
  });

const drawerBody = () => [
  DrawerItem({
    icon: "home",
    label: "Home",
    route: "/",
    unselectedColor: "#ffffff",
    selectedColor: "#ffffff",
  }),
  DrawerItem({
    icon: "menu_book",
    label: "Documentation",
    route: "/documentation",
    unselectedColor: "#ffffff",
    selectedColor: "#ffffff",
  }),
  DrawerItem({
    icon: "info",
    label: "About",
    route: "/about",
    unselectedColor: "#ffffff",
    selectedColor: "#ffffff",
  }),
  DrawerItem({
    icon: "code",
    label: "Developer",
    route: "/developer",
    unselectedColor: "#ffffff",
    selectedColor: "#ffffff",
  }),
];

const drawerFooter = () =>
  Container({
    width: "100%",
    padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px)) 16px",
    borderTop: `1px solid ${colors.border}`,
    child: Column({
      gap: 8,
      children: [
        Button({
          text: "View on GitHub",
          icon: "code",
          bgColor: DRAWER_ACCENT,
          color: "#ffffff",
          fullWidth: true,
          padding: "10px 16px",
          onPress: () => openExternal(GITHUB_URL),
        }),
        Text({
          text: `Docs app v${APP_VERSION} · by ${DEVELOPER.handle}`,
          size: 11,
          align: "center",
          color: "rgba(255, 255, 255, 0.62)",
        }),
      ],
    }),
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

applyTheme();
runApp(App, "root");