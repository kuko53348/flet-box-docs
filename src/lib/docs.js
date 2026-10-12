// lib/docs.js
// Cross-document navigation for the markdown viewer. The markdown files link
// to each other with plain relative paths (Button.md, ../README.md). The
// Markdown widget renders those as <a target="_blank>, so the browser would
// resolve them against the page URL, request the raw .md and 404. Instead of
// letting that happen we intercept the click and route through the app Router.

import { goTo } from "flet-box";

export const DOCS_DIR = "docs/";

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