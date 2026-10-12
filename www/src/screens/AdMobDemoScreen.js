// screens/AdMobDemoScreen.js
// Demo of the FletBox AdMob widget on top of @capacitor-community/admob
// (Capacitor 8). The banner requests Google test units; on a GMS emulator you
// will see a "Test Ad" banner. The buttons fire interstitial and rewarded.

import {
  AdMob,
  Button,
  Container,
  Divider,
  Text,
  colors,
} from "flet-box";
import { card, page } from "../components/ui.js";
import { onPrimary } from "../theme.js";

// The native AdMob plugin only exists inside a Capacitor shell. A static
// import of the bare specifier would break the app on the web (the browser
// cannot resolve it without an import map), so it is loaded lazily and only
// on native. On the web the AdMob widget degrades to its placeholder.
if (globalThis.Capacitor?.isNativePlatform?.()) {
  import("@capacitor-community/admob").catch((error) => {
    console.warn("[AdMobDemo] could not load the native plugin:", error);
  });
}

const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";

// References to the most recent widget and the status text. They are updated
// on every render without triggering re-renders, so the banner is not reset
// when the buttons are tapped.
let adWidgetRef = null;
let statusWidgetRef = null;

const setStatus = (msg, color) => {
  if (!statusWidgetRef || !statusWidgetRef.isConnected) return;
  statusWidgetRef.text = msg;
  statusWidgetRef.style.color = color;
};

const statusLine = (text) => {
  const el = Text({
    text,
    size: 13,
    color: colors.textSecondary,
    align: "center",
  });
  statusWidgetRef = el;
  return el;
};

export const AdMobDemoScreen = () => {
  const ad = AdMob({
    adId: TEST_BANNER_ID,
    interstitialId: TEST_INTERSTITIAL_ID,
    rewardedId: TEST_REWARDED_ID,
    isTesting: true,
    autoInitialize: true,
    position: "top",
    size: "ADAPTIVE_BANNER",
    margin: 12,
    autoShow: true,
    width: "100%",
    height: 66,
    label: "Test banner",
    bgColor: colors.gray100,
    borderColor: colors.border,
    color: colors.primary,
    onLoaded: () => setStatus("Banner active · test ad", colors.success),
    onFailed: (error) => setStatus(`Error: ${error.message}`, colors.danger),
    onDismissed: () => setStatus("Ad dismissed", colors.textSecondary),
  });
  adWidgetRef = ad;

  const runAd = (kind, preparingMsg, runningMsg) => () => {
    setStatus(preparingMsg, colors.info);
    const promise =
      kind === "interstitial"
        ? adWidgetRef.showInterstitial()
        : kind === "rewarded"
          ? adWidgetRef.showRewarded()
          : Promise.resolve(null);
    promise.then(() => {
      setStatus(runningMsg, colors.success);
    });
  };

  return page([
    // Reserve a slot at the top for the native banner (top overlay).
    Container({ width: "100%", height: 66, child: ad }),

    card([
      statusLine("Requesting banner…"),
      Divider({ color: colors.border }),
      Button({
        text: "Show interstitial",
        iconRight: "ads_click",
        bgColor: colors.primary,
        color: onPrimary,
        padding: "12px 20px",
        fullWidth: true,
        onPress: runAd(
          "interstitial",
          "Loading interstitial…",
          "Interstitial dismissed · test ad",
        ),
      }),
      Button({
        text: "Show rewarded",
        iconRight: "emoji_events",
        variant: "outlined",
        color: colors.primary,
        padding: "12px 20px",
        fullWidth: true,
        onPress: runAd("rewarded", "Loading rewarded…", "Reward ready · test ad"),
      }),
    ]),

    Text({
      text: "To publish: replace these units with your own AdMob units and set isTesting to false.",
      size: 11.5,
      color: colors.textSecondary,
      lineHeight: 1.6,
      align: "center",
    }),
  ]);
};

export default AdMobDemoScreen;