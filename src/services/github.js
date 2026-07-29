/**
 * GitHub API Service Layer.
 *
 * Handles all interactions with the GitHub REST API for fetching
 * documentation content from the knowledge-base repository.
 *
 * This layer is responsible for:
 * - Authentication (via GITHUB_TOKEN)
 * - Fetching directory trees (recursive)
 * - Fetching raw file content
 * - Error handling and rate-limit awareness
 *
 * Consumers should use `services/docs.js` for business logic;
 * this module only handles raw GitHub I/O.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

/**
 * Builds common headers for GitHub API requests.
 * Includes authentication token if available.
 *
 * @returns {Record<string, string>}
 */
function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'knowledge-book',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Parses the repository slug from environment or returns default.
 *
 * @returns {{ owner: string, repo: string, branch: string }}
 */
function getRepoConfig() {
  const slug = process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_REPO || '';
  const parts = slug.split('/');

  return {
    owner: parts[0] || 'username',
    repo: parts[1] || 'knowledge-base',
    branch: process.env.KNOWLEDGE_BASE_BRANCH || 'main',
  };
}

/**
 * Fetches the full directory tree from the knowledge-base repository.
 * Uses the Git Trees API with `recursive=1` for a single-request fetch
 * of the entire repo structure.
 *
 * @returns {Promise<Array<{ path: string, type: string, size: number }>>}
 * @throws {Error} On API failure or rate limiting.
 */
export async function fetchRepoTree() {
  const { owner, repo, branch } = getRepoConfig();
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (response.status === 403 && remaining === '0') {
      throw new Error(
        '[github] Rate limit exceeded. Set GITHUB_TOKEN in .env.local to increase limits.'
      );
    }
    throw new Error(
      `[github] Failed to fetch repo tree: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Filter to only markdown/mdx files and directories
  return data.tree
    .filter(
      (item) => item.type === 'tree' || item.path.endsWith('.md') || item.path.endsWith('.mdx')
    )
    .map((item) => ({
      path: item.path,
      type: item.type === 'tree' ? 'directory' : 'file',
      size: item.size || 0,
    }));
}

/**
 * Fetches the raw content of a single file from the repository.
 *
 * @param {string} filePath - Path relative to repo root (e.g., "guides/setup.md").
 * @returns {Promise<string>} Raw file content as a string.
 * @throws {Error} On 404 or API failure.
 */
export async function fetchFileContent(filePath) {
  const { owner, repo, branch } = getRepoConfig();
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${filePath}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'knowledge-book',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(
      `[github] Failed to fetch file "${filePath}": ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

/**
 * Fetches commit metadata for a file to determine last updated date.
 *
 * @param {string} filePath - Path relative to repo root.
 * @returns {Promise<{ date: string, message: string } | null>}
 */
export async function fetchFileLastCommit(filePath) {
  const { owner, repo, branch } = getRepoConfig();
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(filePath)}&sha=${branch}&per_page=1`;

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const commits = await response.json();
  if (!commits.length) {
    return null;
  }

  return {
    date: commits[0].commit.committer.date,
    message: commits[0].commit.message,
  };
}
