/**
 * Environment variable accessor with runtime validation.
 *
 * Centralizes all env var access so that:
 * 1. Missing required vars fail fast with clear error messages.
 * 2. Optional vars have documented defaults.
 * 3. No raw `process.env` access is scattered across the codebase.
 */

/**
 * Retrieves a required environment variable.
 * Throws if the variable is not set (fail-fast principle).
 *
 * @param {string} key - The environment variable name.
 * @returns {string} The environment variable value.
 * @throws {Error} If the variable is not defined.
 */
export function getRequiredEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `[env] Missing required environment variable: ${key}. ` +
        `Check your .env.local file or deployment configuration.`
    );
  }
  return value;
}

/**
 * Retrieves an optional environment variable with a fallback.
 *
 * @param {string} key - The environment variable name.
 * @param {string} [fallback=''] - Default value if not set.
 * @returns {string} The environment variable value or the fallback.
 */
function getOptionalEnv(key, fallback = '') {
  return process.env[key] || fallback;
}

/**
 * Validated environment configuration.
 * Access environment variables through this object, never via raw `process.env`.
 */
export const env = Object.freeze({
  /** Base URL for the deployed site. */
  get siteUrl() {
    return getOptionalEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
  },

  /** GitHub repository slug for the knowledge-base content source. */
  get knowledgeBaseRepo() {
    return getOptionalEnv('NEXT_PUBLIC_KNOWLEDGE_BASE_REPO', '');
  },

  /** GitHub Personal Access Token for API authentication. */
  get githubToken() {
    return getOptionalEnv('GITHUB_TOKEN', '');
  },

  /** Branch to fetch content from in the knowledge-base repo. */
  get knowledgeBaseBranch() {
    return getOptionalEnv('KNOWLEDGE_BASE_BRANCH', 'main');
  },

  /** Google Analytics measurement ID. */
  get gaId() {
    return getOptionalEnv('NEXT_PUBLIC_GA_ID', '');
  },

  /** Whether the app is running in production. */
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  /** Whether the app is running in development. */
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
});
