import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * @param  {...(string|object|array)} inputs - Class values to merge.
 * @returns {string} Merged class string.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', 'px-6')
 * // → 'py-2 bg-primary px-6' (px-6 overrides px-4)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
