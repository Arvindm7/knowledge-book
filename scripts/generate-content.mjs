#!/usr/bin/env node

/**
 * Content Generation Pipeline.
 *
 * This script runs at build time (before `next build`) to:
 * 1. Clone or locate the knowledge-base repository content.
 * 2. Walk the file tree and discover all markdown/MDX files.
 * 3. Extract frontmatter metadata from each file.
 * 4. Generate three JSON manifests:
 *    - routes.json   — all slugs for generateStaticParams
 *    - sidebar.json  — nested navigation tree
 *    - metadata.json — per-page frontmatter, reading time, file paths
 *
 * Usage:
 *   node scripts/generate-content.mjs
 *
 * Environment:
 *   CONTENT_DIR — Path to content directory (default: .content/knowledge-base)
 *   KNOWLEDGE_BASE_REPO — GitHub repo slug for cloning (e.g., "user/knowledge-base")
 *   GITHUB_TOKEN — Token for cloning private repos
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT_DIR = process.cwd();
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(ROOT_DIR, '.content', 'knowledge-base');
const OUTPUT_DIR = path.join(ROOT_DIR, '.content', 'generated');
const REPO_SLUG = process.env.KNOWLEDGE_BASE_REPO || process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_REPO || '';
const BRANCH = process.env.KNOWLEDGE_BASE_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// ---------------------------------------------------------------------------
// Step 1: Clone or verify content directory
// ---------------------------------------------------------------------------

function ensureContentDirectory() {
  if (fs.existsSync(CONTENT_DIR)) {
    console.log(`✓ Content directory exists: ${CONTENT_DIR}`);
    return;
  }

  if (!REPO_SLUG) {
    console.warn(
      '⚠ No content directory found and KNOWLEDGE_BASE_REPO is not set.\n' +
      '  Generating empty manifests. Content will fall back to GitHub API at runtime.\n' +
      '  To use local content, clone the knowledge-base repo into .content/knowledge-base/\n' +
      '  or set KNOWLEDGE_BASE_REPO=username/repo-name'
    );

    // Generate empty manifests so the build can proceed
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'routes.json'), '[]');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sidebar.json'), '[]');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), '{}');
    console.log('✓ Empty manifests generated');
    process.exit(0);
  }

  console.log(`↓ Cloning ${REPO_SLUG} (branch: ${BRANCH}) ...`);

  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(CONTENT_DIR), { recursive: true });

  const cloneUrl = GITHUB_TOKEN
    ? `https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_SLUG}.git`
    : `https://github.com/${REPO_SLUG}.git`;

  try {
    execSync(
      `git clone --depth 1 --branch ${BRANCH} "${cloneUrl}" "${CONTENT_DIR}"`,
      { stdio: 'pipe' }
    );
    console.log('✓ Clone successful');
  } catch (error) {
    console.error(`✗ Failed to clone: ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Step 2: Walk file tree
// ---------------------------------------------------------------------------

/**
 * Recursively discovers all markdown files and directories.
 *
 * @param {string} dir - Directory to scan.
 * @param {string} [relativeTo] - Base path for relative paths.
 * @returns {Array<{ path: string, type: 'file' | 'directory', absolutePath: string }>}
 */
function walkTree(dir, relativeTo = dir) {
  const results = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files/dirs and non-content
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.relative(relativeTo, absolutePath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      results.push({ path: relativePath, type: 'directory', absolutePath });
      results.push(...walkTree(absolutePath, relativeTo));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push({ path: relativePath, type: 'file', absolutePath });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Step 3: Helper utilities (shared with services/docs.js logic)
// ---------------------------------------------------------------------------

function stripOrderPrefix(name) {
  return name.replace(/^\d+[-_]/, '');
}

function slugifySegment(segment) {
  return stripOrderPrefix(segment)
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function extractOrder(name) {
  const match = name.match(/^(\d+)[-_]/);
  return match ? parseInt(match[1], 10) : Infinity;
}

function nameToTitle(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pathToSlug(filePath) {
  return filePath
    .replace(/\.(mdx?|md)$/, '')
    .split('/')
    .map(slugifySegment)
    .join('/')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
    .replace(/\/readme$/i, '')
    .replace(/^readme$/i, '');
}

// ---------------------------------------------------------------------------
// Step 4: Generate manifests
// ---------------------------------------------------------------------------

function generateManifests(tree) {
  const files = tree.filter((item) => item.type === 'file');
  const directories = tree.filter((item) => item.type === 'directory');

  // ---- routes.json ----
  const routes = files.map((file) => {
    const slug = pathToSlug(file.path);
    return { slug, filePath: file.path };
  });

  // ---- metadata.json ----
  const metadata = {};
  for (const file of files) {
    const slug = pathToSlug(file.path);
    const raw = fs.readFileSync(file.absolutePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);
    const stats = readingTime(content);

    // Get file modification time as fallback for lastUpdated
    const stat = fs.statSync(file.absolutePath);

    const parts = file.path.split('/');
    const fileName = parts[parts.length - 1];
    const baseName = fileName.replace(/\.(mdx?|md)$/, '');
    const cleanBaseName = baseName.toLowerCase();
    const isIndexFile = cleanBaseName === 'index' || cleanBaseName === 'readme';
    const cleanName = stripOrderPrefix(isIndexFile ? (parts[parts.length - 2] || 'index') : baseName);

    metadata[slug] = {
      slug,
      filePath: file.path,
      title: frontmatter.title || nameToTitle(cleanName),
      description: frontmatter.description || '',
      difficulty: frontmatter.difficulty || null,
      tags: frontmatter.tags || [],
      readingTimeMinutes: Math.ceil(stats.minutes),
      lastUpdated: frontmatter.date || stat.mtime.toISOString(),
      frontmatter,
    };
  }

  // ---- sidebar.json (navigation tree) ----
  const nodeMap = new Map();

  // Create directory nodes
  for (const dir of directories) {
    const parts = dir.path.split('/');
    const name = parts[parts.length - 1];
    const slug = dir.path.split('/').map(slugifySegment).join('/');

    nodeMap.set(dir.path, {
      title: nameToTitle(stripOrderPrefix(name)),
      slug,
      isDirectory: true,
      hasIndex: false,
      children: [],
      order: extractOrder(name),
    });
  }

  // Create file nodes
  for (const file of files) {
    const parts = file.path.split('/');
    const fileName = parts[parts.length - 1];
    const baseName = fileName.replace(/\.(mdx?|md)$/, '');
    const parentDir = parts.length > 1 ? parts.slice(0, -1).join('/') : null;
    const slug = pathToSlug(file.path);

    // index/readme files represent the directory
    const isIndex =
      baseName.toLowerCase() === 'index' ||
      baseName.toLowerCase() === 'readme' ||
      stripOrderPrefix(baseName).toLowerCase() === 'index';

    if (isIndex) {
      if (parentDir && nodeMap.has(parentDir)) {
        nodeMap.get(parentDir).hasIndex = true;
      }
      continue;
    }

    const cleanName = stripOrderPrefix(baseName);
    const fileNode = {
      title: metadata[slug]?.title || nameToTitle(cleanName),
      slug,
      isDirectory: false,
      children: [],
      order: extractOrder(baseName),
    };

    if (parentDir && nodeMap.has(parentDir)) {
      nodeMap.get(parentDir).children.push(fileNode);
    } else {
      nodeMap.set(file.path, fileNode);
    }
  }

  // Nest directories into parents
  for (const [dirPath, dirNode] of nodeMap) {
    const parts = dirPath.split('/');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('/');
      if (nodeMap.has(parentPath)) {
        nodeMap.get(parentPath).children.push(dirNode);
        nodeMap.delete(dirPath);
      }
    }
  }

  // Sort recursively
  function sortNodes(nodes) {
    nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    for (const node of nodes) {
      if (node.children.length > 0) sortNodes(node.children);
    }
  }

  const sidebar = Array.from(nodeMap.values());
  sortNodes(sidebar);

  return { routes, sidebar, metadata };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n📚 Knowledge Book — Content Generation Pipeline\n');
  console.log('─'.repeat(50));

  // Step 1: Ensure content
  ensureContentDirectory();

  // Step 2: Walk tree
  console.log('→ Scanning content directory...');
  const tree = walkTree(CONTENT_DIR);
  const fileCount = tree.filter((i) => i.type === 'file').length;
  const dirCount = tree.filter((i) => i.type === 'directory').length;
  console.log(`  Found ${fileCount} files in ${dirCount} directories`);

  if (fileCount === 0) {
    console.warn('⚠ No markdown files found. Generating empty manifests.');
  }

  // Step 3: Generate manifests
  console.log('→ Generating manifests...');
  const { routes, sidebar, metadata } = generateManifests(tree);

  // Step 4: Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'routes.json'),
    JSON.stringify(routes, null, 2)
  );
  console.log(`  ✓ routes.json    (${routes.length} routes)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'sidebar.json'),
    JSON.stringify(sidebar, null, 2)
  );
  console.log(`  ✓ sidebar.json   (${sidebar.length} top-level items)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log(`  ✓ metadata.json  (${Object.keys(metadata).length} pages)`);

  console.log('\n─'.repeat(50));
  console.log('✅ Content generation complete!\n');
}

main();
