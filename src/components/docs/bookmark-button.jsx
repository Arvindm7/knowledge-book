'use client';

/**
 * BookmarkButton — Toggle bookmark for the current doc page.
 *
 * Uses the useBookmarks hook (localStorage) to persist state.
 * Shows a filled/outlined bookmark icon with animated transition.
 */

import { useBookmarks } from '@/hooks/use-bookmarks';
import { motion, AnimatePresence } from 'framer-motion';

export function BookmarkButton({ slug, title, className = '' }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(slug);

  return (
    <button
      onClick={() => toggleBookmark(slug, title)}
      className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
        bookmarked
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'border-border bg-background text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400'
      } ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {bookmarked ? (
          <motion.svg
            key="filled"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="outline"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
