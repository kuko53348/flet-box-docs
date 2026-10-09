// screens/AdMobDemoScreen.js
// Demo del widget AdMob de FletBox sobre @capacitor-community/admob (Capacitor 8).
// El banner se pide con unidades de prueba de Google; en el emulador con GMS
// verás un banner "Test Ad". Los botones disparan interstitial y rewarded.
import {
  AdMob,
  Button,
  Column,
  Container,
  Divider,
  Icon,
  Row,
  Text,
  colors,
} from "flet-box";
import { AdMob as NativeAdmob } from "@capacitor-community/admob";

const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";

// Referencias al widget más reciente y al texto de estado. Se actualizan en cada
// render sin provocar re-renders, así el banner no se reinicia al tocar botones.
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

export const AdMobDemoScreen = ({ onBack }) => {
  const ad = AdMob({
    plugin: NativeAdmob,
    adId: TEST_BANNER_ID,
    interstitialId: TEST_INTERSTITIAL_ID,
    rewardedId: TEST_REWARDED_ID,
    isTesting: true,
    position: "top",
    size: "ADAPTIVE_BANNER",
    margin: 12,
    autoShow: true,
    width: "100%",
    height: 66,
    label: "Banner de prueba",
    bgColor: "#101428",
    borderColor: "#2c3e66",
    color: "#8ab4f8",
    onLoaded: () => setStatus("Banner activo · test ad", "#22c55e"),
    onFailed: (error) => setStatus(`Error: ${error.message}`, "#ef4444"),
    onDismissed: () => setStatus("Anuncio cerrado", colors.textSecondary),
  });
  adWidgetRef = ad;

  const runAd = (kind, preparingMsg, runningMsg) =>
    () => {
      setStatus(preparingMsg, colors.info);
      const promise =
        kind === "interstitial"
          ? adWidgetRef.showInterstitial()
          : kind === "rewarded"
            ? adWidgetRef.showRewarded()
            : Promise.resolve(null);
      promise.then(() => {
        setStatus(runningMsg, "#22c55e");
      });
    };

  return Container({
    flex: 1,
    padding: 4,
    backgroundColor: colors.background,
    child: Column({
      gap: 16,
      padding: "16px 16px 40px 16px",
      children: [
        // Reserva un hueco arriba para el banner nativo (overlay top).
        Container({
          height: 66,
          child: ad,
        }),

        Row({
          gap: 12,
          alignItems: "center",
          children: [
            Container({
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.primary + "1f",
              alignItems: "center",
              justifyContent: "center",
              child: Icon({ name: "campaign", color: colors.primary, size: 24 }),
            }),
            Column({
              gap: 2,
              children: [
                Text({ text: "Demo AdMob", weight: "bold", size: 20, color: colors.text }),
                Text({
                  text: "Unidades de prueba de Google · Capacitor Android",
                  size: 12,
                  color: colors.textSecondary,
                }),
              ],
            }),
          ],
        }),

        statusLine("Solicitando banner…"),

        Divider({ color: colors.border }),

        Column({
          gap: 10,
          children: [
            Button({
              text: "Mostrar interstitial",
              iconRight: "ads_click",
              bgColor: colors.primary,
              color: "#ffffff",
              padding: "12px 20px",
              fullWidth: true,
              onPress: runAd("interstitial", "Cargando interstitial…", "Interstitial cerrado · test ad"),
            }),
            Button({
              text: "Mostrar rewarded",
              iconRight: "emoji_events",
              variant: "outlined",
              color: colors.primary,
              padding: "12px 20px",
              fullWidth: true,
              onPress: runAd("rewarded", "Cargando rewarded…", "Recompensa lista · test ad"),
            }),
          ],
        }),

        Text({
          text: "Para publicar: sustituye estas unidades por las tuyas en AdMob y cambia isTesting a false.",
          size: 11.5,
          color: colors.textSecondary,
          lineHeight: 1.6,
          align: "center",
        }),

        onBack
          ? Button({ text: "← Volver", variant: "text", color: colors.textSecondary, fullWidth: true, onPress: onBack })
          : null,
      ],
    }),
  });
};

export default AdMobDemoScreen;