# flet-box-docs

**The FletBox Book as an app.** Every page of [the framework's documentation](https://github.com/kuko53348/flet-box/tree/refactory/docs) — the widget reference, the guides, the CLI, the services and the tools — rendered by FletBox's own `Markdown` widget, with a categorized index, cross-document navigation, a light/dark toggle, an offline cache, and Capacitor wrappers for Android and iOS.

Live site: **<https://kuko53348.github.io/flet-box-docs/>**
The framework: **`npm install flet-box`** · <https://github.com/kuko53348/flet-box>

## What is in the box

| | |
| --- | --- |
| `docs/` | A copy of `flet-box/docs`, shipped with the app so it reads offline. Refresh it with `npm run sync-docs`. |
| `src/database/catalog.js` | The single source of truth for the landing screen: one category per group, one item per document. |
| `src/lib/docs.js` | Reads a document from the published source named by `config.json`, and falls back to the copy on disk. |
| `src/screens/` | Home (the catalog), Docs (a category), DocViewer (one page), About, Developer, AdMob demo, 404. |
| `service-worker.js`, `manifest.json` | The PWA half: cache the bundle and the markdown, then install to a home screen. |

Navigation between documents is intercepted rather than left to the browser: the markdown links each other with plain relative paths, which resolve against the deployed prefix (`/flet-box-docs/` on Pages, `https://localhost` inside the WebView), so a click routes through the app's own `Router` instead of fetching a raw `.md`.

## Run it

```bash
npm install
npm run dev          # a plain static server on http://localhost:8000
```

The app routes by path — `/documentation` for a category, `/doc?path=docs/widget/Button.md` for one page — so reloading a deep link on that plain server is a 404. For development, prefer the CLI's SPA fallback and hot reload:

```bash
npx flet-box run-spa --port 8000
```

The build checks that the version the app *prints* for itself still matches the version it was built with — that drift is what once made the site say "Docs app v1.0.0 / Framework v1.0.2" long after both numbers moved on:

```bash
npm run build        # createBundle www, then copy docs/ into it, then the SPA fallback
npm run check-version
```

## Android

Requires Node.js 20.9+, Android Studio, the Android SDK and Java.

```bash
flet-box build android
```

Initializes Android on first use, builds and synchronizes the web app, generates launcher icons from `assets/logo.png`, and compiles a debug APK at `android/app/build/outputs/apk/debug/app-debug.apk`. `--release` leaves it unsigned on purpose so you can sign it with your own keystore. `npm run android:open` opens the native project in Android Studio.

## iOS

Requires macOS with the full Xcode, its iOS simulator runtime, and CocoaPods (`sudo gem install cocoapods` then `pod setup`).

```bash
flet-box build ios             # simulator build
flet-box build ios --archive   # unsigned .xcarchive, sign it with your Apple team
```

The icon, the launch images and the launch-screen background are all generated from `assets/logo.png`; replace it with a 1024×1024 logo before distributing, and note that the launch background color lives in `scripts/sync-ios-assets.mjs`.

Capacitor uses a local HTTPS origin (`https://localhost`) in both WebViews. The app fetches its documents, so whatever serves them must allow that origin.

## Updating the documents

`docs/` is a snapshot, and OTA replaces only the bundle — so a page added since a device's last build is listed in the catalog but missing on disk. `src/lib/docs.js` therefore reads from the published source named by `config.json` and keeps the local copy as the offline fallback. To publish a fresh snapshot, sync the folder, bump `version` in `package.json` and `APP_VERSION` in `src/constants.js` (the version checker fails the build when they disagree), then deploy: pushing to the default branch runs `deploy-docs.yml` and updates the Pages site.

## License

MIT
