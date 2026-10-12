import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidRes = path.join(projectRoot, "android", "app", "src", "main", "res");
const logoPath = path.join(projectRoot, "assets", "logo.png");
const backgroundPath = path.join(androidRes, "values", "ic_launcher_background.xml");

for (const requiredPath of [logoPath, backgroundPath]) {
  try {
    await readFile(requiredPath);
  } catch {
    throw new Error(
      `Missing ${requiredPath}. Run npm run android:init before generating Android icons.`,
    );
  }
}

const logo = await readFile(logoPath);
const densities = [
  ["mdpi", 48],
  ["hdpi", 72],
  ["xhdpi", 96],
  ["xxhdpi", 144],
  ["xxxhdpi", 192],
];
const background = { r: 26, g: 26, b: 46 };

for (const [density, size] of densities) {
  const directory = path.join(androidRes, `mipmap-${density}`);
  await mkdir(directory, { recursive: true });
  const icon = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const foregroundLayer = await sharp(logo)
    .resize(Math.round(size * 0.66), Math.round(size * 0.66), { fit: "contain" })
    .png()
    .toBuffer();
  const foreground = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: foregroundLayer, gravity: "centre" }])
    .png()
    .toBuffer();

  await Promise.all([
    writeFile(path.join(directory, "ic_launcher.png"), icon),
    writeFile(path.join(directory, "ic_launcher_round.png"), icon),
    writeFile(path.join(directory, "ic_launcher_foreground.png"), foreground),
  ]);
}

const xml = await readFile(backgroundPath, "utf8");
const backgroundColor = /(<color name="ic_launcher_background">)#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})(<[/]color>)/;
if (!backgroundColor.test(xml)) {
  throw new Error(`Invalid adaptive icon background resource: ${backgroundPath}`);
}
await writeFile(backgroundPath, xml.replace(backgroundColor, "$1#1a1a2e$2"));

// SPLASH SCREENS
// The launch theme (AppTheme.NoActionBarLaunch) shows @drawable/splash while the
// WebView boots. Draw the app icon (the logo flattened on the brand color),
// centred and sized to ~30% of the shorter side, with rounded corners whose
// radius is 24dp at the mdpi baseline and scales with the device density.
const ICON_SCALE = 0.3;
const BORDER_RADIUS_DP = 24;

const roundedIcon = async (size, radius) => {
  const tile = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`,
  );
  return sharp(tile).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
};

const splashScreens = [
  ["drawable", 480, 320, 1],
  ["drawable-port-mdpi", 320, 480, 1],
  ["drawable-port-hdpi", 480, 800, 1.5],
  ["drawable-port-xhdpi", 720, 1280, 2],
  ["drawable-port-xxhdpi", 960, 1600, 3],
  ["drawable-port-xxxhdpi", 1280, 1920, 4],
  ["drawable-land-mdpi", 480, 320, 1],
  ["drawable-land-hdpi", 800, 480, 1.5],
  ["drawable-land-xhdpi", 1280, 720, 2],
  ["drawable-land-xxhdpi", 1600, 960, 3],
  ["drawable-land-xxxhdpi", 1920, 1280, 4],
];

for (const [directory, width, height, scale] of splashScreens) {
  const target = path.join(androidRes, directory);
  await mkdir(target, { recursive: true });
  const iconSize = Math.round(ICON_SCALE * Math.min(width, height));
  const radius = Math.min(Math.round(BORDER_RADIUS_DP * scale), Math.floor(iconSize / 2));
  const icon = await roundedIcon(iconSize, radius);
  const splash = await sharp({
    create: { width, height, channels: 4, background },
  })
    .composite([{ input: icon, gravity: "centre" }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(target, "splash.png"), splash);
}

console.log("Android launcher icons and splash screens generated from assets/logo.png.");
