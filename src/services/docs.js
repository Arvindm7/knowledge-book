/**
 * Documentation Service Layer.
 *
 * Business logic for the documentation engine. Translates content
 * (from local files or GitHub API) into structured documentation
 * objects used by the UI.
 *
 * **Dual-mode operation:**
 * - Build mode: Uses pre-generated manifests from `.content/generated/`
 * - Dev mode: Falls back to GitHub API calls
 *
 * Responsibilities:
 * - Building the navigation tree from the repo directory structure
 * - Resolving slugs to file paths
 * - Extracting frontmatter metadata
 * - Calculating reading time
 * - Generating breadcrumbs
 * - Computing previous/next pagination
 */

import matter from 'gray-matter';
import readingTime from 'reading-time';
import {
  hasLocalContent,
  getLocalSidebar,
  getLocalRoutes,
  getLocalMetadata,
  getLocalFileContent,
  getLocalTree,
} from './content';
import { fetchRepoTree, fetchFileContent, fetchFileLastCommit } from './github';

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function slugifySegment(segment) {
  return stripOrderPrefix(segment).replace(/\s+/g, '-').toLowerCase();
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

function nameToTitle(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractOrder(name) {
  const match = name.match(/^(\d+)[-_]/);
  return match ? parseInt(match[1], 10) : Infinity;
}

function stripOrderPrefix(name) {
  return name.replace(/^\d+[-_]/, '');
}

// ---------------------------------------------------------------------------
// Content Source Abstraction
// ---------------------------------------------------------------------------

/**
 * Gets the content tree — local FS in build mode, GitHub API in dev mode.
 */
async function getContentTree() {
  if (hasLocalContent()) {
    return getLocalTree();
  }
  return fetchRepoTree();
}

/**
 * Gets raw file content — local FS in build mode, GitHub API in dev mode.
 */
async function getFileContent(filePath) {
  if (hasLocalContent()) {
    return getLocalFileContent(filePath);
  }
  return fetchFileContent(filePath);
}

/**
 * Gets file last commit info — only available in dev mode (via API).
 * In build mode, uses metadata manifest.
 */
async function getLastUpdated(filePath, slug) {
  if (hasLocalContent()) {
    const metadata = getLocalMetadata();
    return metadata[slug]?.lastUpdated || null;
  }
  const commit = await fetchFileLastCommit(filePath);
  return commit?.date || null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds a nested navigation tree.
 *
 * In build mode, returns the pre-generated sidebar manifest directly.
 * In dev mode, builds it from the GitHub API tree.
 */
export async function getDocsNavigationTree() {
  // Build mode — use pre-generated sidebar
  if (hasLocalContent()) {
    return getLocalSidebar();
  }

  // Dev mode — build from GitHub API
  const tree = await getContentTree();
  const files = tree.filter((item) => item.type === 'file');
  const directories = tree.filter((item) => item.type === 'directory').map((d) => d.path);

  const nodeMap = new Map();

  for (const dirPath of directories) {
    const parts = dirPath.split('/');
    const name = parts[parts.length - 1];
    const slug = dirPath.split('/').map(slugifySegment).join('/');

    nodeMap.set(dirPath, {
      title: nameToTitle(stripOrderPrefix(name)),
      slug,
      isDirectory: true,
      children: [],
      order: extractOrder(name),
    });
  }

  for (const file of files) {
    const parts = file.path.split('/');
    const fileName = parts[parts.length - 1];
    const baseName = fileName.replace(/\.(mdx?|md)$/, '');
    const parentDir = parts.length > 1 ? parts.slice(0, -1).join('/') : null;

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
    const slug = file.path
      .replace(/\.(mdx?|md)$/, '')
      .split('/')
      .map(slugifySegment)
      .join('/');

    const fileNode = {
      title: nameToTitle(cleanName),
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

  function sortNodes(nodes) {
    nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    for (const node of nodes) {
      if (node.children.length > 0) sortNodes(node.children);
    }
  }

  const rootNodes = Array.from(nodeMap.values());
  sortNodes(rootNodes);
  return rootNodes;
}

/**
 * Flattens the navigation tree into an ordered array for prev/next pagination.
 */
export function flattenNavTree(tree) {
  const result = [];

  function walk(nodes) {
    for (const node of nodes) {
      if (!node.isDirectory) {
        result.push({ title: node.title, slug: node.slug });
      } else if (node.hasIndex) {
        result.push({ title: node.title, slug: node.slug });
      }
      if (node.children?.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return result;
}

/**
 * Resolves a URL slug to the actual file path.
 */
function resolveSlugToPath(slug, tree) {
  const files = tree.filter((item) => item.type === 'file');
  const slugMap = new Map();

  for (const file of files) {
    const fileSlug = pathToSlug(file.path);
    slugMap.set(fileSlug, file.path);
  }

  return slugMap.get(slug || '') || null;
}

/**
 * Resolves a directory slug to the first child page slug.
 * Used when navigating to a folder that has no index.md — redirects to
 * the first leaf page within that folder.
 *
 * @param {string} slug - The directory slug to resolve.
 * @param {Array} navTree - The navigation tree from getDocsNavigationTree().
 * @returns {string | null} First child page slug, or null if not found.
 */
export function findFirstPageInDir(slug, navTree) {
  function findNode(nodes) {
    for (const node of nodes) {
      if (node.slug === slug && node.isDirectory) return node;
      if (node.children?.length > 0) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  function findFirstLeaf(node) {
    if (!node.isDirectory) return node.slug;
    if (node.children?.length > 0) {
      for (const child of node.children) {
        const leaf = findFirstLeaf(child);
        if (leaf) return leaf;
      }
    }
    return null;
  }

  const dirNode = findNode(navTree);
  if (!dirNode) return null;
  return findFirstLeaf(dirNode);
}

/**
 * Fetches and parses a single documentation page by its URL slug.
 */
export async function getDocBySlug(slug) {
  const tree = await getContentTree();
  const filePath = resolveSlugToPath(slug, tree);

  if (!filePath) return null;

  const rawFile = await getFileContent(filePath);
  if (!rawFile) return null;

  const { data: frontmatter, content: rawContent } = matter(rawFile);
  const stats = readingTime(rawContent);
  const lastUpdated = await getLastUpdated(filePath, slug || '');
  const breadcrumbs = generateBreadcrumbs(slug);

  const navTree = await getDocsNavigationTree();
  const flatNav = flattenNavTree(navTree);
  const currentSlug = slug || '';
  const currentIndex = flatNav.findIndex((item) => item.slug === currentSlug);
  const prev = currentIndex > 0 ? flatNav[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < flatNav.length - 1 ? flatNav[currentIndex + 1] : null;

  const slugParts = (slug || 'index').split('/');
  const fallbackTitle = nameToTitle(stripOrderPrefix(slugParts[slugParts.length - 1]));

  return {
    slug: slug || '',
    rawContent,
    frontmatter,
    title: frontmatter.title || fallbackTitle,
    description: frontmatter.description || '',
    readingTimeMinutes: Math.ceil(stats.minutes),
    lastUpdated,
    breadcrumbs,
    prev,
    next,
  };
}

/**
 * Generates breadcrumb items from a slug.
 */
export function generateBreadcrumbs(slug) {
  const crumbs = [{ label: 'Docs', href: '/docs' }];
  if (!slug) return crumbs;

  const parts = slug.split('/');
  let accumulated = '';

  for (const part of parts) {
    accumulated += (accumulated ? '/' : '') + part;
    crumbs.push({
      label: nameToTitle(part),
      href: `/docs/${accumulated}`,
    });
  }

  return crumbs;
}

/**
 * Returns all valid doc slugs for static generation.
 *
 * In build mode, uses the pre-generated routes manifest.
 * In dev mode, computes from the GitHub API tree.
 */
export async function getAllDocSlugs() {
  if (hasLocalContent()) {
    const routes = getLocalRoutes();
    return routes.map((r) => r.slug);
  }

  const tree = await getContentTree();
  const files = tree.filter((item) => item.type === 'file');

  return files.map((file) => pathToSlug(file.path));
}
