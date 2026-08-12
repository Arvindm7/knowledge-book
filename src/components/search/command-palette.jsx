'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * CommandPalette — VS Code-inspired search modal powered by Pagefind.
 *
 * Features:
 * - Ctrl+K / Cmd+K keyboard shortcut
 * - Instant search with debounced Pagefind queries
 * - Highlighted match excerpts
 * - Keyboard navigation (Up/Down/Enter/Escape)
 * - Grouped sub-results per page
 * - Body scroll lock
 *
 * @param {object} props
 * @param {boolean} props.open - Controlled open state.
 * @param {function} props.onOpenChange - Callback to toggle open state.
 * @returns {React.ReactElement | null}
 */
export function CommandPalette({ open, onOpenChange }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const pagefindRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(false);

  // Initialize Pagefind lazily (ref-only, no setState)
  const initPagefind = useCallback(async () => {
    if (pagefindRef.current) return;

    try {
      const paths = ['/pagefind/pagefind.js', '/_pagefind/pagefind.js'];

      for (const path of paths) {
        try {
          const pagefind = await import(
            /* webpackIgnore: true */
            path
          );
          await pagefind.options({
            excerptLength: 20,
          });
          await pagefind.init();
          pagefindRef.current = pagefind;
          return;
        } catch {
          // Try next path
        }
      }
      // None of the paths worked
      pagefindRef.current = null;
    } catch {
      // Pagefind not available (dev mode or not yet indexed)
      pagefindRef.current = null;
    }
  }, []);

  // Adjust state during render when `open` prop changes (React-recommended pattern)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }

  // Handle open/close DOM side-effects
  useEffect(() => {
    if (open) {
      initPagefind();
      document.body.style.overflow = 'hidden';
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = '';
      };
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, initPagefind]);

  // Search with debounce
  useEffect(() => {
    if (!query.trim() || !pagefindRef.current) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    async function performSearch() {
      try {
        const search = await pagefindRef.current.debouncedSearch(query, {}, 150);

        if (search === null || cancelled) return; // debounced away

        // Load first 8 results' data
        const loaded = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));

        if (!cancelled) {
          setResults(loaded);
          setSelectedIndex(0);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setIsLoading(false);
        }
      }
    }

    performSearch();
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Navigate to result — strip .html extension from Pagefind URLs
  const navigateTo = useCallback(
    (url) => {
      // Pagefind returns URLs like /docs/foo.html or /docs/foo.html#heading
      // Next.js uses clean URLs, so strip the .html extension
      const cleanUrl = url.replace(/\.html(#|$)/, '$1');
      onOpenChange(false);
      router.push(cleanUrl);
    },
    [onOpenChange, router]
  );

  // Flatten results for keyboard navigation
  const flatItems = results.flatMap((result) => {
    if (result.sub_results?.length > 0) {
      return result.sub_results.map((sub) => ({
        title: sub.title,
        url: sub.url,
        excerpt: sub.excerpt,
        pageTitle: result.meta?.title || '',
      }));
    }
    return [
      {
        title: result.meta?.title || 'Untitled',
        url: result.url,
        excerpt: result.excerpt,
        pageTitle: '',
      },
    ];
  });

  // Keyboard navigation
  function handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          navigateTo(flatItems[selectedIndex].url);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-background shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <svg
            className="h-5 w-5 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 border-none bg-transparent py-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto overscroll-contain scrollbar-thin p-2"
        >
          {/* Loading state */}
          {isLoading && query.trim() && (
            <div className="flex items-center gap-3 px-3 py-6 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Searching...
            </div>
          )}

          {/* No results */}
          {!isLoading && query.trim() && flatItems.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No results for &ldquo;
                <span className="font-medium text-foreground">{query}</span>
                &rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Try different keywords or check spelling
              </p>
            </div>
          )}

          {/* Result items */}
          {flatItems.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              data-selected={index === selectedIndex}
              onClick={() => navigateTo(item.url)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors',
                index === selectedIndex
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              {/* Page title breadcrumb */}
              {item.pageTitle && item.title !== item.pageTitle && (
                <span className="text-xs text-muted-foreground/60">{item.pageTitle}</span>
              )}

              {/* Result title */}
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">{item.title}</span>
                {index === selectedIndex && (
                  <svg
                    className="ml-auto h-4 w-4 text-muted-foreground/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              {/* Excerpt with highlighted matches */}
              {item.excerpt && (
                <p
                  className="line-clamp-2 text-xs leading-relaxed text-muted-foreground [&>mark]:rounded [&>mark]:bg-primary/20 [&>mark]:px-0.5 [&>mark]:text-primary [&>mark]:font-medium"
                  dangerouslySetInnerHTML={{ __html: item.excerpt }}
                />
              )}
            </button>
          ))}

          {/* Empty state (no query) */}
          {!query.trim() && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Type to search across all documentation
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
                    ↵
                  </kbd>
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
                    esc
                  </kbd>
                  Close
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {flatItems.length > 0 && (
          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground/60">
            <span>{flatItems.length} results</span>
            <span className="float-right">
              Powered by{' '}
              <a
                href="https://pagefind.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Pagefind
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
