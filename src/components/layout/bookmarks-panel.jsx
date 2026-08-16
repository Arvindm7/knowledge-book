'use client';

/**
 * BookmarksPanel — Slide-out sheet listing all saved bookmarks.
 *
 * Features:
 * - Opens from a bookmark icon in the navbar
 * - Shows all bookmarks (no limit)
 * - Live filter/search within bookmarks
 * - Remove individual bookmarks
 * - Clear all bookmarks
 * - Badge showing total count on the trigger button
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookmarks } from '@/hooks/use-bookmarks';

// ─── Icons ────────────────────────────────────────────────────────────────────

function BookmarkIcon({ filled, ...props }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Panel Content ─────────────────────────────────────────────────────────────

function PanelContent({ onNavigate }) {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return bookmarks;
    const q = query.toLowerCase();
    return bookmarks.filter((b) => b.title.toLowerCase().includes(q));
  }, [bookmarks, query]);

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    bookmarks.forEach((b) => removeBookmark(b.slug));
    setConfirmClear(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter bookmarks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {bookmarks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <BookmarkIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the bookmark button on any doc page to save it here.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* No results */
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No bookmarks match &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <ul className="space-y-1">
              {filtered.map((bm) => (
                <motion.li
                  key={bm.slug}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
                    {/* Bookmark accent */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                      <BookmarkIcon filled className="h-4 w-4 text-amber-500" />
                    </div>

                    {/* Title + date */}
                    <Link href={`/docs/${bm.slug}`} onClick={onNavigate} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {bm.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        Saved{' '}
                        {new Date(bm.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>

                    {/* Go arrow (visible on hover) */}
                    <Link
                      href={`/docs/${bm.slug}`}
                      onClick={onNavigate}
                      className="hidden shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity sm:block"
                      aria-label={`Open ${bm.title}`}
                    >
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => removeBookmark(bm.slug)}
                      className="shrink-0 rounded p-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      aria-label={`Remove bookmark for ${bm.title}`}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>

      {/* Footer: count + clear all */}
      {bookmarks.length > 0 && (
        <div className="border-t border-border/40 px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
            {filtered.length !== bookmarks.length && ` · ${filtered.length} shown`}
          </span>
          <button
            onClick={handleClearAll}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              confirmClear
                ? 'bg-destructive/10 text-destructive border border-destructive/30'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            {confirmClear ? 'Tap again to confirm' : 'Clear all'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Trigger Button ────────────────────────────────────────────────────────────

/**
 * BookmarksTrigger — Button for the navbar that opens the bookmarks panel.
 * Shows a badge with the total bookmark count.
 */
export function BookmarksTrigger({ onClick }) {
  const { bookmarks } = useBookmarks();
  const count = bookmarks.length;

  return (
    <button
      onClick={onClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Bookmarks (${count})`}
    >
      <BookmarkIcon filled={count > 0} className="h-5 w-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-0.5 text-[10px] font-bold text-white leading-none"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

/**
 * BookmarksPanel — The full slide-out sheet.
 */
export function BookmarksPanel({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 p-0 flex flex-col">
        <SheetHeader className="border-b border-border/40 px-4 py-4 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <BookmarkIcon filled className="h-4 w-4 text-amber-500" />
            Bookmarks
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <PanelContent onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
