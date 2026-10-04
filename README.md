# flet-box-docs

FletBox app with 3 screens: Root, Home and About, plus Drawer menu.
The generated Capacitor configuration uses package id `com.fletbox.flet.box.docs`.

## Quick Start

```bash
npm install
npm run dev
```

## Android

This project is preconfigured for Capacitor. Install Node.js 20.9 or newer,
Android Studio, and the Android SDK. Then create the native Android project:

```bash
npm install
flet-box build android
```

The command initializes Android on first use, builds and synchronizes the web
app, generates launcher icons from `assets/logo.png`, and compiles a debug APK
at `android/app/build/outputs/apk/debug/app-debug.apk`. It installs missing
project npm dependencies and prints the absolute APK path when finished.
Android Studio, Java, and the Android SDK must already be installed. Replace
that image with your app logo before distributing. To open the native project
in Android Studio, run `npm run android:open`. For a signed release, use
**Build → Generate Signed Bundle / APK** in Android Studio. The PWA manifest
icons are in `src/assets/`.

## iOS

This project is preconfigured for Capacitor iOS. On macOS, install the full
Xcode app, its iOS simulator runtime, and CocoaPods
(`sudo gem install cocoapods` then `pod setup`). Node.js 20.9 or newer is
required. Then build the simulator app:

```bash
npm install
flet-box build ios
```

The command initializes iOS on first use, builds and synchronizes the web app,
generates the app icon, launch images and launch screen background from
`assets/logo.png`, and compiles
`ios/build/Build/Products/Debug-iphonesimulator/App.app`. It prints the
absolute path when finished. Install it on a running simulator with
`xcrun simctl install booted <path>`.

For a real device or the App Store, build the unsigned archive and sign it with
your Apple team:

```bash
flet-box build ios --archive
```

That writes `ios/build/App.xcarchive`. Open it in Xcode (Product → Archive) with
a signing team selected to export an IPA. To open the native project directly,
run `npm run ios:open`.

Replace `assets/logo.png` with a 1024×1024 logo before distributing; the icon,
the launch images and the launch background are all generated from it. The
launch background is the app brand color `#1a1a2e`, which lives in
`scripts/sync-ios-assets.mjs`.

Capacitor uses a local HTTPS origin (`https://localhost`) in the Android and
iOS WebViews. If the app calls a remote API, allow that origin in the API's
CORS configuration and use HTTPS for the remote service.

## Features

- Welcome screen with rocket icon
- Dashboard screen with welcome message
- About screen with framework info
- Drawer menu for navigation
- PWA icons and Capacitor Android launcher/splash assets
- Capacitor iOS project, icon and launch screen assets
- Dark/Light theme support

## Project Structure

```
├── src/
│   ├── app.js
│   ├── components/
│   │   └── layouts/
│   │       └── DrawerMenu.js
│   ├── screens/
│   │   ├── RootScreen.js
│   │   ├── HomeScreen.js
│   │   └── AboutScreen.js
│   └── database/
│       └── themes.js
├── index.html
├── package.json
└── run.sh
```

## License
MIT
