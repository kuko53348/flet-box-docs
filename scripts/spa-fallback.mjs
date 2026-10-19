// Emits the SPA deep-link fallback (www/404.html) for static hosts.
//
// GitHub Pages is a plain file server: /flet-box-docs/documentation has no
// such file, so it answers 404 — and while doing so it serves the project's
// 404.html *under the requested URL*. That is exactly what a pushState router
// needs: boot the app from 404.html, read the real path off location, render
// that route. This copy therefore has to be self-sufficient at any depth, so
// every relative reference is made absolute and the deployment prefix is
// published to the router as window.__FLETBOX_BASE__.
//
// Runs last in `npm run build`, after createBundle has written www/index.html
// (with the OTA loader entry) and copy-docs has added the markdown set.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const args = process.argv.slice(2);
const outDir = path.resolve(projectRoot, args.find((a) => !a.startsWith("--")) || "www");
const baseArg = args.find((a) => a.startsWith("--base="));

/**
 * Deployment prefix with a trailing slash: "/" when root-hosted.
 * Prefer an explicit --base, else the origin path of the OTA update url,
 * which points at the published site by definition.
 */
const resolveBase = async () => {
  if (baseArg) {
    const value = baseArg.slice("--base=".length);
    return value.endsWith("/") ? value : `${value}/`;
  }
  const config = JSON.parse(
    await readFile(path.join(outDir, "config.json"), "utf8"),
  );
  const url = config?.update?.url;
  if (!url) return "/";
  const { pathname } = new URL(url);
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

const source = path.join(outDir, "index.html");
const target = path.join(outDir, "404.html");
const html = await readFile(source, "utf8");
const base = await resolveBase();

const fallback = html
  // "./src/…", "./loader.js", the importmap's "./node_modules/…" — the only
  // relative references index.html carries.
  .replace(/(["'])\.\//g, `$1${base}`)
  // Registered from a deep URL, a bare "service-worker.js" would resolve into
  // the wrong folder and scope the worker there too.
  .replace(
    /register\((["'])service-worker\.js\1\)/g,
    `register($1${base}service-worker.js$1)`,
  )
  // Tell the router the prefix instead of letting it guess from the URL.
  .replace(
    "</head>",
    `    <script>window.__FLETBOX_BASE__ = "${base}";</script>\n  </head>`,
  );

await writeFile(target, fallback, "utf8");

const deepLinks = ["documentation", "about", "developer"].map(
  (route) => `${base}${route}`,
);
console.log(
  `🧭 SPA fallback written to ${target} (base "${base}"; serves ${deepLinks.join(", ")}).`,
);
