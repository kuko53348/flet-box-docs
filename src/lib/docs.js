// lib/docs.js
// Cross-document navigation for the markdown viewer. The markdown files link
// to each other with plain relative paths (Button.md, ../README.md). The
// Markdown widget renders those as <a target="_blank>, so the browser would
// resolve them against the page URL, request the raw .md and 404. Instead of
// letting that happen we intercept the click and route through the app Router.

import { getBasePath, goTo } from "flet-box";

export const DOCS_DIR = "docs/";

// Absolute URL for a document path, rooted at the deployed app base.
//
// The address bar is not a usable anchor: GitHub Pages serves this site under
// /flet-box-docs/, the router rewrites it with app-relative routes, and an SPA
// fallback entry can even land on a deep folder that has no docs/ next to it.
// The router knows the real deployment prefix, and asking it per call matters
// because the prefix is only resolved when the app boots.
export const docUrl = (path) =>
  typeof window === "undefined"
    ? path
    : new URL(path, `${window.location.origin}${getBasePath()}/`).href;

// An installed app carries the docs folder as it was when its APK/IPA was built,
// and OTA replaces only the bundle — so a page added since then is listed in the
// catalog but missing on disk. Read documents from the published source named by
// config.json, and keep what the device already has as the offline fallback.
const DOC_CACHE = "fletbox-docs";
const DOC_SOURCE_KEY = "fletbox-docs-source";

let publishedDocsUrl;

const publishedDocs = async () => {
  if (publishedDocsUrl !== undefined) return publishedDocsUrl;
  // Seed from the last online launch: offline, config.json is unreachable, and
  // without the source URL the cached copy of the document is unfindable.
  publishedDocsUrl = globalThis.localStorage?.getItem(DOC_SOURCE_KEY) || null;
  const configUrl = docUrl("config.json");
  try {
    const res = await fetch(configUrl, { cache: "no-store" });
    const url = res.ok ? (await res.json()).update?.url : null;
    if (url) {
      publishedDocsUrl = new URL(url, configUrl).href;
      globalThis.localStorage?.setItem(DOC_SOURCE_KEY, publishedDocsUrl);
    }
  } catch {
    // No readable config: the snapshot on disk is all there is.
  }
  return publishedDocsUrl;
};

export const fetchDoc = async (path) => {
  const source = await publishedDocs();
  const url = source ? new URL(path, source).href : null;
  if (url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if ("caches" in window) {
          const cache = await caches.open(DOC_CACHE);
          await cache.put(
            url,
            new Response(text, { headers: { "Content-Type": "text/markdown" } }),
          );
        }
        return text;
      }
    } catch {
      // Offline, or a host without CORS for this origin — use local copies.
    }
    if ("caches" in window) {
      const hit = await (await caches.open(DOC_CACHE)).match(url);
      if (hit) return hit.text();
    }
  }
  const local = await fetch(docUrl(path));
  if (!local.ok) throw new Error(`Failed to load ${path}`);
  return local.text();
};

// Path of the document currently on screen. Kept in this module (outside any
// render) because the body is rebuilt on navigation while the click listener
// below is registered once.
export let currentDocPath = "";

// overview.md is the framework README, which links from the repository root
// (docs/guides/state.md). Its own directory is already docs/, so those land in
// docs/docs/; drop the extra prefix to map them onto this app's layout.
export const resolveDocPath = (href, fromPath) => {
  const resolved = decodeURIComponent(
    new URL(href, `https://docs.invalid/${fromPath}`).pathname,
  ).replace(/^\/+/, "");
  return resolved.startsWith(`${DOCS_DIR}${DOCS_DIR}`)
    ? resolved.slice(DOCS_DIR.length)
    : resolved;
};

export const docLabel = (path) => path.split("/").pop().replace(/\.md$/, "");

// Record which document is on screen so relative links resolve from here.
export const setCurrentDocPath = (path) => {
  currentDocPath = path || "";
};

// Navigate to the viewer for a given markdown path.
export const openDoc = ({ path, name, categoryId }) => {
  currentDocPath = path;
  const query = new URLSearchParams({
    path,
    ...(name ? { name } : {}),
    ...(categoryId ? { cat: categoryId } : {}),
  });
  goTo(`/doc?${query.toString()}`);
};

let linksBound = false;

// Wire the delegated document-level click handler once. It resolves markdown
// hrefs against the directory of the doc currently on screen.
export const bindDocLinks = () => {
  if (linksBound) return;
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
};