# FletBox

FletBox is a UI framework for building interfaces with plain JavaScript. You describe a screen with *widgets* — functions that take an object and return a real DOM element — and FletBox turns that description into HTML, keeps it in sync when state changes, and gets out of the way. No runtime dependencies, no Virtual DOM, no build configuration to learn.

This page is the front door. The rest of the book is the [documentation index](docs/README.md), and every page in it links to its **Previous** and **Next**.

## Why it exists

Most JavaScript UI stacks ask you to adopt a compiler, a runtime, a component model and a routing library before you can draw a button. FletBox asks for Node and a browser:

- **Zero runtime dependencies.** The published package declares `"dependencies": {}`, so nothing else lands in your `node_modules` and nothing in your bundle needs auditing.
- **Real DOM.** A widget *is* an element. There is no reconciliation pass, so an update touches the node you expected it to touch.
- **A declarative API with Flet/Flutter habits.** `Container({ width: "100%", children: [...] })`, prop aliases (`bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`), and `useState` for state — but the syntax is ordinary JavaScript object literals, so nothing needs a transformer.
- **One codebase, four targets.** Web, PWA, Android and iOS from the same source, through the CLI and Capacitor.
- **Everything scales with the reader.** Every length is a framework unit rendered as `rem`, so one build fits a phone, a tablet and a desktop, and grows with the reader's font size. Pixels survive only where they are honest: canvas backing stores, measured geometry, hairlines, device insets.

## Install

FletBox is on npm, and Node.js 20.9 or newer is the only requirement:

```bash
npm install -g flet-box           # the CLI, once
flet-box create my-app            # scaffold a project
cd my-app
npm install                       # flet-box itself, from the registry
npm run dev                       # http://localhost:8000
```

Prefer not to install anything globally? `npx flet-box create my-app` runs the same scaffolder from the registry.

Cloning this repository and `npm link`ing it is still how you *develop the framework*, because then the app you are testing loads the code you are editing.

## Quick start

```javascript
import { runApp, Container, Text, Button, useState } from "flet-box";

const App = () => {
  const [count, setCount] = useState("count", 0);

  return Container({
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    child: [
      Text({ text: `Counter: ${count}`, size: 24, weight: 700 }),
      Button({ text: "Increment", onPress: () => setCount((v) => v + 1) }),
    ],
  });
};

runApp(App);
```

`runApp` mounts your widget tree, `useState` is key-based RAM plus subscribers, and the `Button` re-renders only what reads `count`. That is the whole model — [Chapter 0](docs/guides/first-app.md) builds a real app with it in twenty minutes.

## What ships with the framework

`flet-box check-api --list` prints the authoritative set; `flet-box unpack <Widget>` reads one widget across all four surfaces at once. Roughly:

| Area | What is in it |
| --- | --- |
| **Widgets** | 65 of them — layout (`Container`, `Row`, `Column`, `Stack`, `Grid`-style lists), content (`Text`, `Markdown`, `Icon`, `Image`, `CodeViewer`), inputs (`Input`, `Dropdown`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Rating`, `Stepper`), data (`DataTable`, `ListView`, `TreeView`, `Chart`, `CircularChart`, `QRCode`), overlays (`Modal`, `BottomSheet`, `Drawer`, `SnackBar`, `Tooltip`, `AlertDialog`) and media (`Audio`, `Video`, `Maps`, `AdMob`, `AdSense`). |
| **Navigation** | `Scaffold`, `AdaptiveScaffold`, `AppBar`, `Tabs`, `BottomNavigation`, `Drawer`, `CollapsibleSideBar` and a path `Router` with params, queries and route subscriptions. |
| **Motion** | `AnimatedBox`, `AnimatedText`, `ParallaxBox`, `MatrixRain`, the imperative `animate`, named transitions (`fadeIn`, `slideIn`, `popIn`, `shake`), springs, custom `cubicBezier` curves — and one global decision: `prefersReducedMotion()` collapses every loop to its end state. |
| **Theming** | Two zinc-based palettes and a `colors` token set with light and dark read from the same names, `setTheme`/`toggleTheme`, `registerPalette`, plus the browser-chrome sync so the PWA bars follow the theme. |
| **Accessibility** | One focus ring owned by the engine, roles and Tab stops on every pressable widget, focus trapped inside the three overlays, `aria-*` states on the controls that hide them, and a 16px floor on iOS text fields so focusing one never zooms the page. |
| **Services & tools** | Three storage layers (`RamStore`, `Session`, `Storage`), an HTTP client, and the utility API for color, date, text, list and layout math. |
| **The CLI** | `create`, `screen`, `component`, `run`, `run-spa`, `run-bundle`, `cloudflare`, `createBundle`, `release`, `build android|ios`, `run-native`, `check-api`, `unpack`, `check-ui`, `audit-fix`, `to-png`, `images`, `prune-assets`, `pkg`, `kill-server`. |
| **Skills** | Four markdown files copied into every generated app — `fletbox-rules`, `fletbox-design`, `fletbox-motion`, `fletbox-memory` — so any AI assistant editing the app reads the same contract you do. |

## The two gates

Every generated project can prove it is honest about the API and about its own design:

```bash
npm run check            # flet-box check-api: no invented widget, prop or import
npm run ui               # flet-box check-ui: the design rules, per screen
```

`check-api` imports the installed package, so a widget or prop that does not exist fails the build instead of shipping as a blank screen. `check-ui` enforces the numbered rules in [Clean UI](docs/guides/clean-ui.md) — one brand color per screen, the 8-based spacing and radius scale, contrast, a live state on list rows — and every finding names the rule it broke.

## Ship it

`flet-box build android` and `flet-box build ios` wrap Capacitor: they initialize the platform on first run, bundle the web app, generate launcher icons and launch screens from `assets/logo.png`, and print the artifact path. Release artifacts are left unsigned so you sign them with your own keystore or Apple team.

For the web, `flet-box createBundle www` writes the bundle and stamps `www/config.json`, and the app can then update itself: [Online updates (OTA)](docs/guides/online-updates.md) explains how a release published to GitHub Pages becomes an over-the-air update for every installed copy — this very site works that way.

## Reading these docs as an app

You are doing it. This documentation is also an application: [`flet-box-docs`](https://www.npmjs.com/package/flet-box-docs) is the FletBox Book rendered by the framework's own `Markdown` widget, with a categorized index, cross-document navigation, a theme toggle and an offline cache. It is a normal FletBox project —

```bash
npm install flet-box-docs      # the book, as a package
```

— and its `docs/` folder is a snapshot of the framework's documentation, refreshed from `flet-box/docs` before each release, while the app reads the published source when it is online so a page added since a device's last build still arrives.

## Where to go next

- [The FletBox Book](docs/README.md) — the front cover and the full reading path.
- [Your first app](docs/guides/first-app.md) — Chapter 0, a working todo app in 20 minutes.
- [The widget book](docs/widget/README.md) — every widget with property tables and examples.
- [The widget gallery](https://kuko53348.github.io/flet-box-widgets-exemples/) — the same examples rendered live, one page per widget, with the exact call printed under each result.
- [The CLI](docs/cli/README.md) · [Tools & utilities](docs/tools/README.md) · [Services](docs/services/README.md) · [Architecture](docs/arquitectura.md) · [Contributing](docs/CONTRIBUTING.md)
- Source and issues: <https://github.com/kuko53348/flet-box> — MIT licensed.
