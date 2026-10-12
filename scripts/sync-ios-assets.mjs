import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeAppDir = path.join(projectRoot, "ios", "App", "App");
const appIconSet = path.join(nativeAppDir, "Assets.xcassets", "AppIcon.appiconset");
const splashSet = path.join(nativeAppDir, "Assets.xcassets", "Splash.imageset");
const infoPlistPath = path.join(nativeAppDir, "Info.plist");
const launchScreenPath = path.join(nativeAppDir, "Base.lproj", "LaunchScreen.storyboard");
const logoPath = path.join(projectRoot, "assets", "logo.png");

// Brand background, the same #1a1a2e as theme-color in index.html and manifest.json.
const background = { r: 26, g: 26, b: 46 };
const backgroundComponent = (value) => Number((value / 255).toFixed(6));

const requireExists = async (target) => {
  try {
    await access(target);
  } catch {
    throw new Error(
      "Missing " + target + ". Run `npm run ios:init` before generating iOS assets.",
    );
  }
};

for (const target of [logoPath, appIconSet, splashSet, infoPlistPath, launchScreenPath]) {
  await requireExists(target);
}

const logo = await readFile(logoPath);
const logoMetadata = await sharp(logo).metadata();
if ((logoMetadata.width ?? 0) < 512 || (logoMetadata.height ?? 0) < 512) {
  throw new Error(
    "assets/logo.png must be at least 512x512 pixels, found " +
      logoMetadata.width +
      "x" +
      logoMetadata.height +
      ".",
  );
}

const readContents = async (directory) =>
  JSON.parse(await readFile(path.join(directory, "Contents.json"), "utf8"));

// APP ICON
// The Capacitor template ships one universal 1024x1024 slot. Slot names and
// sizes come from Contents.json instead of being hardcoded, so a template with
// several slots keeps working. iOS rejects icons with an alpha channel, hence
// the flatten onto the brand color.
const iconContents = await readContents(appIconSet);
const iconSlots = iconContents.images.filter((image) => image.filename);
if (iconSlots.length === 0) {
  throw new Error("No icon slots found in " + path.join(appIconSet, "Contents.json"));
}

const slotPixels = (image) => {
  const base = Number(image.size ? image.size.split("x")[0] : 0);
  if (!base) return 1024;
  const scale = image.scale === "3x" ? 3 : image.scale === "2x" ? 2 : 1;
  return Math.round(base * scale);
};

for (const slot of iconSlots) {
  const size = slotPixels(slot);
  const icon = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  await writeFile(path.join(appIconSet, slot.filename), icon);
}

// LAUNCH IMAGES
// LaunchScreen.storyboard stretches the "Splash" image with scaleAspectFill, so
// a square brand image covers every screen. Each file keeps the dimensions the
// template ships with, which the asset catalog scales per device.
// The app icon (logo flattened on the brand color) is centred at ~30% of the
// side with rounded corners. The corner radius is 24dp at the mdpi baseline, so
// the ratio comes from a 96px icon: 24 / 96.
const splashContents = await readContents(splashSet);
const splashSlots = splashContents.images.filter((image) => image.filename);
const ICON_SCALE = 0.3;
const BORDER_RADIUS_RATIO = 24 / 96;

for (const slot of splashSlots) {
  const target = path.join(splashSet, slot.filename);
  const metadata = await sharp(target).metadata();
  const side = metadata.width && metadata.width === metadata.height ? metadata.width : 2732;
  const iconSize = Math.round(side * ICON_SCALE);
  const radius = Math.min(
    Math.round(iconSize * BORDER_RADIUS_RATIO),
    Math.floor(iconSize / 2),
  );
  const tile = await sharp(logo)
    .resize(iconSize, iconSize, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}"><rect width="${iconSize}" height="${iconSize}" rx="${radius}" ry="${radius}"/></svg>`,
  );
  const badge = await sharp(tile)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const splash = await sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background,
    },
  })
    .composite([{ input: badge, gravity: "centre" }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(target, splash);
}

// LAUNCH SCREEN BACKGROUND
// The splash image is laid out inside the safe area, so the notch strip and the
// home indicator keep the storyboard background color. Left as
// systemBackgroundColor it flashes white over the dark launch image.
const storyboard = await readFile(launchScreenPath, "utf8");
const brandedColor =
  '<color key="backgroundColor" red="' +
  backgroundComponent(background.r) +
  '" green="' +
  backgroundComponent(background.g) +
  '" blue="' +
  backgroundComponent(background.b) +
  '" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>';
const systemColor = '<color key="backgroundColor" systemColor="systemBackgroundColor"/>';
const brandedStoryboard = storyboard.split(systemColor).join(brandedColor);
if (brandedStoryboard !== storyboard) {
  await writeFile(launchScreenPath, brandedStoryboard);
}

// STATUS BAR
// FletBox apps paint a dark app bar, and the template Info.plist leaves
// UIViewControllerBasedStatusBarAppearance enabled, which makes the plist status
// bar style ignored. Disable it so the light content style actually applies.
const setPlistValue = (xml, key, value) => {
  const openTag = "<key>" + key + "</key>";
  const valueTag = value.startsWith("<") ? value : "<string>" + value + "</string>";
  const keyStart = xml.indexOf(openTag);
  if (keyStart !== -1) {
    // The value follows on the next indented line, so jump to its first tag.
    const valueStart = xml.indexOf("<", keyStart + openTag.length);
    if (xml.startsWith("<string>", valueStart)) {
      const valueEnd = xml.indexOf("</string>", valueStart) + "</string>".length;
      return xml.slice(0, valueStart) + valueTag + xml.slice(valueEnd);
    }
    if (xml.startsWith("<true", valueStart) || xml.startsWith("<false", valueStart)) {
      const valueEnd = xml.indexOf("/>", valueStart) + 2;
      return xml.slice(0, valueStart) + valueTag + xml.slice(valueEnd);
    }
  }
  const closing = xml.lastIndexOf("</dict>");
  return (
    xml.slice(0, closing) +
    "\t" + openTag + "\n\t" + valueTag + "\n" +
    xml.slice(closing)
  );
};

const plist = await readFile(infoPlistPath, "utf8");
const brandedPlist = setPlistValue(
  setPlistValue(plist, "UIStatusBarStyle", "UIStatusBarStyleLightContent"),
  "UIViewControllerBasedStatusBarAppearance",
  "<false />",
);
if (brandedPlist !== plist) {
  await writeFile(infoPlistPath, brandedPlist);
}

console.log(
  "iOS app icon, launch images and launch screen generated from assets/logo.png " +
    "(" + iconSlots.length + " icon slot(s), " + splashSlots.length + " launch image(s)).",
);