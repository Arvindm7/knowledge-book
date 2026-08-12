/**
 * Content Service — Dual-Mode Content Access Layer.
 *
 * This module abstracts where content comes from:
 *
 * **Build mode** (CI / `npm run build`):
 *   Reads from the local `.content/` directory populated by
 *   `scripts/generate-content.mjs`. Uses pre-generated JSON manifests
 *   for routes, sidebar, and metadata. Reads raw markdown from disk.
 *
 * **Dev mode** (`npm run dev`):
 *   Falls back to the GitHub API via `services/github.js` when
 *   no local content directory exists. This provides a zero-setup
 *   developer experience — just set env vars and run dev.
 *
 * The service layer (`services/docs.js`) consumes this module
 * without knowing which mode is active.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, '.content', 'knowledge-base');
const GENERATED_DIR = path.join(ROOT_DIR, '.content', 'generated');

/**
 * Checks if generated content manifests exist.
 *
 * Returns true when the generated manifests (routes, sidebar, metadata)
 * are available — regardless of whether the raw content directory is at
 * the default `.content/knowledge-base/` path or an external location.
 *
 * @returns {boolean}
 */
export function hasLocalContent() {
  return (
    fs.existsSync(path.join(GENERATED_DIR, 'routes.json')) &&
    fs.existsSync(path.join(GENERATED_DIR, 'sidebar.json')) &&
    fs.existsSync(path.join(GENERATED_DIR, 'metadata.json'))
  );
}

/**
 * Reads a pre-generated JSON manifest.
 *
 * @param {string} name - Manifest filename (e.g., 'routes.json').
 * @returns {any} Parsed JSON content.
 */
function readManifest(name) {
  const filePath = path.join(GENERATED_DIR, name);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Build Mode — Local File System
// ---------------------------------------------------------------------------

/**
 * Returns the navigation tree from the generated sidebar manifest.
 *
 * @returns {Array} Navigation tree nodes.
 */
export function getLocalSidebar() {
  return readManifest('sidebar.json');
}

/**
 * Returns all route slugs from the generated routes manifest.
 *
 * @returns {Array<{ slug: string, filePath: string }>}
 */
export function getLocalRoutes() {
  return readManifest('routes.json');
}

/**
 * Returns metadata for all pages from the generated metadata manifest.
 *
 * @returns {Record<string, object>} Keyed by slug.
 */
export function getLocalMetadata() {
  return readManifest('metadata.json');
}

/**
 * Reads raw file content from the local content directory.
 *
 * @param {string} filePath - Path relative to content root.
 * @returns {string | null} File content, or null if not found.
 */
export function getLocalFileContent(filePath) {
  const absolutePath = path.join(CONTENT_DIR, filePath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return fs.readFileSync(absolutePath, 'utf-8');
}

/**
 * Gets the file tree from the local content directory.
 * Mirrors the shape returned by github.js fetchRepoTree().
 *
 * @returns {Array<{ path: string, type: string, size: number }>}
 */
export function getLocalTree() {
  const results = [];

  function walk(dir, relativeTo) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const abs = path.join(dir, entry.name);
      const rel = path.relative(relativeTo, abs).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        results.push({ path: rel, type: 'directory', size: 0 });
        walk(abs, relativeTo);
      } else if (/\.(md|mdx)$/i.test(entry.name)) {
        const stat = fs.statSync(abs);
        results.push({ path: rel, type: 'file', size: stat.size });
      }
    }
  }

  walk(CONTENT_DIR, CONTENT_DIR);
  return results;
}

/**
 * Returns build info (generation timestamp, counts) if available.
 *
 * @returns {{ generatedAt: string, totalFiles: number, totalDirectories: number, repo: string|null, branch: string } | null}
 */
export function getLocalBuildInfo() {
  const infoPath = path.join(GENERATED_DIR, 'build-info.json');
  if (!fs.existsSync(infoPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
  } catch {
    return null;
  }
}
