// Copies the documentation set into the bundle output.
//
// `flet-box createBundle` only preserves index.html, manifest.json, run.sh,
// service-worker.js, assets/ and src/{modules,screens,database,components}, so a
// root-level docs/ folder would be missing from www/ and every fetch would 404
// inside the Capacitor WebView. This runs right after the bundle is written.
import { access, cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(projectRoot, "docs");
const targetDir = path.resolve(projectRoot, process.argv[2] || "www", "docs");

try {
  await access(sourceDir);
} catch {
  throw new Error(
    `Missing ${sourceDir}. Copy the flet-box docs folder into the project root.`,
  );
}

await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });

const copied = await readdir(targetDir, { recursive: true });
const markdown = copied.filter((entry) => String(entry).endsWith(".md"));

console.log(
  `📄 Docs copied to ${targetDir} (${markdown.length} markdown file(s)).`,
);