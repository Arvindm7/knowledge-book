/**
 * Application-wide constants.
 * Centralized here to avoid magic strings scattered across the codebase.
 */

/** Available theme modes for the application. */
export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

/** Responsive breakpoints (in px) matching Tailwind v4 defaults. */
export const BREAKPOINTS = Object.freeze({
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
});

/** Navigation section identifiers for sidebar/content linking. */
export const NAV_SECTIONS = Object.freeze({
  GETTING_STARTED: 'getting-started',
  GUIDES: 'guides',
  API_REFERENCE: 'api-reference',
});

/** External link targets. */
export const EXTERNAL_LINKS = Object.freeze({
  GITHUB: 'https://github.com',
});
