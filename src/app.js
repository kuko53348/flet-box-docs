import {
  runApp,
  Container,
  Row,
  Column,
  Text,
  Button,
  Icon,
  Divider,
  Markdown,
  Input,
  useState,
  colors,
} from "flet-box";
import { CATEGORIES, ALL_DOCS, getCategory } from "./database/catalog.js";
import { AdMobDemoScreen } from "./screens/AdMobDemoScreen.js";

// Documentation lives in ./docs (copied from the flet-box repository). Paths
// are relative to the document so the app also works from a subdirectory and
// from the Capacitor WebView, where they resolve against the bundled www/docs.
const DOCS_DIR = "docs/";

// Path of the document currently on screen. Kept outside the component because
// the tree is rebuilt on every state change, while the link listener below is
// registered once.
let currentDocPath = "";
let linksBound = false;

// Docs cross-link with plain relative paths (Button.md, ../README.md). The
// Markdown widget renders them as <a target="_blank">, so the browser would
// resolve them against the page URL, request the raw .md and 404. Resolve them
// against the directory of the doc on screen instead.
//
// overview.md is the framework README, which links from the repository root
// (docs/guides/state.md). Its own directory is already docs/, so those land in
// docs/docs/; drop the extra prefix to map them onto this app's layout.
const resolveDocPath = (href, fromPath) => {
  const resolved = decodeURIComponent(
    new URL(href, `https://docs.invalid/${fromPath}`).pathname,
  ).replace(/^\/+/, "");
  return resolved.startsWith(`${DOCS_DIR}${DOCS_DIR}`)
    ? resolved.slice(DOCS_DIR.length)
    : resolved;
};

const docLabel = (path) => path.split("/").pop().replace(/\.md$/, "");

// Small helper: an icon inside a tinted rounded chip, used on cards and rows.
const iconChip = (name, color, size = 40) =>
  Container({
    width: size,
    height: size,
    borderRadius: size / 3,
    backgroundColor: `${color}1f`,
    alignItems: "center",
    justifyContent: "center",
    child: Icon({ name, color, size: Math.round(size * 0.55) }),
  });

const App = () => {
  // view: "home" | "category" | "doc" | "admob"
  const [viewState, setView] = useState("view", "home");
  const [catState, setCat] = useState("category", "");
  const [contentState, setContent] = useState(
    "content",
    "# FletBox Docs\n\nPick a category to start exploring.",
  );
  const [docNameState, setDocName] = useState("docName", "");
  const [loadingState, setLoading] = useState("loading", false);
  const [searchState, setSearch] = useState("search", "");

  // useState returns a reactive wrapper, not the raw value. Arithmetic works via
  // valueOf(), but === , truthiness and string methods do not, so unwrap here.
  // Safe because every state change re-runs App() and rebuilds the tree.
  const view = viewState.valueOf();
  const categoryId = catState.valueOf();
  const content = contentState.valueOf();
  const docName = docNameState.valueOf();
  const loading = loadingState.valueOf();
  const search = searchState.valueOf();

  const openDoc = async (doc) => {
    try {
      setLoading(true);
      currentDocPath = doc.path;
      setDocName(doc.name);
      if (doc.categoryId) setCat(doc.categoryId);
      setView("doc");
      const res = await fetch(doc.path);
      if (!res.ok) throw new Error(`Failed to load ${doc.path}`);
      const text = await res.text();
      setContent(text);
    } catch (err) {
      setContent(
        `# Not found\n\n\`${doc.path}\` is not part of this documentation set.\n\n${err.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const openCategory = (id) => {
    setSearch("");
    setCat(id);
    setView("category");
  };

  const goHome = () => {
    setSearch("");
    setView("home");
  };

  const openAdDemo = () => {
    setSearch("");
    setView("admob");
  };

  // Delegated on document so it survives the tree rebuilds, and registered once
  // so listeners do not stack on every render. The captured openDoc stays valid:
  // its setters write to the store by key and every render re-reads that store.
  if (!linksBound) {
    linksBound = true;
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || !currentDocPath) return;

      const href = link.getAttribute("href");
      // Leave external links and in-page anchors to the browser.
      if (!href || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(href)) return;

      const target = resolveDocPath(href, currentDocPath);
      // Always swallow the click: target="_blank" would otherwise open the raw
      // markdown in a new tab.
      event.preventDefault();
      if (!target.startsWith(DOCS_DIR)) return;

      openDoc({ path: target, name: docLabel(target) });
    });
  }

  const query = search.trim().toLowerCase();

  // ---------- Top bar ----------
  const topBar = (title, subtitle, { onBack, backIcon = "arrow_back" } = {}) =>
    Container({
      width: "100%",
      padding: "12px 16px",
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      child: Row({
        gap: 12,
        alignItems: "center",
        children: [
          onBack
            ? Button({
              text: "",
              variant: "text",
              icon: backIcon,
              color: colors.text,
              onPress: onBack,
              style: { minWidth: 40, padding: 8 },
            })
            : iconChip("auto_stories", colors.primary, 38),
          Column({
            style: { flex: 1 },
            gap: 2,
            children: [
              Text({ text: title, weight: "bold", size: 17, color: colors.text }),
              subtitle
                ? Text({ text: subtitle, size: 12, color: colors.textSecondary })
                : null,
            ].filter(Boolean),
          }),
        ],
      }),
    });

  // ---------- Home: category grid ----------
  const matches = (item) =>
    item.name.toLowerCase().includes(query) ||
    (item.hint || "").toLowerCase().includes(query);

  const searchResults = query
    ? ALL_DOCS.filter(matches).slice(0, 60)
    : [];

  const cardFor = (cat) =>
    Container({
      flex: "1 1 260px",
      maxWidth: "380px",
      cursor: "pointer",
      padding: 18,
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      border: `1px solid ${colors.border}`,
      onClick: () => openCategory(cat.id),
      children: [
        Row({
          gap: 12,
          alignItems: "center",
          children: [
            iconChip(cat.icon, cat.color, 44),
            Column({
              flex: 1,
              gap: 2,
              children: [
                Text({ text: cat.title, weight: "bold", size: 16, color: colors.text }),
                Text({
                  text: `${cat.items.length} ${cat.items.length === 1 ? "doc" : "docs"}`,
                  size: 11,
                  color: cat.color,
                  weight: "bold",
                }),
              ],
            }),
            Icon({ name: "chevron_right", color: colors.textSecondary, size: 22 }),
          ],
        }),
        Text({ text: cat.description, size: 12.5, color: colors.textSecondary, lineHeight: 1.5 }),
      ],
    });

  const homeBody = query
    ? Column({
      gap: 6,
      padding: "8px 16px 32px 16px",
      children: [
        Text({
          text: `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} for “${search.trim()}”`,
          size: 12,
          color: colors.textSecondary,
          padding: "4px 0 8px 0",
        }),
        ...searchResults.map((doc) =>
          Container({
            padding: "10px 12px",
            borderRadius: 12,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            cursor: "pointer",
            onClick: () => openDoc(doc),
            child: Row({
              gap: 12,
              alignItems: "center",
              children: [
                iconChip(doc.categoryIcon, doc.categoryColor, 34),
                Column({
                  style: { flex: 1 },
                  gap: 2,
                  children: [
                    Text({ text: doc.name, weight: "bold", size: 14, color: colors.text }),
                    Text({
                      text: `${doc.categoryTitle}${doc.hint ? " · " + doc.hint : ""}`,
                      size: 11,
                      color: colors.textSecondary,
                    }),
                  ],
                }),
              ],
            }),
          }),
        ),
      ],
    })
    : Column({
      gap: 16,
      padding: "20px 16px 40px 16px",
      children: [
        Column({
          gap: 6,
          children: [
            Text({ text: "Explore the framework", weight: "bold", size: 24, color: colors.text }),
            Text({
              text: "Everything FletBox offers, organized by class. Choose a category to see its documentation.",
              size: 13.5,
              color: colors.textSecondary,
              lineHeight: 1.5,
            }),
          ],
        }),
        Row({
          wrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",

          children: CATEGORIES.map(cardFor),
        }),

        Container({
          maxWidth: "380px",
          cursor: "pointer",
          padding: 18,
          gap: 12,
          backgroundColor: colors.primary + "14",
          borderRadius: 16,
          border: `1px solid ${colors.primary}66`,
          onClick: openAdDemo,
          child: Row({
            gap: 12,
            alignItems: "center",
            children: [
              iconChip("campaign", colors.primary, 44),
              Column({
                flex: 1,
                gap: 2,
                children: [
                  Text({ text: "Demo AdMob", weight: "bold", size: 16, color: colors.text }),
                  Text({
                    text: "Banner, interstitial y rewarded · verlo en Android",
                    size: 11,
                    color: colors.primary,
                    weight: "bold",
                  }),
                ],
              }),
              Icon({ name: "chevron_right", color: colors.primary, size: 22 }),
            ],
          }),
        }),
      ],
    });

  const homeView = Column({
    width: "100%",
    height: "100vh",

    children: [
      topBar("FletBox Docs", "The complete framework, by category"),
      Container({
        padding: "12px 16px 0 16px",
        child: Input({
          placeholder: "Search all docs (widgets, tools, services…)",
          value: search,
          onChange: (value) => setSearch(value),
          iconLeft: "search",
          iconColor: colors.textSecondary,
        }),
      }),
      Container({
        flex: 1,

        overflow: "auto",
        child: homeBody
      }),
    ],
  });

  // ---------- Category: list of docs ----------
  const category = getCategory(categoryId);
  const categoryView = category
    ? (() => {
      const items = query
        ? category.items.filter(matches)
        : category.items;
      return Column({
        width: "100%",
        height: "100vh",
        children: [
          topBar(category.title, category.description, { onBack: goHome }),
          Container({
            padding: "12px 16px",

            child: Column({
              gap: 14,
              children: [
                Input({
                  placeholder: `Search in ${category.title}…`,
                  value: search,
                  onChange: (value) => setSearch(value),
                  iconLeft: "search",
                  iconColor: colors.textSecondary,
                }),

                Row({
                  padding: 4,
                  gap: 6,
                  alignItems: "center",
                  justifyContent: "space-between",
                  children: [
                    Text({
                      text: "Results in " + category.title,
                      weight: "bold",
                      size: 15,
                      color: colors.text,
                    }),
                    Text({
                      text: `${items.length} result${items.length === 1 ? "" : "s"}`,
                      size: 15,
                      weight: "bold",
                      color: colors.textSecondary,
                    }),
                  ],
                }),
              ],
            }),
          }),
          Container({
            flex: 1,
            overflow: "auto",
            child: Column({
              gap: 6,
              padding: "4px 16px 40px 16px",
              children: items.map((item) =>
                Container({
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  style: { cursor: "pointer" },
                  onClick: () => openDoc({ ...item, categoryId: category.id }),
                  child: Row({
                    gap: 12,
                    alignItems: "center",
                    children: [
                      iconChip(category.icon, category.color, 36),
                      Column({
                        style: { flex: 1 },
                        gap: 2,
                        children: [
                          Text({ text: item.name, weight: "bold", size: 14.5, color: colors.text }),
                          item.hint
                            ? Text({ text: item.hint, size: 11.5, color: colors.textSecondary })
                            : null,
                        ].filter(Boolean),
                      }),
                      Icon({ name: "chevron_right", color: colors.textSecondary, size: 20 }),
                    ],
                  }),
                }),
              ),
            }),
          }),
        ],
      });
    })()
    : homeView;

  // ---------- Doc viewer ----------
  const docView = Column({
    width: "100%",
    height: "100vh",
    children: [
      topBar(docName || "Document", category ? category.title : "Docs", {
        onBack: () => (category ? openCategory(category.id) : goHome()),
      }),
      loading &&
      Container({
        padding: 2,
        backgroundColor: colors.infoBg,
        borderBottom: `1px solid ${colors.border}`,
        child: Text({ text: "Loading...", size: 12, color: colors.info }),
      }),
      Container({
        flex: 1,
        padding: 8,
        overflow: "auto",
        child: Markdown({
          text: content,
          codeBgColor: colors.surface,
          codeColor: colors.text,
          codeBorderRadius: 0,
          codePadding: 4,
          padding: 12,
          lineHeight: 1.85,
          fontSize: 14,
          color: colors.text,
        }),
      }),
    ],
  });

  const body =
    view === "doc"
      ? docView
      : view === "category"
        ? categoryView
        : view === "admob"
          ? Column({
            width: "100%",
            height: "100vh",
            children: [
              topBar("Demo AdMob", "Anuncios de prueba en Android", { onBack: goHome }),
              Container({
                flex: 1,
                overflow: "auto",
                child: AdMobDemoScreen({ onBack: goHome }),
              }),
            ],
          })
          : homeView;

  return Container({
    width: "100%",
    height: "100vh",
    backgroundColor: colors.background,
    child: body,
  });
};

runApp(App, "root");
